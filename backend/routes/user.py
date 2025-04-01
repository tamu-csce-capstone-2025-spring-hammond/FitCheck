"""Routes for user management."""

from fastapi import APIRouter, Header, HTTPException, Depends
from sqlmodel import select

from route_utils import enforce_logged_in

# FastAPI router
router = APIRouter()

@router.get("/users/me")
def get_me(authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)
    return {"user" : current_user}

from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory

@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.id == user_id).options(
        selectinload(User.clothing_items)
        .selectinload(ClothingItem.wear_history)
        , selectinload(User.outfits)
        , selectinload(User.resale_listings)
        )).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users/")
def create_user(user: User, db: Session = Depends(get_db)):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/users/{user_id}")
def update_user(user_id: int, user_update: User, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user_update.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

