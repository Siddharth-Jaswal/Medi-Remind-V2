from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from app.database import db
from app.models.user import User
from app.services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=Token)
async def register(request: RegisterRequest):
    try:
        # Check if user exists
        existing_user = await db.db["users"].find_one({"email": request.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        # Create new user
        hashed_password = get_password_hash(request.password)
        new_user = User(
            name=request.name,
            email=request.email,
            hashed_password=hashed_password
        )
        
        result = await db.db["users"].insert_one(new_user.model_dump(by_alias=True, exclude_none=True))
        
        # Create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": str(result.inserted_id),
                "name": new_user.name,
                "email": new_user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database or server error: {str(e)}")

@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    try:
        user = await db.db["users"].find_one({"email": request.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        if not verify_password(request.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "telegram_chat_id": user.get("telegram_chat_id")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database or server error: {str(e)}")

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "telegram_chat_id": current_user.get("telegram_chat_id")
    }
