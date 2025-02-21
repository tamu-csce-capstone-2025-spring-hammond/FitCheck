from openai import OpenAI
from dotenv import load_dotenv
import chromadb
import json



def parse_image(url : str):
    '''
    This function takes in an image url and returns a list of json objects for each clothing item in the image.
    Each json object contains the cloth type, cloth size, clothing color, and clothing description.

    Example:
    [
        {
            "cloth_type": "shirt",
            "cloth_size": "medium",
            "cloth_color": "blue",
            "cloth_description": "a blue shirt with a white logo"
        },
        {
            "cloth_type": "pants",
            "cloth_size": "large",
            "cloth_color": "black",
            "cloth_description": "black pants with a white stripe
        },
    ]

    Args:
    url : str : The url of the image to be parsed

    Returns:
    parsed : A list of json objects for each clothing item in the image
    '''
    load_dotenv()
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": '''What clothes are in this image? Return only a json object for each clothing item with the cloth type, cloth size, clothing color, and clothing description.
                        Example:[{"cloth_type": "shirt","cloth_size": "medium","cloth_color": "blue","cloth_description": "a blue shirt with a white logo"}, {"cloth_type": "pants","cloth_size": "large","cloth_color": "black","cloth_description": "black pants with a white stripe"}]
                        Return nothing except the json object on one line with no quotation marks or text outside of the object.
                    '''},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": url,
                        },
                    },
                ],
            }
        ],
        max_tokens=300,
    )

    parsed = [i for i in json.loads(completion.choices[0].message.content)]
    return parsed

def upload_to_chroma(parsed : list):
    '''
    This function takes in a list of json objects for each clothing item in the image and uploads them to the chroma database.
    
    Args:
    parsed : list : A list of json objects for each clothing item in the image

    Returns:
    None
    '''

    client = chromadb.HttpClient()

    collection = client.get_or_create_collection(name="test")

    collection.add(
        documents=[doc['cloth_description'] for doc in parsed],
        ids=[str(doc['cloth_color']) + str(doc['cloth_size']) + str(doc['cloth_type']) for doc in parsed], 
    )

def query_chroma(chroma_db_name : str, query : str, num_items : int):
    '''
    This function takes in a query and returns the top n items from the chroma database that match the query.
    
    Args:
    chroma_db_name : str : The name of the chroma database to query
    query : str : The query to search for in the chroma database
    num_items : int : The number of items to return
    
    Returns:
    list : A list of the top num_items items from the chroma database that match the query
    '''
    client = chromadb.HttpClient()

    collection = client.get_or_create_collection(name=chroma_db_name)
    results = collection.query(
        query_texts=[query],
        n_results=num_items,

    )

    return results


