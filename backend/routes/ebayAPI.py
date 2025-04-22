import requests
import json
import uuid
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# FastAPI router
router = APIRouter()

# eBay API credentials and endpoints
CLIENT_ID = os.getenv("EBAY_CLIENT_ID")
CLIENT_SECRET = os.getenv("EBAY_CLIENT_SECRET")
SANDBOX_BASE_URL = "https://api.sandbox.ebay.com"
PRODUCTION_BASE_URL = "https://api.ebay.com"

# Use sandbox for development, switch to production for live environment
BASE_URL = SANDBOX_BASE_URL

# Simple in-memory token storage
user_tokens: Dict[str, str] = {}

def get_access_token(auth_code: str) -> str:
    """Exchange auth code for access token"""
    url = f"{BASE_URL}/identity/v1/oauth2/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {os.getenv('EBAY_AUTH_HEADER')}"
    }
    data = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": os.getenv("EBAY_REDIRECT_URI")
    }
    
    response = requests.post(url, headers=headers, data=data)
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to get access token")
    
    return response.json()["access_token"]

def get_headers(user_id: str) -> dict:
    """Get headers with current access token for a specific user"""
    access_token = user_tokens.get(user_id)
    if not access_token:
        raise HTTPException(status_code=401, detail="No valid token found for user")
    
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

# Pydantic models for request validation
class Location(BaseModel):
    country: str
    postal_code: str
    city: Optional[str] = None
    state_or_province: Optional[str] = None

class ShippingOption(BaseModel):
    shipping_service_code: str
    shipping_cost: float
    additional_shipping_cost: Optional[float] = 0.0
    shipping_carrier_code: Optional[str] = None
    shipping_type: str = "FLAT_RATE"

class InventoryItem(BaseModel):
    sku: str = Field(..., description="Unique identifier for your inventory item")
    title: str
    description: str
    condition: str = "NEW"
    category_id: str
    image_urls: List[str]
    quantity: int = 1
    location: Location
    price: float
    currency: str = "USD"

class OfferRequest(BaseModel):
    sku: str
    marketplace_id: str = "EBAY_US"
    format: str = "FIXED_PRICE"
    available_quantity: int
    category_id: str
    price: float
    currency: str = "USD"
    listing_description: str
    shipping_options: List[ShippingOption]
    fulfillment_policy_id: str
    payment_policy_id: str
    return_policy_id: str
    listing_duration: str = "GTC"  # Good Till Cancelled

class ListingRequest(BaseModel):
    title: str
    description: str
    price: float
    currency: str = "USD"
    condition: str = "NEW"
    category_id: str
    image_urls: List[str]
    quantity: int = 1
    location: Location
    shipping_options: List[ShippingOption]
    fulfillment_policy_id: Optional[str] = None
    payment_policy_id: Optional[str] = None
    return_policy_id: Optional[str] = None
    listing_duration: str = "GTC"  # Good Till Cancelled

class UpdateItemRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    condition: Optional[str] = None
    image_urls: Optional[List[str]] = None

class AuthRequest(BaseModel):
    user_id: str
    auth_code: str

# Helper functions
def generate_sku(title: str) -> str:
    """Generate a unique SKU for an item"""
    base = f"fitcheck-{title.lower().replace(' ', '-')}"
    unique_id = str(uuid.uuid4())[:8]
    return f"{base}-{unique_id}"

