import requests
import os
from dotenv import load_dotenv

load_dotenv()

FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_CATALOG_ID = os.getenv("FACEBOOK_CATALOG_ID")
PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN")


def get_product_id(name):
    '''given a product name, will return the product id'''
    
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
            return product.get("id")
    
    print("Product not found, error:", response.status_code)
    return data


def get_product_availability(name):
    '''given a product name, will return the product availability'''
    product_id = get_product_id(name)
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
        print(name,"is", data.get("availability", "No availability info"))
        return data

def post_to_catalog(name, currency, price, image_url, retailer_id, description="", website_link="https://www.facebook.com/business/shops"):
    '''will post a new item to the facebook catalog shop'''
    
    url = f"https://graph.facebook.com/{FACEBOOK_CATALOG_ID}/products"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
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


def update_product_price(name, price):
    '''given a product name and new price number, will update accordingly'''
    # price is in cents
    
    product_id = get_product_id(name)
    url = f"https://graph.facebook.com/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    price = price*100
    payload = {
        "price": price
    }
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code != 200:
        print("Error updating product price:", response.status_code)
        return None
    else:
        print("Product price updated successfully")
        return response.json()


def update_product_description(name, description):
    '''given a product name and new description, will update accordingly'''
    
    product_id = get_product_id(name)
    url = f"https://graph.facebook.com/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    payload = {
        "description": description
    }
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code != 200:
        print("Error updating product description:", response.status_code)
        return None
    else:
        print("Product description updated successfully")
        return response.json()
    

def update_image_url(name, image_url):
    '''given a product name and new image_url, will update accordingly'''
    
    product_id = get_product_id(name)
    url = f"https://graph.facebook.com/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    payload = {
        "image_url": image_url
    }
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code != 200:
        print("Error updating product image:", response.status_code)
        return None
    else:
        print("Product image updated successfully")
        return response.json()


def delete_product(name):
    '''given a product name, will delete the product'''
    
    product_id = get_product_id(name)
    url = f"https://graph.facebook.com/{product_id}"
    headers = {"Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}"}
    response = requests.delete(url, headers=headers)
    
    if response.status_code != 200:
        print("Error deleting product:", response.status_code)
        return None
    else:
        print("Product deleted successfully")
        return response.json()
    

def main():
    # Example usage
    name = "test5"
    currency = "USD"
    price = 13
    image_url = "https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png"
    retailer_id = "phone-camera" # has to be unique
    new_image_url = "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/465187/sub/goods_465187_sub14_3x4.jpg?width=600"
    description = "new description"

    # post_to_catalog(name, currency, price, new_image_url, retailer_id, description) # post request

    # get_product_id(name) # get product id
    
    # update_product_description(name, "new description") # update product description
    
    # update_image_url(name, new_image_url) # update image url
    
    # delete_product("test5") # delete product
    
    # update_product_price(name, 15) # update product price
    
    # get_product_availability(name) # get product availability
    

if __name__ == "__main__":
    main()