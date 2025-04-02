import requests
import os
from dotenv import load_dotenv

load_dotenv()

FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_CATALOG_ID = os.getenv("FACEBOOK_CATALOG_ID")
PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN")


# get offer, 
# https://graph.facebook.com/v22.0/1815240749254364/products?access_token=EAATL6xQpwDMBOZCH9RsgBluK8E2n9f2ShCcNSqrxhgTlNppC05xNdBiqgPg704VisNKfJ4lf07f2VoECr4aOCOXt2HkOipqZBR2KIV7fGdXJAMaBj3MGijAI67dNH2O28OojOZBPcJfrmYtew7f519XFG1eYu7OL7XchKasz0ZBDyZAlkPOGjH3tXStphpHVuhXiGhgleGvL7RTSEpgZDZD

# POST REQUEST:
# https://graph.facebook.com/v22.0/1815240749254364/products?name=test5&currency=USD&price=1300&image_url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FImage%23%2Fmedia%2FFile%3AImage_created_with_a_mobile_phone.png&retailer_id=phone-camera&access_token=EAATL6xQpwDMBOZCCh0ThCMgoVCVIk98tpy7aEsg5B9YL5lAecsSL23zIuH7tDoF8574XNzOMw20gWyfZCwJvvBCtpdtHheiUuEiWitxxCOE3HrjSMHmATxSYb1wIMwqvlZCsyjKeM8yRnNOnqcCZBeZCzqZAjp4mzsmOIMLcfvPXk1WlNVkiZBXhFQEuZAJ3kJVBHRZB349v9qMJLsZBWjUqAtGw9u

# def post_to_catalog(name, currency, price, image_url, retailer_id):
#     url = f"https://graph.facebook.com/FACEBOOK_CATALOG_ID/products"
    
#     payload = {
#         "name": name,
#         "currency": currency,
#         "price": price,
#         "image_url": image_url,
#         "retailer_id": retailer_id
#     }
    
#     response = requests.post(url, data=payload)
#     return response.json()

def get_product_id(name):
    url = f"https://graph.facebook.com/"
    url += FACEBOOK_CATALOG_ID
    url += "/products?access_token="
    url += FACEBOOK_ACCESS_TOKEN
    response = requests.get(url)
    data = response.json()
    for product in data.get("data", []):
        if product.get("name") == name:
            return product.get("id")
    return data
    

# def update_product_description(product_id, description, access_token):
#     url = f"https://graph.facebook.com/{product_id}"
    
#     payload = {
#         "description": description,
#         "access_token": access_token
#     }
    
#     response = requests.post(url, data=payload)
#     return response.json()

def main():
    # Example usage
    name = "test5"
    currency = "USD"
    price = 1300
    image_url = "https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png"
    retailer_id = "phone-camera"

    # post_response = post_to_catalog(name, currency, price, image_url, retailer_id)
    # print(post_response)

    product_id = get_product_id(name)
    print(product_id)


if __name__ == "__main__":
    main()