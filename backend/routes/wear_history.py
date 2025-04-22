"""Routes for wear history management."""

from fastapi import APIRouter, HTTPException, Depends


from sqlmodel import select
from sqlalchemy.orm import Session, selectinload
from database import get_db
# from models import WearHistory, WearHistoryBase, WearHistoryMake, WearHistoryPublic

# FastAPI router
router = APIRouter()

# @router.get("/wear_history/{history_id}", response_model=WearHistoryPublic)
# def get_wear_history(history_id: int, db: Session = Depends(get_db)):
#     history = db.exec(select(WearHistory).where(WearHistory.id == history_id).options(
#         selectinload(WearHistory.outfit)
#     )).first()
#     if not history:
#         raise HTTPException(status_code=404, detail="Wear history record not found")
#     return history

# @router.post("/wear_history/", response_model=WearHistoryMake)
# def create_wear_history(history: WearHistoryBase, db: Session = Depends(get_db)):
#     db_history = WearHistory.model_validate(history)
#     db.add(db_history)
#     db.commit()
#     db.refresh(db_history)
#     return db_history

# @router.delete("/wear_history/{history_id}", status_code=204)
# def delete_wear_history(history_id: int, db: Session = Depends(get_db)):
#     history = db.get(WearHistory, history_id)
#     if not history:
#         raise HTTPException(status_code=404, detail="Wear history record not found")
#     db.delete(history)
#     db.commit()
#     return