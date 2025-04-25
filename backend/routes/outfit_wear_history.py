"""Routes for wear history management."""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import OutfitWearHistory, OutfitWearHistoryBase, OutfitWearHistoryPublic
from typing import List

# FastAPI router
router = APIRouter()

@router.get("/outfit_wear_history/", response_model=List[OutfitWearHistoryPublic])
def get_all_wear_history(db: Session = Depends(get_db)):
    histories = db.exec(select(OutfitWearHistory).options(
        selectinload(OutfitWearHistory.outfit)
    )).all()
    return histories

@router.get("/outfit_wear_history/{history_id}", response_model=OutfitWearHistoryPublic)
def get_wear_history(history_id: int, db: Session = Depends(get_db)):
    history = db.exec(select(OutfitWearHistory).where(OutfitWearHistory.id == history_id).options(
        selectinload(OutfitWearHistory.outfit)
    )).first()
    if not history:
        raise HTTPException(status_code=404, detail="Wear history record not found")
    return history

@router.post("/outfit_wear_history/", response_model=OutfitWearHistoryPublic)
def create_wear_history(history: OutfitWearHistoryBase, db: Session = Depends(get_db)):
    db_history = OutfitWearHistory.model_validate(history)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@router.delete("/outfit_wear_history/{history_id}", status_code=204)
def delete_wear_history(history_id: int, db: Session = Depends(get_db)):
    history = db.get(OutfitWearHistory, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="Wear history record not found")
    db.delete(history)
    db.commit()
    return