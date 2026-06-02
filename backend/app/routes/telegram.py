from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.database import db
from app.services.telegram_service import send_telegram_message
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/telegram", tags=["Telegram"])

class ConnectTelegramRequest(BaseModel):
    chat_id: str

@router.post("/connect")
async def connect_telegram(
    request: ConnectTelegramRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Saves the user's telegram chat ID to their profile, but only if a verification message succeeds.
    """
    try:
        # 1. Send verification message
        success = await send_telegram_message(
            request.chat_id,
            f"✅ *MediRemind Alert*\n\nHi {current_user['name']}, your Chat ID has been verified and connected to your account successfully!"
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to verify Chat ID. Please make sure you have started a chat with the bot first.")

        # 2. Update user profile
        await db.db["users"].update_one(
            {"_id": current_user["_id"]},
            {"$set": {"telegram_chat_id": request.chat_id}}
        )
        
        return {
            "status": "success", 
            "message": "Connected Telegram chat ID to your account."
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error connecting telegram: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TestTelegramRequest(BaseModel):
    chat_id: str

@router.post("/test")
async def test_telegram(
    request: TestTelegramRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Sends a test message to the provided chat ID.
    """
    success = await send_telegram_message(
        request.chat_id, 
        f"✅ *MediRemind Setup Complete!*\n\nHi {current_user['name']}, I am successfully connected and will send your medicine reminders right here. Stay healthy!"
    )
    if success:
        return {"status": "success", "message": "Test message sent!"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test message. Please verify your Chat ID and that you have started a conversation with the bot.")
