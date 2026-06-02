import uuid
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MongoBaseModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
