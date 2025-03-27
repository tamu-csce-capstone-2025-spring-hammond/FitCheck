"""Various utility functions for FastAPI routes"""

from fastapi import HTTPException

import backend.database as database
import backend.constants as constants

import re

def enforce_logged_in(authorization: str):
    """Check if the user is logged in by checking the authorization header."""
    token = authorization[7:]
    if token == "":
        raise HTTPException(status_code=401, detail="Not logged in.")
    user = database.get_user_by_login_token(token)
    if user is None:
        raise HTTPException(status_code=400, detail="Bad login token.")
    return user


def validate_login_strings(email: str, password: str, name: str|None = None):
    """Validate the login strings for signup and login requests."""
    # Check field lengths
    if len(email) < 1 or len(email) > constants.MAX_EMAIL_LENGTH:
        return {"error": f"Email must be between 1 and {constants.MAX_EMAIL_LENGTH} characters."}
    if len(password) < 1 or len(password) > constants.MAX_PASSWORD_LENGTH:
        return {"error": f"Password must be between 1 and {constants.MAX_PASSWORD_LENGTH} characters."}
    if name:
        if len(name) < 1 or len(name) > constants.MAX_NAME_LENGTH:
            return {"error": f"Name must be between 1 and {constants.MAX_NAME_LENGTH} characters."}

    # Check if email is valid
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"error": "Invalid email."}

