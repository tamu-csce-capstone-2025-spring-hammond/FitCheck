import boto3
from fastapi import APIRouter, File, HTTPException, UploadFile, Header, Depends
from models import ClothingItem, ClothingItemBase, ClothingItemPublicFull
from pydantic import BaseModel
import json
from sqlmodel import SQLModel, Field, Session, create_engine, select
from database import get_db
from models import ClothingItem
from route_utils import enforce_logged_in
from typing import List, Optional

# FastAPI router
router = APIRouter()

class FilterRequest(BaseModel):
    category: Optional[List[str]] = []
    brand: Optional[List[str]] = []
    size: Optional[List[str]] = []
    color: Optional[List[str]] = []
    tag: Optional[List[str]] = []


@router.post("/by-field")
def post_by_field(
    request: FilterRequest, db: Session = Depends(get_db), authorization: str = Header(...)
):
    current_user = enforce_logged_in(authorization)
    
    query = select(ClothingItem).where(ClothingItem.user_id == current_user.id)
    print(request.category)
    if request.category:
        query = query.where(ClothingItem.category.in_(request.category))
    
    if request.brand:
        query = query.where(ClothingItem.brand.in_(request.brand))
    
    if request.size:
        query = query.where(ClothingItem.size.in_(request.size))
    
    if request.color:
        query = query.where(ClothingItem.color.in_(request.color))
    
    if request.tag:
        query = query.where(ClothingItem.tag.in_(request.tag))
        
    items = db.exec(query).all()
    
    return items

@router.get("/unique-values/{field}")
def get_unique_values_by_field(field: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    current_user = enforce_logged_in(authorization)
    query = select(ClothingItem).where(ClothingItem.user_id == current_user.id)
    
    if hasattr(ClothingItem, field):
        query = query.distinct(getattr(ClothingItem, field))
    else:
        raise ValueError(f"Field {field} does not exist on the model.")

    items = db.exec(query).all()
    return json.dumps([getattr(item, field) for item in items])

