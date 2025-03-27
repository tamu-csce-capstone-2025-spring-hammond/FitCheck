"""Routes for outfit management."""

from fastapi import APIRouter, Header, HTTPException, Depends


from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, ClothingItem, Outfit, OutfitItem, ResaleListing, WearHistory



# FastAPI router
router = APIRouter()
@router.get("/resale_listings/{listing_id}")
def get_resale_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(ResaleListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    return listing

@router.post("/resale_listings/")
def create_resale_listing(listing: ResaleListing, db: Session = Depends(get_db)):
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.put("/resale_listings/{listing_id}")
def update_resale_listing(listing_id: int, listing_update: ResaleListing, db: Session = Depends(get_db)):
    listing = db.get(ResaleListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    listing_data = listing_update.dict(exclude_unset=True)
    for key, value in listing_data.items():
        setattr(listing, key, value)
    db.commit()
    db.refresh(listing)
    return listing