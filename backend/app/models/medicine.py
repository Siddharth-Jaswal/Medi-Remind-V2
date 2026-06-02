from typing import Optional
from .base import MongoBaseModel

class Medicine(MongoBaseModel):
    prescription_id: str
    name: str
    dosage: str
    food_relation: str  # e.g., "After Food", "Before Food"
    duration_days: int
