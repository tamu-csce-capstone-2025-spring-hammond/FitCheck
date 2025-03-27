"""Routes for user management."""

from fastapi import APIRouter, Header, HTTPException, Depends

from backend.route_utils import enforce_logged_in

# FastAPI router
router = APIRouter()

@router.get("/me")
def get_me(authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)
    return {"user" : current_user}

from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory


@router.post("/user")
def create_user(user: User, db: Session = Depends(get_db)):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/user/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/user/{user_id}")
def update_user(user_id: int, user: User, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

