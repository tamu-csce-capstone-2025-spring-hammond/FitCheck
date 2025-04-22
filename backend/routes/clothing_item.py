"""Routes for clothing item management."""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from fastapi import APIRouter, HTTPException, Depends
from fastapi import Header
from pydantic import BaseModel
import boto3
#import chromadb
import environment
from urllib.parse import urlparse
import chromadb


from models import ClothingItem, ClothingItemBase, ClothingItemPublicFull

# FastAPI router
router = APIRouter()

from sqlalchemy.orm import Session, selectinload
from database import get_db
from models import ClothingItem


@router.get("/clothing_items/{item_id}", response_model=ClothingItemPublicFull)
def get_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.exec(select(ClothingItem).where(ClothingItem.id == item_id).options(
        selectinload(ClothingItem.outfits),
        selectinload(ClothingItem.resale_listing)
        )).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item with id not found")
    return item

@router.post("/clothing_items/", response_model=ClothingItem)
def create_clothing_item(item: ClothingItemBase, db: Session = Depends(get_db)):
    db_item = ClothingItem.model_validate(item)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch("/clothing_items/{item_id}", response_model=ClothingItemPublicFull)
def update_clothing_item(item_id: int, item_update: ClothingItem, db: Session = Depends(get_db)):
    item = db.get(ClothingItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    item_data = item_update.model_dump(exclude_unset=True)
    item.sqlmodel_update(item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/clothing_items/{item_id}")
def delete_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(ClothingItem, item_id)
    s3url = item.s3url if item else None
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    db.delete(item)
    db.commit()

    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="clothing_items")
    collection.delete(ids=[str(item.id)])

    aws_access_key = environment.get("AWS_ACCESS_KEY_ID")
    aws_secret_key = environment.get("AWS_SECRET_ACCESS_KEY")
    aws_region = environment.get("AWS_DEFAULT_REGION")
    bucket_name = "hack-fitcheck"

    s3_client = boto3.client(
        "s3",
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region,
    )
    parsed_url = urlparse(s3url)

    key = parsed_url.path.lstrip("/") 
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete item from S3: {e}")
    print("deleted from s3")
    return {"message": "Clothing item deleted successfully."}



@router.delete("/clear_clothing_items", status_code=204)
def clear_clothing_items(db: Session = Depends(get_db)):
    clothing_items = db.query(ClothingItem).all()
    for item in clothing_items:
        db.delete(item)
    db.commit()

    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="clothing_items")
    client.delete_collection(name="clothing_items")

    aws_access_key = environment.get("AWS_ACCESS_KEY_ID")
    aws_secret_key = environment.get("AWS_SECRET_ACCESS_KEY")
    aws_region = environment.get("AWS_DEFAULT_REGION")
    bucket_name = "hack-fitcheck"

    s3_client = boto3.client(
        "s3",
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region,
    )

    # Clear all items in S3
    response = s3_client.list_objects_v2(Bucket=bucket_name)

    if 'Contents' in response:
        delete_objects = {
            'Objects': [{'Key': obj['Key']} for obj in response['Contents']]
        }

        delete_response = s3_client.delete_objects(Bucket=bucket_name, Delete=delete_objects)

        while response.get('IsTruncated'): 
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                ContinuationToken=response['NextContinuationToken']
            )

            delete_objects = {
                'Objects': [{'Key': obj['Key']} for obj in response['Contents']]
            }

            delete_response = s3_client.delete_objects(Bucket=bucket_name, Delete=delete_objects)

        print("All objects have been deleted.")

    return {"message": "All clothing items have been cleared from SQL, Chroma, and S3."}