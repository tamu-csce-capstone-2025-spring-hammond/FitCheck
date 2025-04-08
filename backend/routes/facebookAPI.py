import requests
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import environment


FACEBOOK_ACCESS_TOKEN = environment.get("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_CATALOG_ID = environment.get("FACEBOOK_CATALOG_ID")
PAGE_ACCESS_TOKEN = environment.get("PAGE_ACCESS_TOKEN")

# FastAPI router
router = APIRouter()

class postingRequest(BaseModel):
    name: str
    currency: str
    price: int
    image_url: str
    retailer_id: str
    description: str
    website_link: str = "https://www.facebook.com/business/shops"
    
class updateRequest(BaseModel):
    name: str
    currency: str
    price: int
    image_url: str
    description: str
    website_link: str


@router.post("/facebook/catalog")
def post_to_facebook_catalog(request: postingRequest):
    '''will post a new item to the facebook catalog shop'''
    
    name = request.name
    currency = request.currency
    price = request.price
    image_url = request.image_url
    retailer_id = request.retailer_id
    description = request.description
    website_link = request.website_link
    
    try:
        response = post_to_catalog(name, currency, price, image_url, retailer_id, description, website_link)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    
    

# function that backend will call to post to facebook catalog    
def post_to_catalog(name, currency, price, image_url, retailer_id, description="", website_link="https://www.facebook.com/business/shops"):
    '''will post a new item to the facebook catalog shop'''
    
    url = f"https://graph.facebook.com/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    price = price*100 # price is handled in cents
    payload = {
        "name": name,
        "currency": currency,
        "price": price,
        "image_url": image_url,
        "retailer_id": retailer_id,
        "url": website_link,
        "description": description
    }
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code == 200:
        print("Product posted successfully")
        return response.json()
    else:
        raise Exception(f"Error posting product: {response.text}")
    

@router.get("/facebook/catalog/{name}")
def get_product_id(name):
    '''given a product name, will return the product id'''
    
    product_id = 0
    url = f"https://graph.facebook.com/v22.0/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.get(url,headers=headers)
    
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    
    data = response.json()
    for product in data.get("data", []):
        if product.get("name") == name:
            product_id = product.get("id")
            break
    if product_id != 0:
        return product_id
    else:
        print("Product not found, error:", response.status_code)
        raise HTTPException(status_code=500, detail=data)


@router.get("/facebook/availability/{name}")
def get_product_availability(name):
    '''given a product name, will return the product availability'''
    
    # getting the product id for the given name
    product_id = 0
    url = f"https://graph.facebook.com/v22.0/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.get(url,headers=headers)
    
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    
    data = response.json()
    for product in data.get("data", []):
        if product.get("name") == name:
            print("Product found:", product)
            product_id = product.get("id")
    if product_id == 0:
        print("Product not found")
        return None
    
    # getting the product availability
    url = f"https://graph.facebook.com/v22.0/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    params = {
        "fields": "availability",
    }
    response = requests.get(url,headers=headers, params=params)
    
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    else:
        data = response.json()
        print("Product availability:", data)
        return name + "is" + data.get("availability", "No availability info")


@router.patch("/facebook/update")
def update_product(request: updateRequest):
    '''will update a product with any new given fields'''
    product_id = 0
    
    # fields to update
    name = request.name
    currency = request.currency
    price = request.price
    image_url = request.image_url
    description = request.description
    website_link = request.website_link
    
    # getting the product id
    url = f"https://graph.facebook.com/v22.0/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.get(url,headers=headers)
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    data = response.json()
    for product in data.get("data", []):
        if product.get("name") == name:
            print("Product found:", product)
            product_id = product.get("id")
    if product_id == 0:
        print("Product not found")
        return "Error:" + response.status_code
    
    # updating the product
    url = f"https://graph.facebook.com/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    price = price*100 # price is handled in cents
    payload = {
        "name": name,
        "currency": currency,
        "price": price,
        "image_url": image_url,
        "url": website_link,
        "description": description
    }
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code != 200:
        print("Error updating product price:", response.status_code)
        return None
    else:
        print("Product price updated successfully")
        return response.json()


@router.delete("/facebook/delete")
def delete_product(name):
    '''given a product name, will delete the product'''
    
    # getting the product id
    url = f"https://graph.facebook.com/v22.0/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.get(url,headers=headers)
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    data = response.json()
    for product in data.get("data", []):
        if product.get("name") == name:
            print("Product found:", product)
            product_id = product.get("id")
    if product_id == 0:
        print("Product not found")
        return "Error:" + response.status_code
    
    # deleting the product
    url = f"https://graph.facebook.com/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.delete(url, headers=headers)
    
    if response.status_code != 200:
        print("Error deleting product:", response.status_code)
        return None
    else:
        print(response.json())
        return name + " deleted successfully"
    

def main():
    # Example usage
    name = "Fake Uniqlo T-shirt"
    currency = "USD"
    price = 18
    image_url = "https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png"
    retailer_id = "uniqlo-medium-green-tshirt" # has to be unique
    new_image_url = "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/465187/sub/goods_465187_sub14_3x4.jpg?width=600"
    description = "Medium Green T-shirt"

if __name__ == "__main__":
    main()