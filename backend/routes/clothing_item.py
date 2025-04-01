"""Routes for clothing item management."""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select


from models import ClothingItem, ClothingItemBase, ClothingItemPublicFull

# FastAPI router
router = APIRouter()

from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import ClothingItem


@router.get("/clothing_items/{item_id}", response_model=ClothingItemPublicFull)
def get_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.exec(select(ClothingItem).where(ClothingItem.id == item_id).options(
        selectinload(ClothingItem.wear_history),
        selectinload(ClothingItem.outfits),
        selectinload(ClothingItem.resale_listing)
        )).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    return item

@router.post("/clothing_items/", response_model=ClothingItem)
def create_clothing_item(item: ClothingItemBase, db: Session = Depends(get_db)):
    db_item = ClothingItem.model_validate(item)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch("/clothing_items/{item_id}", response_model=ClothingItemPublicFull)
def update_clothing_item(item_id: int, item_update: ClothingItem, db: Session = Depends(get_db)):
    item = db.get(ClothingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    item_data = item_update.model_dump(exclude_unset=True)
    item.sqlmodel_update(item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/clothing_items/{item_id}", status_code=204)
def delete_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(ClothingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    db.delete(item)
    db.commit()
    return
