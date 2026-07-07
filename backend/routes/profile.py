from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db
from models.user import User
from utils.jwt_handler import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdateRequest(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None

@router.get("")
def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
    }

@router.put("")
def update_profile(payload: ProfileUpdateRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_email = db.query(User).filter(User.email == payload.email, User.id != user.id).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use by another account")

    user.name = payload.name
    user.email = payload.email
    user.phone_number = payload.phone_number
    db.commit()

    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
    }