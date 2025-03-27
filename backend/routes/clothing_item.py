"""Routes for clothing item management."""

from fastapi import APIRouter, Header, HTTPException, Depends


from backend import database
from backend.models import ClothingItem

# FastAPI router
router = APIRouter()

from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory


@router.post("/clothing-item")
def create_clothing_item(item: ClothingItem, db: Session = Depends(get_db)):
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/clothing-item/{item_id}")
def get_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    return item

@router.put("/clothing-item/{item_id}")
def update_clothing_item(item_id: int, item: ClothingItem, db: Session = Depends(get_db)):
    db_item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

