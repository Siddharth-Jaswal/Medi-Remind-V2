from typing import Optional
from .base import MongoBaseModel

class Reminder(MongoBaseModel):
    user_id: str
    medicine_id: str
    reminder_time: str  # e.g., "08:00 AM"
    active: bool = True
