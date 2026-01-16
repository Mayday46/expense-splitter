
import boto3
from app.config import settings


class S3Service:

    def __init__(self):
        # Job 1: Connect to AWS S3
        # Creates boto3 S3 client using credentials
        print("Initializing S3 Service")
        self.s3_client = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        self.bucket_name = settings.S3_BUCKET_NAME
        print(f"[SUCCESS] Connected to S3 bucket: {self.bucket_name}")
    
    def upload_file(self, file_bytes, file_name, user_id):
        # Job 2: Upload file to S3
        # Uploads file to S3 bucket with a unique key

        print(f"Uploading receipt: {file_name} for user: {user_id}")
        import uuid
        from datetime import datetime

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S") # This creates uniqueness of each same name file.
        unique_id = str(uuid.uuid4())[:8]
        file_extension = file_name.split('.')[-1].lower()

        s3_key = f"receipts/{user_id}/{timestamp}_{unique_id}.{file_extension}"

        self.s3_client.put_object(
            Bucket = self.bucket_name,
            Key = s3_key,
            Body = file_bytes,
            ContentType = f"image/{file_extension}"
        )

        s3_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
        print(f"[SUCCESS] File uploaded to S3: {s3_url}")
        return s3_url

s3_service = S3Service()
