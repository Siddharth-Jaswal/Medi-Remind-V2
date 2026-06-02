from typing import List, Optional
from datetime import datetime
from pydantic import Field
from .base import MongoBaseModel

class Prescription(MongoBaseModel):
    user_id: str
    filename: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    extracted: bool = False
