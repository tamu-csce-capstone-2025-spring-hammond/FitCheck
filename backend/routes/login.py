"""Routes for user login and signup."""

from fastapi import APIRouter
from pydantic import BaseModel

from route_utils import validate_login_strings
from auth import verify_password
import database as database

# FastAPI router
router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def post_login(request: LoginRequest):
    """Handle user login."""
    error = validate_login_strings(request.email, request.password)
    if error is not None:
        print(error)
        return error

    # Get user
    user = database.get_user_by_email(request.email, True)
    if not user:
        return {"error": "User does not exist."}
    
    # Check password
    if not verify_password(request.password, user.password_salt_and_hash):
        return {"error": "Incorrect password."}
    
    return {"success": True, "user": user}


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/signup")
def post_signup(request: SignupRequest):
    """Handle user signup."""
    error = validate_login_strings(request.email, request.password, request.name)
    if error:
        return error
    
    # Check if user already exists
    if database.get_user_by_email(request.email):
        return {"error": "User already exists."}
    
    # Create user
    user = database.create_user(request.name, request.email, request.password)
    return {"success": True, "user": user}


