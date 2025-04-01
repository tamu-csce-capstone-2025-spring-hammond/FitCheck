"""Routes for clothing item management."""

from fastapi import APIRouter, Header, HTTPException, Depends
from sqlmodel import select


import database
from models import ClothingItem

# FastAPI router
router = APIRouter()

from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory


@router.get("/clothing_items/{item_id}")
def get_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.exec(select(ClothingItem).where(ClothingItem.id == item_id).options(
        selectinload(ClothingItem.wear_history)
        )).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    return item

@router.post("/clothing_items/")
def create_clothing_item(item: ClothingItem, db: Session = Depends(get_db)):
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/clothing_items/{item_id}")
def update_clothing_item(item_id: int, item_update: ClothingItem, db: Session = Depends(get_db)):
    item = db.get(ClothingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    item_data = item_update.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
