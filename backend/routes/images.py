"""Routes for image upload and parsing."""

import boto3
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

import backend.environment as environment
from backend.clothes_addition import parse_image
import backend.database as database

import uuid

from backend.s3connection import add_image_obj

# FastAPI router
router = APIRouter()


class TestRequest(BaseModel):
    message: str

@router.post("/parse_image")
def post_parse_image(request: TestRequest):
    print(request)
    return parse_image(request.message)


@router.post("/upload-image")
def upload_image(file: UploadFile = File(...)):

    # TEMP WHILE AUTH NOT IN PLACE
    current_user = 1



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


    file_name = f"{uuid.uuid4()}_{file.filename}"
    upload_result = add_image_obj(file.file, bucket_name, file_name)
    s3_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"

    try:
        parsed_items = parse_image(s3_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image parsing failed: {e}")

    saved_items = []
    for item in parsed_items:
        clothing = database.add_clothing_item(
            user_id=current_user.id,
            name=item["cloth_description"],
            size=item["cloth_size"],
            color=item["cloth_color"],
            style=None,
            brand=None,
            category=item["cloth_type"].capitalize(),  
        )
        saved_items.append({
            "id": clothing.id,
            "name": clothing.name,
            "category": clothing.category,
        })

    return {
        "message": "Upload and parse successful",
        "s3_url": s3_url,
        "parsed_items": saved_items,
    }