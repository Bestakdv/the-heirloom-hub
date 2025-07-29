from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import signup_user, login_user, get_current_user  # we'll keep get_current_user for protected route

app = FastAPI()

# CORS setup — update origins as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCredentials(BaseModel):
    email: str
    password: str

@app.post("/signup")
async def signup(credentials: UserCredentials):
    result = await signup_user(credentials.email, credentials.password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result.get("error_description", "Signup failed"))
    return {"message": "User created successfully", "user": result}

@app.post("/login")
async def login(credentials: UserCredentials):
    result = await login_user(credentials.email, credentials.password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result.get("error_description", "Login failed"))
    return {
        "access_token": result.get("access_token"),
        "refresh_token": result.get("refresh_token"),
        "expires_in": result.get("expires_in"),
        "token_type": result.get("token_type"),
    }

@app.get("/protected")
async def protected_route(user=Depends(get_current_user)):
    return {"message": f"Hello {user['email']}, you're authenticated!"}
