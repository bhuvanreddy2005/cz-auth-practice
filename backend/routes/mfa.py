from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.user import User
from utils.jwt_handler import get_current_user
from utils.totp import (
    generate_totp_secret,
    get_provisioning_uri,
    generate_qr_code_base64,
    verify_totp_code,
)

router = APIRouter(prefix="/mfa", tags=["mfa"])

class MfaEnableRequest(BaseModel):
    code: str

@router.get("/setup")
def setup_mfa(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.totp_secret or user.mfa_enabled:
        secret = generate_totp_secret()
        user.totp_secret = secret
        db.commit()
    else:
        secret = user.totp_secret

    uri = get_provisioning_uri(user.email, secret)
    qr_code = generate_qr_code_base64(uri)

    return {"secret": secret, "qr_code": qr_code}

@router.post("/enable")
def enable_mfa(payload: MfaEnableRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user or not user.totp_secret:
        raise HTTPException(status_code=400, detail="MFA setup not started")

    if not verify_totp_code(user.totp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid code")

    user.mfa_enabled = True
    db.commit()

    return {"message": "MFA enabled successfully"}

@router.post("/disable")
def disable_mfa(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    user.mfa_enabled = False
    user.totp_secret = None
    db.commit()
    return {"message": "MFA disabled"}