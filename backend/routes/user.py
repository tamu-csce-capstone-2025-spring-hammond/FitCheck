"""Routes for user management."""

from fastapi import APIRouter, Header, HTTPException, Depends
from sqlmodel import select

from route_utils import enforce_logged_in

from models import User, UserPublic, UserPublicFull, UserUpdate

# FastAPI router
router = APIRouter()

@router.get("/users/me", response_model=UserPublic)
def get_me(authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)
    return current_user


from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, UserPublic, WearHistory

@router.get("/users/{user_id}", response_model=UserPublicFull)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.id == user_id).options(
        selectinload(User.clothing_items)
        .selectinload(ClothingItem.wear_history)
        , selectinload(User.outfits)
        , selectinload(User.resale_listings)
        )).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    print(f"Retrieved user with ID {user.id}")
    return user


@router.patch("/users/{user_id}", response_model=UserPublicFull)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user_update.model_dump(exclude_unset=True)
    user.sqlmodel_update(user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

