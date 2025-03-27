"""Routes for wear history management."""

from fastapi import APIRouter, Header, HTTPException, Depends


from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory

# FastAPI router
router = APIRouter()


@router.get("/wear_history/{history_id}")
def get_wear_history(history_id: int, db: Session = Depends(get_db)):
    history = db.get(WearHistory, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="Wear history not found")
    return history

@router.post("/wear_history/")
def create_wear_history(history: WearHistory, db: Session = Depends(get_db)):
    db.add(history)
    db.commit()
    db.refresh(history)
    return history
