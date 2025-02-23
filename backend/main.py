"""FitCheck Backend Main - Called on startup"""

import environment
import database

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from clothes_addition import parse_image, upload_to_chroma

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

# Get database engine
database.Engine()


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
