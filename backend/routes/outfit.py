"""Routes for outfit management."""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import selectinload
from sqlmodel import select

# FastAPI router
router = APIRouter()


from sqlalchemy.orm import Session
from database import get_db
from models import OutfitBase, OutfitPublic, OutfitPublicFull, OutfitUpdate, Outfit


@router.get("/outfits/{outfit_id}", response_model=OutfitPublicFull)
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.exec(select(Outfit).where(Outfit.id == outfit_id).options(
        selectinload(Outfit.items)
    )).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit

@router.post("/outfits/", response_model=OutfitPublic)
def create_outfit(outfit: OutfitBase, db: Session = Depends(get_db)):
    db_outfit = Outfit.model_validate(outfit)
    db.add(db_outfit)
    db.commit()
    db.refresh(db_outfit)
    return db_outfit

@router.patch("/outfits/{outfit_id}", response_model=OutfitPublicFull)
def update_outfit(outfit_id: int, outfit_update: OutfitUpdate, db: Session = Depends(get_db)):
    outfit = db.get(Outfit, outfit_id)
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    outfit_data = outfit_update.model_dump(exclude_unset=True)
    outfit.sqlmodel_update(outfit_data)
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    return outfit

@router.delete("/outfits/{outfit_id}", status_code=204)
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.get(Outfit, outfit_id)
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    db.delete(outfit)
    db.commit()
    return
