# auth.py
import os
import requests
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
JWKS_URL = f"{SUPABASE_PROJECT_URL}/auth/v1/keys"

# Load public keys from Supabase JWKS
def get_jwks():
    response = requests.get(JWKS_URL)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Could not retrieve JWKS")
    return response.json()["keys"]

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    jwks = get_jwks()
    unverified_header = jwt.get_unverified_header(token)

    key = next((k for k in jwks if k["kid"] == unverified_header["kid"]), None)
    if not key:
        raise HTTPException(status_code=401, detail="Invalid token header")

    try:
        payload = jwt.decode(token, key, algorithms=["RS256"], audience=None, options={"verify_aud": False})
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid JWT") from e

    return payload
