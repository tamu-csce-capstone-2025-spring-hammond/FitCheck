"""Routes for image upload and parsing."""

import boto3
from fastapi import APIRouter, File, HTTPException, UploadFile, Header
from pydantic import BaseModel
import environment
from clothes_addition import parse_clothing_items, parse_outfit
import database
import uuid
from s3connection import add_image_obj
import chromadb
from route_utils import enforce_logged_in

# FastAPI router
router = APIRouter()

class StandardRequest(BaseModel):
    message: str | None = None
    db_name: str | None = None

class ParsedRequest(BaseModel):
    parsed: list

@router.post("/parse_image")
def post_parse_image(request: StandardRequest):
    return parse_clothing_items(request.message)

@router.post("/upload-new-image")
async def upload_image(file: UploadFile = File(...), authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)

    # Get AWS credentials from environment
    aws_access_key = environment.get("AWS_ACCESS_KEY_ID")
    aws_secret_key = environment.get("AWS_SECRET_ACCESS_KEY")
    aws_region = environment.get("AWS_DEFAULT_REGION")
    bucket_name = "hack-fitcheck"

    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region,
    )

    # Derive file name and upload the file to S3
    file_name = f"{uuid.uuid4()}_{file.filename}"
    upload_result = add_image_obj(file.file, bucket_name, file_name)
    s3_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
    try:
        parsed_items = parse_clothing_items(s3_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image parsing failed: {e}")
    
    # Add clothing items to the cockroach database
    saved_items = []
    for item in parsed_items:
        clothing = database.add_clothing_item(
            user_id=current_user.id,
            description=item["cloth_description"],
            size=item["cloth_size"],
            color=item["cloth_color"],
            s3url=s3_url,
            style=None,
            brand=None,
            category=item["cloth_type"].capitalize(),  
        )

        saved_items.append({
            "id": str(clothing.id),
            "category": clothing.category,
            'description': clothing.description,
        })

    # Upload parsed items to ChromaDB
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection('clothing_items')

    collection.add(
        documents=[item['description'] + item['size'] + item['color'] + item['style'] + item['brand'] + item['category'] for item in saved_items],
        ids=[item['id'] for item in saved_items], 
    )

    return {
        "message": "Upload and parse successful",
        "s3_url": s3_url,
        "parsed_items": saved_items,
    }

@router.post("/upload-new-outfit")
async def upload_outfit(file: UploadFile = File(...), authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)

    # Get AWS credentials from environment
    aws_access_key = environment.get("AWS_ACCESS_KEY_ID")
    aws_secret_key = environment.get("AWS_SECRET_ACCESS_KEY")
    aws_region = environment.get("AWS_DEFAULT_REGION")
    bucket_name = "hack-fitcheck"

    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region,
    )

    # Derive file name and upload the file to S3
    file_name = f"{uuid.uuid4()}_{file.filename}"
    upload_result = add_image_obj(file.file, bucket_name, file_name)
    s3_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
    
    try:
        # Parse the clothing items from the image
        parsed_items = parse_clothing_items(s3_url)
        description = parse_outfit(s3_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image parsing failed: {e}")
    
    # Add outfit to the cockroach database
    saved_items = []

    # Create a ChromaDB client to search for existing items
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="clothing_items")

    add_items = []

    for item in parsed_items:
        results = collection.query(
            query_texts=[item["cloth_description"]],
            n_results=3,
        )
        for result in results['ids'][0]:
            clothing_item = database.get_clothing_item_by_id(result)
            if clothing_item is None or clothing_item.user_id != current_user.id:
                continue
            else:
                add_items.append(result)
                break

        for add in add_items:
            saved_items.append({
                "id": str(add),
            })

        add_items = []
    
    print(saved_items)
    outfit = database.add_outfit(
        user_id=current_user.id,
        description=description,
        s3url=s3_url,
        clothing_item_ids=[str(item['id']) for item in saved_items],
    )   
    
    # Create OutfitItem entries to link clothing items with the outfit
    for item in saved_items:
        database.add_outfit_item(
            outfit_id=outfit.id,
            clothing_item_id=item['id']
        )
    
    # Mark the associated ClothingItem as worn
    for item in saved_items:
        database.mark_clothing_item_worn(item['id'])
    
    # Upload the outfit to ChromaDB
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection('outfits')

    collection.add(
        documents=[outfit.description],
        ids=[str(outfit.id)], 
    )

    return {
        "message": "Upload and parse successful",
        "s3_url": s3_url,
        "parsed_items": saved_items,
    }

@router.post('/chroma-upload')
def chroma_upload(request: StandardRequest):
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name=request.db_name)

    collection.add(
        documents=[doc['cloth_description'] for doc in request.parsed],
        ids=[str(doc['cloth_color']) + str(doc['cloth_size']) + str(doc['cloth_type']) for doc in request.parsed], 
    )

    return {
        "message": "Chroma upload successful",
    }

@router.post('/chroma-query')
def chroma_query(request: StandardRequest):
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="test")
    results = collection.query(
        query_texts=[request.message],
        n_results=3,
    )

    return {
        "message": "Chroma query successful",
        "results": results,
    }

@router.get('/chroma-clear-all')
def chroma_clear_all():
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)

    try:
        collection_names = client.list_collections()  # Now returns List[str] in v0.6.0

        for name in collection_names:
            client.delete_collection(name=name)

        return {
            "message": f"Deleted {len(collection_names)} collections.",
            "deleted_collections": collection_names
        }

    except Exception as e:
        return {"error": str(e)}


if __name__ == '__main__':
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="clothing_items")
    results = collection.query(
        query_texts=['any clothes'],
        n_results=3,
    )

    print(results)