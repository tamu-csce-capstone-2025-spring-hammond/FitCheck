import requests
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import environment
import os
from dotenv import load_dotenv

# load_dotenv()
# FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
# FACEBOOK_CATALOG_ID = os.getenv("FACEBOOK_CATALOG_ID")
# PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN")

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
    size: str
    quantity: int = 1
    retailer_id: str
    description: str
    website_link: str = "https://www.fitcheck.fashion"
    
class updateRequest(BaseModel):
    name: str
    currency: str
    price: int
    size: str
    quantity: int
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
    size = request.size
    quantity = request.quantity
    retailer_id = request.retailer_id
    description = request.description
    website_link = request.website_link
    
    try:
        response = post_to_catalog(name, currency, price, image_url, size, quantity, retailer_id, description, website_link)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    
    

# function that backend will call to post to facebook catalog    
def post_to_catalog(name, currency, price, image_url, size, quantity, retailer_id, description="", website_link="https://www.facebook.com/business/shops"):
    '''will post a new item to the facebook catalog shop'''
    
    url = f"https://graph.facebook.com/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    price = price*100 # price is handled in cents
    payload = {
        "name": name,
        "currency": currency,
        "price": price,
        "size": size,
        "quantity_to_sell_on_facebook": quantity,
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

    
@router.get("/facebook/userproducts/{email}")
def get_user_products(email):
    '''given an email, get all products with that in the retailer id'''
    filtered_products = []
    url = f"https://graph.facebook.com/v22.0/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.get(url,headers=headers)
    
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    
    data = response.json()
    for product in data.get("data", []):
        retailer_id = product.get("retailer_id", "")
        if email in retailer_id:
            filtered_products.append(product)

    if not filtered_products:
        print("No products found for the given email.")
        raise HTTPException(status_code=404, detail="No products found for the given email.")
    
    return {"products": filtered_products}  # Return the filtered products as a JSON object


@router.get("/facebook/price/{name}")
def get_price(name):
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
    if product_id == 0:
        print("Product not found, error:", response.status_code)
        raise HTTPException(status_code=500, detail=data)
    else:
        # getting the product availability
        url = f"https://graph.facebook.com/v22.0/{product_id}"
        headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
        params = {
            "fields": "price",
        }
        response = requests.get(url,headers=headers, params=params)
        
        if response.status_code != 200:
            print("Error fetching products:", response.status_code)
            return None
        else:
            data = response.json()
            print("Product price:", data)
            return name + " is priced at " + data.get("price", "No price info")


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
        print("Product not found, error:", response.status_code)
        raise HTTPException(status_code=500, detail=data)
    
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

@router.get("/facebook/description/{name}")
def get_product_description(name):
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
        print("Product not found, error:", response.status_code)
        raise HTTPException(status_code=500, detail=data)
    
    # getting the product availability
    url = f"https://graph.facebook.com/v22.0/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    params = {
        "fields": "description",
    }
    response = requests.get(url,headers=headers, params=params)
    
    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        return None
    else:
        data = response.json()
        print("Product description:", data)
        return "Description for " + name + " is: " + data.get("description", "No description given")


@router.get("/facebook/size/{name}")
def get_size(name: str):
    '''Given a product name, will return the product size'''

    # Getting the product ID for the given name
    product_id = 0
    url = f"https://graph.facebook.com/v22.0/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print("Error fetching products:", response.status_code)
        raise HTTPException(status_code=500, detail="Error fetching products")

    data = response.json()
    for product in data.get("data", []):
        if product.get("name") == name:
            print("Product found:", product)
            product_id = product.get("id")
            break

    if product_id == 0:
        print("Product not found")
        raise HTTPException(status_code=404, detail="Product not found")

    # Getting the product size
    url = f"https://graph.facebook.com/v22.0/{product_id}"
    params = {"fields": "size"}
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        print("Error fetching product size:", response.status_code)
        raise HTTPException(status_code=500, detail="Error fetching product size")

    data = response.json()
    print("Product size:", data)
    return {"name": name, "size": data.get("size", "No size info available")}



@router.patch("/facebook/update")
def update_product(request: updateRequest):
    '''will update a product with any new given fields'''
    product_id = 0
    
    # fields to update
    name = request.name
    currency = request.currency
    price = request.price
    size = request.size
    quantity = request.quantity
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
        "size": size,
        "quantity_to_sell_on_facebook": quantity,
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
    name = "Uniqlo Green T-shirt"
    currency = "USD"
    price = 10
    size = "M"
    quantity = 1
    image_url = "https://media-hosting.imagekit.io/73fe1c298ee74a65/Image_created_with_a_mobile_phone.png?Expires=1838924401&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=vQpBJWYhqWxT1L1JcJ8eLypJzdmOkJneFUx1OgcaOvMRLZgYjtp4ZKx6cM6UVIxUWwojnI3~rBz0NeM9cn5r7YmT6j7bXqoM5GlaGmD-DR8HY5NwrlwB1frtV-uzEgsGY-fbo6oBa9eDZk6JZDeivH9JjkTHMGCxOs2R3RGXziwvVQPgNf-kRV~HPe5aqYZWa-JpEiQsHpMs7WSFJyzeqbuybY65QtiejBSlvSUp4kBdMzEAd-gd1eoFz8Y-1Wa0mGra3pHlx0MqLWh-nDdChSr500-ERXqpf7be1Bg~LJ465MUGhUI4iCQFmd3l5m0jL0Q0zCe~G8~klaWAJKg8Ng__"
    retailer_id = "anishkarthik@gmail.com-uniqlo-medium-green-tshirt" # has to be unique
    new_image_url = "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/465187/sub/goods_465187_sub14_3x4.jpg?width=600"
    description = "a medium green t-shirt from uniqlo"
    # post_to_catalog(name, currency, price, new_image_url, size, quantity, retailer_id, description)
    # delete_product("test2")
    # print(get_user_products("testing"))
    # print(get_product_id("austin"))
    # print(get_price("austin"))
    # print(get_product_description("austin"))
    # print(get_size("Fake Uniqlo T-shirt"))
    
    
    
    # update_data = updateRequest(
    #     name="austin",
    #     currency="USD",
    #     price=9,
    #     size="Large",
    #     quantity=1,
    #     image_url="https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/465187/sub/goods_465187_sub14_3x4.jpg?width=600",
    #     description="Updated description for the fake Uniqlo T-shirt",
    #     website_link="https://www.facebook.com/business/shops"
    # )

    # # Call the update_product function
    # print(update_product(update_data))

if __name__ == "__main__":
    main()