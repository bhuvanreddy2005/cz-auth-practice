import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# This is the key: read from the environment variable
allowed_origin = os.getenv("ALLOWED_ORIGINS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin], # Must be a list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)