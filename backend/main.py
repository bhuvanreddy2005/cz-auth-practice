from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models.user import User
from routes import auth, protected, mfa, profile

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(mfa.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "API is running"}