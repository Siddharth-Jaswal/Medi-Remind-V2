from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
from app.database import db
from app.services.telegram_service import send_telegram_message

scheduler = AsyncIOScheduler()

async def check_reminders():
    """
    Runs every minute. Checks if any active reminder matches the current time (HH:MM).
    If so, sends a Telegram message.
    """
    if db.db is None:
        return
        
    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    
    try:
        # Find all active reminders that match the current time
        reminders_cursor = db.db["reminders"].find({
            "active": True,
            "reminder_time": current_time_str
        })
        
        reminders = await reminders_cursor.to_list(length=100)
        
        for reminder in reminders:
            # Fetch the associated user to get their telegram chat ID
            from bson import ObjectId
            user = await db.db["users"].find_one({"_id": ObjectId(reminder["user_id"])})
            if not user or not user.get("telegram_chat_id"):
                continue
                
            # Fetch the associated medicine details
            medicine = await db.db["medicines"].find_one({"_id": reminder["medicine_id"]})
            if not medicine:
                continue
                
            # Construct message
            med_name = medicine.get("name", "Unknown Medicine")
            med_dosage = medicine.get("dosage", "")
            med_food = medicine.get("food_relation", "")
            
            message = (
                f"💊 *Medicine Reminder*\n\n"
                f"Hi {user.get('name', '')},\n\n"
                f"*Medicine:* {med_name} {med_dosage}\n"
                f"*Timing:* {med_food}\n\n"
                f"Stay healthy ❤️"
            )
            
            # Send Telegram message
            success = await send_telegram_message(user["telegram_chat_id"], message)
            if success:
                print(f"Sent reminder for {med_name} to {user['telegram_chat_id']}")
                
    except Exception as e:
        print(f"Error checking reminders: {e}")

def start_scheduler():
    scheduler.add_job(check_reminders, 'cron', minute='*')
    scheduler.start()
    print("APScheduler started!")

def stop_scheduler():
    scheduler.shutdown()
    print("APScheduler stopped!")
