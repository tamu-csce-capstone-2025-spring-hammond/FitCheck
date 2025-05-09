"""FitCheck Backend Main - Called on startup"""


import environment

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

# Start FastAPI app
app = FastAPI(
    title="FitCheck API Docs",
    version="0.3"
)

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

from routes import login, user, clothing_item, outfit, resale_listing, wear_history, images, filter, facebookAPI, ebayAPI, outfit_wear_history
# Include routes
app.include_router(login.router)
app.include_router(user.router)
app.include_router(clothing_item.router)
app.include_router(outfit.router)
app.include_router(resale_listing.router)
# app.include_router(wear_history.router)
app.include_router(outfit_wear_history.router)
app.include_router(images.router)
app.include_router(filter.router)
app.include_router(facebookAPI.router)
app.include_router(ebayAPI.router)

@app.get("/")
def get_root():
    return HTMLResponse("<h1>Hello, FitCheck Backend!</h1>")

