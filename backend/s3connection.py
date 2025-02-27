
from dotenv import load_dotenv
load_dotenv()
import boto3
import os

# Initialize S3 client
s3_client = boto3.client("s3")

# Define your bucket and file details
bucket_name = "hack-fitcheck"
local_file = "backend/51815.jpg"
s3_file_key = "51815.jpg"  # Key inside the bucket

# Check if file exists locally before uploading
if not os.path.exists(local_file):
    print(f"Error: File '{local_file}' not found!")
else:
    try:
        # Upload file to S3
        s3_client.upload_file(local_file, bucket_name, s3_file_key)
        print(f"✅ File '{local_file}' successfully uploaded to 's3://{bucket_name}/{s3_file_key}'")
    except Exception as e:
        print(f"❌ Upload failed: {e}")