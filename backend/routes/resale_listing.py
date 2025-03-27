"""Routes for outfit management."""

from fastapi import APIRouter, Header, HTTPException, Depends


from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory



# FastAPI router
router = APIRouter()

@router.post("/resale-listing")
def create_resale_listing(listing: ResaleListing, db: Session = Depends(get_db)):
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.get("/resale-listing/{listing_id}")
def get_resale_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(ResaleListing).filter(ResaleListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    return listing

@router.put("/resale-listing/{listing_id}")
def update_resale_listing(listing_id: int, listing: ResaleListing, db: Session = Depends(get_db)):
    db_listing = db.query(ResaleListing).filter(ResaleListing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    
    for key, value in listing.dict(exclude_unset=True).items():
        setattr(db_listing, key, value)
    
    db.commit()
    db.refresh(db_listing)
    return db_listing


