"""Routes for outfit management."""

from fastapi import APIRouter, HTTPException, Depends


from sqlalchemy.orm import Session, selectinload
from sqlmodel import select
from database import get_db
from models import ResaleListing, ResaleListingBase, ResaleListingPublic, ResaleListingPublicFull, ResaleListingUpdate


# FastAPI router
router = APIRouter()
@router.get("/resale_listings/{listing_id}", response_model=ResaleListingPublicFull)
def get_resale_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.exec(select(ResaleListing).where(ResaleListing.id == listing_id).options(
        selectinload(ResaleListing.clothing_item)
    )).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    return listing

@router.post("/resale_listings/", response_model=ResaleListingPublic)
def create_resale_listing(listing: ResaleListingBase, db: Session = Depends(get_db)):
    db_listing = ResaleListing.model_validate(listing)
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.patch("/resale_listings/{listing_id}", response_model=ResaleListingPublicFull)
def update_resale_listing(listing_id: int, listing_update: ResaleListingUpdate, db: Session = Depends(get_db)):
    listing = db.get(ResaleListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    listing_data = listing_update.model_dump(exclude_unset=True)
    listing.sqlmodel_update(listing_data)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/resale_listings/{listing_id}", status_code=204)
def delete_resale_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(ResaleListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Resale listing not found")
    db.delete(listing)
    db.commit()
    return
