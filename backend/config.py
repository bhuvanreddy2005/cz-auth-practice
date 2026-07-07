import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://cz_auth_user:root@localhost:5432/cz_auth_db"
)

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_a_long_random_string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30