"""Routes for user management."""

from fastapi import APIRouter, Header

from backend.route_utils import enforce_logged_in

# FastAPI router
router = APIRouter()

@router.get("/me")
def get_me(authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)
    return {"user" : current_user}

