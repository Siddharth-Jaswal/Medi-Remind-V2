from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health

from contextlib import asynccontextmanager
import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.scheduler.reminders import start_scheduler, stop_scheduler
from app.services.telegram_service import poll_telegram_updates

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    start_scheduler()
    
    # Start Telegram Polling in the background
    polling_task = asyncio.create_task(poll_telegram_updates())
    
    yield
    
    # Shutdown
    polling_task.cancel()
    stop_scheduler()
    await close_mongo_connection()

app = FastAPI(
    title="MediRemind AI",
    description="A modern AI-powered prescription reminder system.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow any origin since we use stateless Bearer tokens
    allow_credentials=False, # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(health.router, prefix="/health", tags=["Health"])
from app.routes import auth
app.include_router(auth.router)
from app.routes import prescription
app.include_router(prescription.router)
from app.routes import telegram
app.include_router(telegram.router)
from app.routes import reminder
app.include_router(reminder.router)

@app.get("/")
async def root():
    return {"message": "Welcome to MediRemind AI API"}
