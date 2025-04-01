"""Routes for user login and signup."""

from fastapi import APIRouter
from pydantic import BaseModel

from route_utils import validate_login_strings
from auth import verify_password
import database as database
from models import User

# FastAPI router
router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str

class LoginStatus(BaseModel):
    success: bool
    user: User | None = None
    error: str | None = None

    def __init__(self, success: bool, user: User | None = None, error: str | None = None):
        super().__init__(success=success, user=user, error=error)
        if not success and error is None:
            raise ValueError("Error message must be provided if success is False.")
        if success and user is None:
            raise ValueError("User must be provided if success is True.")

@router.post("/login", response_model=LoginStatus)
def post_login(request: LoginRequest):
    """Handle user login."""
    error = validate_login_strings(request.email, request.password)
    if error is not None:
        print(error)
        return LoginStatus(success=False, error=error["error"])

    # Get user
    user = database.get_user_by_email(request.email, True)
    if not user:
        return LoginStatus(success=False, error="User not found.")
    
    # Check password
    if not verify_password(request.password, user.password_salt_and_hash):
        return LoginStatus(success=False, error="Incorrect password.")
    
    return LoginStatus(
        success=True,
        user=user
    )


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/signup", response_model=LoginStatus)
def post_signup(request: SignupRequest):
    """Handle user signup."""
    error = validate_login_strings(request.email, request.password, request.name)
    if error:
        return LoginStatus(success=False, error=error["error"])
    
    # Check if user already exists
    if database.get_user_by_email(request.email):
        return LoginStatus(
            success=False,
            error="Email already registered. Please log in."
        )
    
    # Create user
    user = database.create_user(request.name, request.email, request.password)
    return LoginStatus(
        success=True,
        user=user
    )


