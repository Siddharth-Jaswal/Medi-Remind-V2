import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Dict, Any

from app.services.llm_service import extract_medicines_from_image
from app.models.prescription import Prescription
from app.database import db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/prescription", tags=["Prescription"])

@router.post("/upload")
async def upload_prescription(
    password: str = Form(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Verify Upload Password
    expected_password = os.getenv("UPLOAD_PASSWORD")
    if not expected_password:
        raise HTTPException(status_code=500, detail="Server misconfiguration: UPLOAD_PASSWORD not set.")
    if password != expected_password:
        raise HTTPException(status_code=403, detail="Invalid upload password.")

    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        # Read the file bytes
        image_bytes = await image.read()
        
        # Call LLM Gateway Service
        extracted_medicines = await extract_medicines_from_image(image_bytes, image.filename)

        # Create Prescription record
        new_prescription = Prescription(
            user_id=str(current_user["_id"]),
            filename=image.filename,
            extracted=True
        )
        
        # Save to MongoDB
        await db.db["prescriptions"].insert_one(new_prescription.model_dump(by_alias=True))
        
        # Return structured response
        return {
            "status": "success",
            "prescription_id": new_prescription.id,
            "medicines": extracted_medicines
        }

    except Exception as e:
        print(f"Error processing prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel, Field

class MedicineInput(BaseModel):
    name: str
    dosage: str
    food_relation: str
    duration_days: int
    times: List[str] = Field(default_factory=list)

class SaveMedicinesRequest(BaseModel):
    medicines: List[MedicineInput]

@router.post("/{prescription_id}/medicines")
async def save_medicines(
    prescription_id: str, 
    request: SaveMedicinesRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verify prescription belongs to user
        prescription = await db.db["prescriptions"].find_one({"_id": prescription_id, "user_id": str(current_user["_id"])})
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")

        from app.models.medicine import Medicine
        from app.models.reminder import Reminder
        
        medicines_to_insert = []
        reminders_to_insert = []
        
        for med_input in request.medicines:
            medicine = Medicine(
                prescription_id=prescription_id,
                name=med_input.name,
                dosage=med_input.dosage,
                food_relation=med_input.food_relation,
                duration_days=med_input.duration_days
            )
            medicines_to_insert.append(medicine.model_dump(by_alias=True))
            
            # Create reminders for this medicine
            for time_str in med_input.times:
                reminder = Reminder(
                    user_id=str(current_user["_id"]),
                    medicine_id=medicine.id,
                    reminder_time=time_str
                )
                reminders_to_insert.append(reminder.model_dump(by_alias=True))
            
        if medicines_to_insert:
            await db.db["medicines"].insert_many(medicines_to_insert)
            
        if reminders_to_insert:
            await db.db["reminders"].insert_many(reminders_to_insert)
            
        return {
            "status": "success", 
            "message": f"Saved {len(medicines_to_insert)} medicines and {len(reminders_to_insert)} reminders."
        }
    except Exception as e:
        print(f"Error saving medicines: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch all prescriptions for user
        prescriptions_cursor = db.db["prescriptions"].find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
        prescriptions = await prescriptions_cursor.to_list(length=100)
        
        history = []
        for p in prescriptions:
            p_id = str(p["_id"])
            
            # Fetch medicines
            medicines_cursor = db.db["medicines"].find({"prescription_id": p_id})
            medicines = await medicines_cursor.to_list(length=100)
            
            meds_with_reminders = []
            for m in medicines:
                m_id = str(m["_id"])
                # Fetch reminders
                reminders_cursor = db.db["reminders"].find({"medicine_id": m_id})
                reminders = await reminders_cursor.to_list(length=100)
                
                m["_id"] = m_id
                m["reminders"] = [{"id": str(r["_id"]), "time": r["reminder_time"], "active": r["active"]} for r in reminders]
                meds_with_reminders.append(m)
                
            p["_id"] = p_id
            p["medicines"] = meds_with_reminders
            history.append(p)
            
        return {"status": "success", "history": history}
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{prescription_id}")
async def delete_prescription(prescription_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if prescription belongs to user
        prescription = await db.db["prescriptions"].find_one({"_id": prescription_id, "user_id": str(current_user["_id"])})
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        # 1. Find all medicines for this prescription to get their IDs
        medicines_cursor = db.db["medicines"].find({"prescription_id": prescription_id})
        medicines = await medicines_cursor.to_list(length=1000)
        medicine_ids = [str(m["_id"]) for m in medicines]
        
        # 2. Delete all reminders for these medicines
        if medicine_ids:
            await db.db["reminders"].delete_many({"medicine_id": {"$in": medicine_ids}})
            
        # 3. Delete all medicines for this prescription
        await db.db["medicines"].delete_many({"prescription_id": prescription_id})
        
        # 4. Delete the prescription itself
        await db.db["prescriptions"].delete_one({"_id": prescription_id})
        
        return {"status": "success", "message": "Prescription deleted successfully"}
    except Exception as e:
        print(f"Error deleting prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))
