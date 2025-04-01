
import boto3
import os
import environment

# Get AWS credentials from environment
aws_access_key = environment.get("AWS_ACCESS_KEY_ID")
aws_secret_key = environment.get("AWS_SECRET_ACCESS_KEY")
aws_region = environment.get("AWS_DEFAULT_REGION")
bucket_name = "hack-fitcheck"

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=aws_region,
)

def add_image(local_file_path, s3_file_key=None):
    """
    Upload an image to S3 bucket
    :param local_file_path: Path to local file
    :param s3_file_key: Key for S3 object (defaults to filename if not provided)
    :return: bool, str: Success status and message
    """
    if not os.path.exists(local_file_path):
        return False, f"Error: File '{local_file_path}' not found!"

    # Use filename as key if not provided
    if s3_file_key is None:
        s3_file_key = os.path.basename(local_file_path)

    try:
        s3_client.upload_file(local_file_path, bucket_name, s3_file_key)
        return True, f"✅ File successfully uploaded to 's3://{bucket_name}/{s3_file_key}'"
    except Exception as e:
        return False, f"❌ Upload failed: {str(e)}"

def add_image_obj(file, bucket_name, s3_file_key):
    try:
        s3_client.upload_fileobj(file, bucket_name, s3_file_key)
        return True, f"✅ File successfully uploaded to 's3://{bucket_name}/{s3_file_key}'"
    except Exception as e:
        return False, f"❌ Upload failed: {str(e)}"

    
def get_image(s3_file_key, local_file_path=None):
    """
    Download an image from S3 bucket
    :param s3_file_key: Key of the file in S3
    :param local_file_path: Local path to save the file
    :return: bool, str: Success status and message
    """
    if local_file_path is None:
        local_file_path = s3_file_key

    try:
        s3_client.download_file(bucket_name, s3_file_key, local_file_path)
        return True, f"✅ File successfully downloaded to '{local_file_path}'"
    except Exception as e:
        return False, f"❌ Download failed: {str(e)}"

def delete_image(s3_file_key):
    """
    Delete an image from S3 bucket
    :param s3_file_key: Key of the file to delete
    :return: bool, str: Success status and message
    """
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=s3_file_key)
        return True, f"✅ File '{s3_file_key}' successfully deleted from bucket"
    except Exception as e:
        return False, f"❌ Delete failed: {str(e)}"