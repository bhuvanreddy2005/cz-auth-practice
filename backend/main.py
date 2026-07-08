# main.py
from fastapi import FastAPI
from routes.auth import router as auth_router # Example import

app = FastAPI()

# IMPORTANT: Check if you have a prefix here!
app.include_router(auth_router, prefix="/auth")
# Add both your local development URL and your Vercel production URL
origins = [
    "http://localhost:5173",
    "https://cz-auth-practice.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)