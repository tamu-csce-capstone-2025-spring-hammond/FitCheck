"""Routes for wear history management."""

from fastapi import APIRouter, Header, HTTPException, Depends


from sqlmodel import select
from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import WearHistory, WearHistoryBase, WearHistoryPublic, WearHistoryPublicFull, WearHistoryUpdate

# FastAPI router
router = APIRouter()

@router.get("/wear_history/{history_id}", response_model=WearHistoryPublicFull)
def get_wear_history(history_id: int, db: Session = Depends(get_db)):
    history = db.exec(select(WearHistory).where(WearHistory.id == history_id).options(
        selectinload(WearHistory.clothing_item)
    )).first()
    if not history:
        raise HTTPException(status_code=404, detail="Wear history record not found")
    return history

@router.post("/wear_history/", response_model=WearHistoryPublic)
def create_wear_history(history: WearHistoryBase, db: Session = Depends(get_db)):
    db_history = WearHistory.model_validate(history)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@router.patch("/wear_history/{history_id}", response_model=WearHistoryPublicFull)
def update_wear_history(history_id: int, history_update: WearHistoryUpdate, db: Session = Depends(get_db)):
    history = db.get(WearHistory, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="Wear history record not found")
    history_data = history_update.model_dump(exclude_unset=True)
    history.sqlmodel_update(history_data)
    db.add(history)
    db.commit()
    db.refresh(history)
    return history

@router.delete("/wear_history/{history_id}", status_code=204)
def delete_wear_history(history_id: int, db: Session = Depends(get_db)):
    history = db.get(WearHistory, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="Wear history record not found")
    db.delete(history)
    db.commit()
    return