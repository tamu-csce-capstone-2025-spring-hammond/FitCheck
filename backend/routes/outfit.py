"""Routes for outfit management."""

from fastapi import APIRouter, Header, HTTPException, Depends


# FastAPI router
router = APIRouter()


from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory



@router.post("/outfit")
def create_outfit(outfit: Outfit, db: Session = Depends(get_db)):
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    return outfit

@router.get("/outfit/{outfit_id}")
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit

@router.put("/outfit/{outfit_id}")
def update_outfit(outfit_id: int, outfit: Outfit, db: Session = Depends(get_db)):
    db_outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not db_outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    for key, value in outfit.dict(exclude_unset=True).items():
        setattr(db_outfit, key, value)
    
    db.commit()
    db.refresh(db_outfit)
    return db_outfit
