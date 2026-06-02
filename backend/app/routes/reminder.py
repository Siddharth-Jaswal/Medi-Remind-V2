from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from app.database import db
from app.services.auth_service import get_current_user
from app.models.reminder import Reminder

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])

@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verify the reminder exists and belongs to the user
        result = await db.db["reminders"].delete_one({
            "_id": reminder_id,
            "user_id": str(current_user["_id"])
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Reminder not found or unauthorized")
            
        return {"status": "success", "message": "Reminder deleted successfully"}
    except Exception as e:
        print(f"Error deleting reminder: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{reminder_id}/toggle")
async def toggle_reminder(
    reminder_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Find the reminder
        reminder = await db.db["reminders"].find_one({
            "_id": reminder_id,
            "user_id": str(current_user["_id"])
        })
        
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found or unauthorized")
            
        # Toggle the active status
        new_status = not reminder.get("active", True)
        
        await db.db["reminders"].update_one(
            {"_id": reminder_id},
            {"$set": {"active": new_status}}
        )
        
        return {"status": "success", "active": new_status, "message": "Reminder toggled successfully"}
    except Exception as e:
        print(f"Error toggling reminder: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class AddReminderRequest(BaseModel):
    medicine_id: str
    reminder_time: str

@router.post("/")
async def add_reminder(
    request: AddReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verify that the medicine belongs to a prescription owned by the user
        medicine = await db.db["medicines"].find_one({"_id": request.medicine_id})
        if not medicine:
            raise HTTPException(status_code=404, detail="Medicine not found")
            
        prescription = await db.db["prescriptions"].find_one({
            "_id": medicine["prescription_id"],
            "user_id": str(current_user["_id"])
        })
        
        if not prescription:
            raise HTTPException(status_code=403, detail="Unauthorized to add reminder for this medicine")
            
        # Create the reminder
        new_reminder = Reminder(
            user_id=str(current_user["_id"]),
            medicine_id=request.medicine_id,
            reminder_time=request.reminder_time,
            active=True
        )
        
        result = await db.db["reminders"].insert_one(new_reminder.model_dump(by_alias=True))
        
        return {
            "status": "success", 
            "message": "Reminder added successfully",
            "reminder": {
                "id": str(result.inserted_id),
                "time": new_reminder.reminder_time,
                "active": new_reminder.active
            }
        }
    except Exception as e:
        print(f"Error adding reminder: {e}")
        raise HTTPException(status_code=500, detail=str(e))
