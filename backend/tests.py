import environment
import chromadb

def test_chroma():
    '''
    This function tests the chroma database by adding a document and querying it.
    
    Returns:
    None
    '''
    client = chromadb.HttpClient(host=environment.get('CHROMA_DB_ADDRESS'), port=8000)
    collection = client.get_or_create_collection(name="clothing_items")

    results = collection.query(
        query_texts=["any clothing items"],
        n_results=3,
    )

    print(results)

if __name__ == '__main__':
    test_chroma()