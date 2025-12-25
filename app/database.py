from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "sentinelstore")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

async def connect_to_mongo():
    try:
        # Ping the database
        await client.admin.command('ping')
        print("Connected to MongoDB")
    except ConnectionFailure:
        print("Failed to connect to MongoDB")

async def close_mongo_connection():
    client.close()
    print("Disconnected from MongoDB")

# Collections
users_collection = db["users"]
stores_collection = db["stores"]
incidents_collection = db["incidents"]