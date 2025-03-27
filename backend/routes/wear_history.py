"""Routes for wear history management."""

from fastapi import APIRouter, Header, HTTPException, Depends


from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory

# FastAPI router
router = APIRouter()


@router.post("/wear-history")
def create_wear_history(wear: WearHistory, db: Session = Depends(get_db)):
    db.add(wear)
    db.commit()
    db.refresh(wear)
    return wear

@router.get("/wear-history/{wear_id}")
def get_wear_history(wear_id: int, db: Session = Depends(get_db)):
    wear = db.query(WearHistory).filter(WearHistory.id == wear_id).first()
    if not wear:
        raise HTTPException(status_code=404, detail="Wear history not found")
    return wear

@router.put("/wear-history/{wear_id}")
def update_wear_history(wear_id: int, wear: WearHistory, db: Session = Depends(get_db)):
    db_wear = db.query(WearHistory).filter(WearHistory.id == wear_id).first()
    if not db_wear:
        raise HTTPException(status_code=404, detail="Wear history not found")
    
    for key, value in wear.dict(exclude_unset=True).items():
        setattr(db_wear, key, value)
    
    db.commit()
    db.refresh(db_wear)
    return db_wear

