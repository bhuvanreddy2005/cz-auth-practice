from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    totp_secret = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    reset_otp = Column(String, nullable=True)
    reset_otp_expiry = Column(DateTime, nullable=True)