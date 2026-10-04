import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

env_name = os.getenv("APP_ENV", "development")
env_file = f".env.{env_name}"
load_dotenv(env_file)
print(f"Loaded environment variables from {env_file}")
def get_mongo_url():
    raw_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    return raw_url.strip().strip('"').strip("'")

def get_db_name():
    raw_db = os.getenv("DATABASE_NAME", "mediremind")
    return raw_db.strip().strip('"').strip("'")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    url = get_mongo_url()
    database_name = get_db_name()
    print(f"Connecting to MongoDB at {url}...")
    db.client = AsyncIOMotorClient(url)
    db.db = db.client[database_name]
    print("Connected to MongoDB!")

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    if db.client:
        db.client.close()
    print("MongoDB connection closed.")
