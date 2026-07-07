from fastapi import APIRouter, Depends
from utils.jwt_handler import get_current_user

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get("/dashboard")
def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    return {
        "message": "This is protected data",
        "user_email": current_user.get("email"),
        "user_id": current_user.get("sub"),
    }