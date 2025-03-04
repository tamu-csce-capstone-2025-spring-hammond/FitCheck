import boto3
import os
import environment


# Get AWS credentials from environment
aws_access_key = environment.get("AWS_ACCESS_KEY_ID")
aws_secret_key =  environment.get("AWS_SECRET_ACCESS_KEY")
aws_region =  environment.get("AWS_DEFAULT_REGION")

# Debug: Print keys (DO NOT do this in production!)
if not aws_access_key or not aws_secret_key:
    print("❌ AWS credentials not loaded. Check .env file!")

# Initialize S3 client using the loaded credentials
s3_client = boto3.client(
    "s3",
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=aws_region,
)

# Define your bucket and file details
bucket_name = "hack-fitcheck"
local_file = "51815.jpg"
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
