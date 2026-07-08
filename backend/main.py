import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models.user import User  # noqa: F401 - needed so Base knows about the table
from routes import auth, mfa, profile, protected

app = FastAPI()

# Create tables on startup if they don't exist yet
Base.metadata.create_all(bind=engine)

# Read allowed origins from the environment. Supports a comma-separated list,
# e.g. ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.com
# Falls back to the local Vite dev server if nothing is set.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "https://https://cz-auth-practice.vercel.app/")
allowed_origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This was the main bug: the routers below were fully written but never
# registered with the app, so none of the /auth, /mfa, /profile, or
# /protected endpoints actually existed.
app.include_router(auth.router)
app.include_router(mfa.router)
app.include_router(profile.router)
app.include_router(protected.router)


@app.get("/")
def health_check():
    return {"status": "ok"}