# API Endpoints
@router.post("/ebay/auth", summary="Authenticate user with eBay")
def authenticate_user(request: AuthRequest):
    """
    Authenticate a new user with eBay using OAuth flow.
    This should be called after the user has authorized your app on eBay.
    """
    try:
        access_token = get_access_token(request.auth_code)
        user_tokens[request.user_id] = access_token
        return {"message": "User authenticated successfully"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to authenticate with eBay: {str(e)}")

@router.get("/ebay/auth/url", summary="Get eBay authorization URL")
def get_auth_url():
    """
    Get the URL where users should be redirected to authorize the application.
    After authorization, they will be redirected back with an auth code.
    """
    # This would typically be configured in your eBay application settings
    redirect_uri = os.getenv("EBAY_REDIRECT_URI", "https://yourapp.com/callback")
    
    auth_url = (
        f"https://auth.sandbox.ebay.com/oauth2/authorize?"
        f"client_id={CLIENT_ID}&"
        f"response_type=code&"
        f"redirect_uri={redirect_uri}&"
        f"scope=https://api.ebay.com/oauth/api_scope "
        f"https://api.ebay.com/oauth/api_scope/sell.inventory "
        f"https://api.ebay.com/oauth/api_scope/sell.marketing "
        f"https://api.ebay.com/oauth/api_scope/sell.account"
    )
    
    return {"auth_url": auth_url}

@router.post("/ebay/inventory/create", summary="Create inventory item")
def create_inventory_item(item: InventoryItem, user_id: str):
    """
    Create a new inventory item on eBay.
    This is the first step in the two-step listing process.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/inventory_item/{item.sku}"
        headers = get_headers(user_id)
        
        payload = {
            "availability": {
                "shipToLocationAvailability": {
                    "quantity": item.quantity
                }
            },
            "condition": item.condition,
            "product": {
                "title": item.title,
                "description": item.description,
                "imageUrls": item.image_urls,
                "aspects": {},  # Required aspects depend on the category
            },
            "packageWeightAndSize": {
                "packageType": "PACKAGE_SMALL",
            }
        }
        
        response = requests.put(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201, 204]:
            return {"message": "Inventory item created successfully", "sku": item.sku}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to create inventory item: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating inventory item: {str(e)}")

@router.post("/ebay/offer/create", summary="Create offer from inventory item")
def create_offer(offer: OfferRequest, user_id: str):
    """
    Create an offer for an existing inventory item.
    This is the second step in the two-step listing process.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/offer"
        headers = get_headers(user_id)
        
        payload = {
            "sku": offer.sku,
            "marketplaceId": offer.marketplace_id,
            "format": offer.format,
            "availableQuantity": offer.available_quantity,
            "categoryId": offer.category_id,
            "listingDescription": offer.listing_description,
            "listingPolicies": {
                "fulfillmentPolicyId": offer.fulfillment_policy_id,
                "paymentPolicyId": offer.payment_policy_id,
                "returnPolicyId": offer.return_policy_id
            },
            "pricingSummary": {
                "price": {
                    "value": str(offer.price),
                    "currency": offer.currency
                }
            },
            "listingDuration": offer.listing_duration,
            "merchantLocationKey": "default"  # You should create and use an actual location key
        }
        
        # Add shipping options if provided
        if offer.shipping_options:
            payload["listingPolicies"]["shippingPolicyId"] = offer.fulfillment_policy_id
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 201:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to create offer: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating offer: {str(e)}")

@router.post("/ebay/offer/publish/{offer_id}", summary="Publish an offer")
def publish_offer(offer_id: str, user_id: str):
    """
    Publish an offer to make it live on eBay.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/offer/{offer_id}/publish"
        headers = get_headers(user_id)
        
        response = requests.post(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to publish offer: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error publishing offer: {str(e)}")

@router.post("/ebay/listing", summary="Create a complete listing (one-step)")
def create_listing(request: ListingRequest, user_id: str):
    """
    Create a complete eBay listing in one step.
    This combines inventory item creation and offer creation/publishing.
    """
    try:
        # Step 1: Generate a unique SKU
        sku = generate_sku(request.title)
        
        # Step 2: Create inventory item
        inventory_item = InventoryItem(
            sku=sku,
            title=request.title,
            description=request.description,
            condition=request.condition,
            category_id=request.category_id,
            image_urls=request.image_urls,
            quantity=request.quantity,
            location=request.location,
            price=request.price,
            currency=request.currency
        )
        
        inventory_result = create_inventory_item(inventory_item, user_id)
        
        # Step 3: Create an offer
        # You should have these policy IDs from your eBay Seller Account setup
        fulfillment_policy_id = request.fulfillment_policy_id or "default_fulfillment_policy_id"
        payment_policy_id = request.payment_policy_id or "default_payment_policy_id"
        return_policy_id = request.return_policy_id or "default_return_policy_id"
        
        offer = OfferRequest(
            sku=sku,
            available_quantity=request.quantity,
            category_id=request.category_id,
            price=request.price,
            currency=request.currency,
            listing_description=request.description,
            shipping_options=request.shipping_options,
            fulfillment_policy_id=fulfillment_policy_id,
            payment_policy_id=payment_policy_id,
            return_policy_id=return_policy_id
        )
        
        offer_result = create_offer(offer, user_id)
        
        # Step 4: Publish the offer
        offer_id = offer_result.get("offerId")
        publish_result = publish_offer(offer_id, user_id)
        
        return {
            "message": "Listing created and published successfully",
            "sku": sku,
            "offer_id": offer_id,
            "listing_id": publish_result.get("listingId")
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating listing: {str(e)}")

@router.get("/ebay/inventory/items", summary="Get all inventory items")
def get_inventory_items(user_id: str, limit: int = 10, offset: str = None):
    """
    Get all inventory items for the authenticated user.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/inventory_item"
        headers = get_headers(user_id)
        
        params = {"limit": limit}
        if offset:
            params["offset"] = offset
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to retrieve inventory items: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inventory items: {str(e)}")

@router.get("/ebay/inventory/item/{sku}", summary="Get inventory item by SKU")
def get_inventory_item(sku: str, user_id: str):
    """
    Get details for a specific inventory item by SKU.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/inventory_item/{sku}"
        headers = get_headers(user_id)
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to retrieve inventory item: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inventory item: {str(e)}")

@router.get("/ebay/offers", summary="Get all offers")
def get_offers(user_id: str, sku: Optional[str] = None, limit: int = 10, offset: str = None):
    """
    Get all offers (or offers for a specific SKU).
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/offer"
        headers = get_headers(user_id)
        
        params = {"limit": limit}
        if sku:
            params["sku"] = sku
        if offset:
            params["offset"] = offset
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to retrieve offers: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving offers: {str(e)}")

@router.get("/ebay/offer/{offer_id}", summary="Get offer by ID")
def get_offer(offer_id: str, user_id: str):
    """
    Get details for a specific offer by ID.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/offer/{offer_id}"
        headers = get_headers(user_id)
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to retrieve offer: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving offer: {str(e)}")

@router.patch("/ebay/inventory/update/{sku}", summary="Update inventory item")
def update_inventory_item(sku: str, request: UpdateItemRequest, user_id: str):
    """
    Update an existing inventory item.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/inventory_item/{sku}"
        headers = get_headers(user_id)
        
        # Get current inventory item
        current_item = get_inventory_item(sku, user_id)
        
        # Update the fields that are provided
        payload = {}
        
        if "product" not in payload:
            payload["product"] = {}
            
        if request.title:
            payload["product"]["title"] = request.title
            
        if request.description:
            payload["product"]["description"] = request.description
            
        if request.image_urls:
            payload["product"]["imageUrls"] = request.image_urls
            
        if request.condition:
            payload["condition"] = request.condition
            
        if request.quantity:
            if "availability" not in payload:
                payload["availability"] = {"shipToLocationAvailability": {}}
            payload["availability"]["shipToLocationAvailability"]["quantity"] = request.quantity
        
        # Only send update if there are changes
        if payload:
            response = requests.put(url, headers=headers, json=payload)
            
            if response.status_code in [200, 201, 204]:
                return {"message": "Inventory item updated successfully"}
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to update inventory item: {response.text}"
                )
        else:
            return {"message": "No updates specified"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating inventory item: {str(e)}")

@router.delete("/ebay/inventory/delete/{sku}", summary="Delete inventory item")
def delete_inventory_item(sku: str, user_id: str):
    """
    Delete an inventory item. This also deletes all associated offers.
    """
    try:
        url = f"{BASE_URL}/sell/inventory/v1/inventory_item/{sku}"
        headers = get_headers(user_id)
        
        response = requests.delete(url, headers=headers)
        
        if response.status_code == 204:
            return {"message": "Inventory item deleted successfully"}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to delete inventory item: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting inventory item: {str(e)}")

@router.post("/ebay/logout", summary="Logout user")
def logout_user(user_id: str):
    """
    Logout a user and remove their token.
    """
    if user_id in user_tokens:
        del user_tokens[user_id]
        return {"message": "User logged out successfully"}
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/ebay/account/policies", summary="Get user's selling policies")
def get_policies(user_id: str, policy_type: str = "all"):
    """
    Get the user's selling policies (return, payment, and fulfillment).
    """
    valid_types = ["all", "return", "payment", "fulfillment"]
    if policy_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Policy type must be one of {valid_types}")
    
    headers = get_headers(user_id)
    results = {}
    
    try:
        if policy_type in ["all", "return"]:
            url = f"{BASE_URL}/sell/account/v1/return_policy"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                results["return_policies"] = response.json()
        
        if policy_type in ["all", "payment"]:
            url = f"{BASE_URL}/sell/account/v1/payment_policy"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                results["payment_policies"] = response.json()
        
        if policy_type in ["all", "fulfillment"]:
            url = f"{BASE_URL}/sell/account/v1/fulfillment_policy"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                results["fulfillment_policies"] = response.json()
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving policies: {str(e)}")

@router.get("/ebay/callback")
async def ebay_callback(code: str, state: Optional[str] = None):
    """
    Handle the callback from eBay OAuth flow.
    This endpoint receives the authorization code and exchanges it for an access token.
    """
    try:
        # Exchange the authorization code for an access token
        url = f"{BASE_URL}/identity/v1/oauth2/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {os.getenv('EBAY_AUTH_HEADER')}"
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": os.getenv("EBAY_REDIRECT_URI")
        }
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to get access token")
        
        token_data = response.json()
        access_token = token_data["access_token"]
        
        # Here you would typically:
        # 1. Get the user's eBay ID or other identifying information
        # 2. Store the token in your database or session
        # 3. Create or update the user's account in your system
        
        # For now, we'll just return a success message
        return {
            "message": "Successfully authenticated with eBay",
            "access_token": access_token
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during callback: {str(e)}")