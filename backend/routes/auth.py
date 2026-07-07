from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator

from database import get_db
from models.user import User
from utils.password import hash_password, verify_password
from utils.jwt_handler import create_access_token
from utils.totp import verify_totp_code

router = APIRouter(prefix="/auth", tags=["auth"])

ALLOWED_EMAIL_DOMAINS = ["gmail.com", "yahoo.com"]

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    password: str

    @field_validator("email")
    @classmethod
    def validate_domain(cls, value: str) -> str:
        domain = value.split("@")[-1].lower()
        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise ValueError(
                f"Only these email domains are allowed: {', '.join(ALLOWED_EMAIL_DOMAINS)}"
            )
        return value

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class MfaLoginRequest(BaseModel):
    user_id: int
    code: str

class VerifyPhoneRequest(BaseModel):
    phone_number: str

class ResetPasswordRequest(BaseModel):
    phone_number: str
    new_password: str

@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=payload.name,
        email=payload.email,
        phone_number=payload.phone_number,
        hashed_password=hash_password(payload.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "access_token": token,
        "token_type": "bearer",
    }

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.mfa_enabled:
        return {"mfa_required": True, "user_id": user.id}

    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }

@router.post("/mfa-verify")
def mfa_verify(payload: MfaLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()

    if not user or not user.mfa_enabled or not user.totp_secret:
        raise HTTPException(status_code=400, detail="MFA not enabled for this user")

    if not verify_totp_code(user.totp_secret, payload.code):
        raise HTTPException(status_code=401, detail="Invalid authentication code")

    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }

@router.post("/verify-phone")
def verify_phone(payload: VerifyPhoneRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="No account found with that mobile number")

    return {"message": "Mobile number verified", "verified": True}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="No account found with that mobile number")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password reset successfully"}