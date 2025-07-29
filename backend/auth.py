import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  # anon key for signup/login

async def signup_user(email: str, password: str):
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    json = {"email": email, "password": password}

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=json, headers=headers)
    return response.json()

async def login_user(email: str, password: str):
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    json = {"email": email, "password": password}

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=json, headers=headers)
    return response.json()

