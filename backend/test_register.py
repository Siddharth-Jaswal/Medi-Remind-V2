import asyncio
import os
from dotenv import load_dotenv

os.environ["APP_ENV"] = "production"
os.environ["MONGODB_URL"] = "mongodb+srv://medi_remind_db_user:i76WnHODj6UV7lSA@dev-cluster.jy6ntut.mongodb.net/?appName=dev-cluster"
os.environ["DATABASE_NAME"] = "mediremind_prod"

from app.database import db, connect_to_mongo
from app.models.user import User
from app.services.auth_service import get_password_hash

async def test_register():
    await connect_to_mongo()
    try:
        email = "test456@example.com"
        print("Checking if user exists...")
        existing = await db.db["users"].find_one({"email": email})
        print(f"Existing: {existing}")
        
        print("Creating User model...")
        new_user = User(
            name="Test",
            email=email,
            hashed_password=get_password_hash("test")
        )
        
        print("Dumping model...")
        dumped = new_user.model_dump(by_alias=True, exclude_none=True)
        print(f"Dumped: {dumped}")
        
        print("Inserting...")
        result = await db.db["users"].insert_one(dumped)
        print(f"Result: {result.inserted_id}")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test_register())
