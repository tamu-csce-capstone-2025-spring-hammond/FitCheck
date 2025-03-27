"""Routes for outfit management."""

from fastapi import APIRouter, Header, HTTPException, Depends


# FastAPI router
router = APIRouter()


from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory



@router.get("/outfits/{outfit_id}")
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.get(Outfit, outfit_id)
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit

@router.post("/outfits/")
def create_outfit(outfit: Outfit, db: Session = Depends(get_db)):
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    return outfit

@router.put("/outfits/{outfit_id}")
def update_outfit(outfit_id: int, outfit_update: Outfit, db: Session = Depends(get_db)):
    outfit = db.get(Outfit, outfit_id)
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    outfit_data = outfit_update.dict(exclude_unset=True)
    for key, value in outfit_data.items():
        setattr(outfit, key, value)
    db.commit()
    db.refresh(outfit)
    return outfit
