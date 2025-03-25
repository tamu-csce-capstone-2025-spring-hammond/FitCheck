"""FitCheck Backend Main - Called on startup"""

import re

import environment
import database
import constants
from auth import verify_password

from fastapi import FastAPI, Header, HTTPException, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from clothes_addition import parse_image, upload_to_chroma
from s3connection import add_image, get_image, delete_image, add_image_obj
from database import get_user_by_login_token
from models import ClothingItem
from sqlalchemy.orm import Session
from fastapi import Depends
from typing import Annotated

import boto3
import uuid

# Start FastAPI app
app = FastAPI()

# CORS configuration
origins = [
    environment.get("FRONTEND_URL"),
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def enforce_logged_in(authorization: str):
    token = authorization[7:]
    if token == "":
        raise HTTPException(status_code=401, detail="Not logged in.")
    user = database.get_user_by_login_token(token)
    if user is None:
        raise HTTPException(status_code=400, detail="Bad login token.")
    return user


class TestRequest(BaseModel):
    message: str


@app.get("/")
def get_root():
    return HTMLResponse("<h1>Hello, FitCheck Backend!</h1>")

@app.get("/status")
def get_status():
    return {
        "status": "ok",
        "frontend_url": environment.get("FRONTEND_URL"),
        }

@app.post("/test")
def post_test(request: TestRequest):
    return {
        "FitCheck": "Hello!",
        "message": request.message
        }

@app.post("/parse_image")
def post_parse_image(request: TestRequest):
    print(request)
    return parse_image(request.message)


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

def validate_login_strings(email: str, password: str, name: str|None = None):
    # Check field lengths
    if len(email) < 1 or len(email) > constants.MAX_EMAIL_LENGTH:
        return {"error": f"Email must be between 1 and {constants.MAX_EMAIL_LENGTH} characters."}
    if len(password) < 1 or len(password) > constants.MAX_PASSWORD_LENGTH:
        return {"error": f"Password must be between 1 and {constants.MAX_PASSWORD_LENGTH} characters."}
    if name:
        if len(name) < 1 or len(name) > constants.MAX_NAME_LENGTH:
            return {"error": f"Name must be between 1 and {constants.MAX_NAME_LENGTH} characters."}

    # Check if email is valid
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"error": "Invalid email."}

@app.post("/signup")
def post_signup(request: SignupRequest):    
    error = validate_login_strings(request.email, request.password, request.name)
    if error:
        return error
    
    # Check if user already exists
    if database.get_user_by_email(request.email):
        return {"error": "User already exists."}
    
    # Create user
    user = database.create_user(request.name, request.email, request.password)
    return {"success": True, "user": user}


class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def post_login(request: LoginRequest):
    error = validate_login_strings(request.email, request.password)
    if error:
        return error
    
    # Get user
    user = database.get_user_by_email(request.email, True)
    if not user:
        return {"error": "User does not exist."}
    
    # Check password
    if not verify_password(request.password, user.password_salt_and_hash):
        return {"error": "Incorrect password."}
    
    return {"success": True, "user": user}


@app.get("/me")
def get_me(authorization: str = Header(...)):
    current_user = enforce_logged_in(authorization)
    return {"user" : current_user}

@app.post("/upload-image")
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

@app.get("/my-clothes")
def get_my_clothes():
    with database.Session() as session:
        clothes = session.query(ClothingItem).filter(ClothingItem.user_id == 1).all()

        return [
            {
                "id": c.id,
                "name": c.name,
                "size": c.size,
                "color": c.color,
                "category": c.category,
                "created_at": str(c.created_at)
            }
            for c in clothes
        ]
