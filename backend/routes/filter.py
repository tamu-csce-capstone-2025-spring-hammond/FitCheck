import boto3
from fastapi import APIRouter, File, HTTPException, UploadFile, Header, Depends
from models import ClothingItem, ClothingItemBase, ClothingItemPublicFull
from pydantic import BaseModel
import json
from sqlmodel import SQLModel, Field, Session, create_engine, select
from database import get_db
from models import ClothingItem, Outfit, OutfitItem, UserSelfie
from route_utils import enforce_logged_in
from typing import List, Optional
import chromadb
import database
import environment 
from sqlalchemy import distinct

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

@router.post("/outfits-by-field")
def post_by_field_outfit(
    request: FilterRequest, db: Session = Depends(get_db), authorization: str = Header(...)
):
    current_user = enforce_logged_in(authorization)
    
    query = select(Outfit).join(OutfitItem, Outfit.id == OutfitItem.outfit_id).join(ClothingItem, OutfitItem.clothing_item_id == ClothingItem.id).where(Outfit.user_id == current_user.id).distinct(Outfit.id) 
    
    
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

    # 4) Execute and return the matching outfits
    outfits = db.exec(query).all()
    print("____________________________")
    print("Matching outfits:")
    print(outfits)
    print("____________________________")
    return outfits

@router.get("/unique-values/{field}")
def get_unique_values_by_field(field: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    current_user = enforce_logged_in(authorization)
    query = select(ClothingItem).where(ClothingItem.user_id == current_user.id)
    
    if hasattr(ClothingItem, field):
        query = query.distinct(getattr(ClothingItem, field))
    else:
        raise ValueError(f"Field {field} does not exist on the model.")

    items = db.exec(query).all()
    return [getattr(item, field) for item in items if getattr(item, field) is not None and getattr(item, field) != ""]

class SearchRequest(BaseModel):
    query: str  # The search query text

@router.post("/search")
def search(request: SearchRequest, authorization: str = Header(...), db: Session = Depends(get_db)):
    current_user = enforce_logged_in(authorization)

    # Initialize ChromaDB client
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="clothing_items")


    # Query ChromaDB for similar items
    try:
        results = collection.query(
            query_texts=[request.query], 
            n_results=5  
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma query failed: {e}")

    # Parse the results from ChromaDB
    matching_items = []
    matching_ids = set()
    for result in range(len(results['ids'][0])):
        if results['distances'][0][result] < 20:
            item_id = results['ids'][0][result]
        # Fetch the clothing item from the database using the ID
            item = db.query(ClothingItem).where(ClothingItem.user_id == current_user.id).filter(ClothingItem.id == item_id).first()
            if item and item_id not in matching_ids:
                matching_ids.add(item.id)
                matching_items.append(item)

    for item in db.query(ClothingItem).where(ClothingItem.user_id == current_user.id).where(ClothingItem.id not in matching_ids).all():
        if request.query.lower() in item.description.lower() and (item.id not in matching_ids):
            matching_ids.add(item.id)
            matching_items.append(item)

    matching_items = list(matching_items)
    print("____________________________")
    print("Matching items from ChromaDB:")
    print(matching_items)
    print("____________________________")

    return matching_items



@router.post("/search-outfits")
def search(request: SearchRequest, authorization: str = Header(...), db: Session = Depends(get_db)):
    current_user = enforce_logged_in(authorization)

    # Initialize ChromaDB client
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="outfits")


    # Query ChromaDB for similar items
    try:
        results = collection.query(
            query_texts=[request.query], 
            n_results=5  
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma query failed: {e}")

    matching_items = []
    matching_ids = set()
    for result in range(len(results['ids'][0])):
        if results['distances'][0][result] < 1:
            item_id = results['ids'][0][result]
            item = db.query(Outfit).where(Outfit.user_id == current_user.id).filter(Outfit.id == item_id).first()
            if item and item_id not in matching_ids:
                matching_ids.add(item.id)
                matching_items.append(item)

    for item in db.query(Outfit).where(Outfit.user_id == current_user.id).where(Outfit.id not in matching_ids).all():
        if request.query.lower() in item.description.lower() and (item.id not in matching_ids):
            matching_ids.add(item.id)
            matching_items.append(item)

    matching_items = list(matching_items)
    return matching_items


@router.get("/clothing-items")
def get_clothing_items(authorization: str = Header(...), db: Session = Depends(get_db)):
    current_user = enforce_logged_in(authorization)
    
    query = select(ClothingItem).where(ClothingItem.user_id == current_user.id)
    items = db.exec(query).all()

    return items

@router.get("/user-selfies")
def get_user_selfies(authorization: str = Header(...), db: Session = Depends(get_db)):
    current_user = enforce_logged_in(authorization)
    
    query = select(UserSelfie).where(UserSelfie.user_id == current_user.id)
    selfies = db.exec(query).all()

    return selfies