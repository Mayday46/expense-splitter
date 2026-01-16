import boto3
from app.config import settings

print("Testing Textract connection...")

client = boto3.client(
    'textract',
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

try:
    response = client.detect_document_text(
        Document={
            'S3Object': {
                'Bucket': 'expense-splitter-receipts-winston',
                'Name': 'receipt1.jpg'
            }
        }
    )

    print("[SUCCESS] Textract works! Basic API successful.")
    print(f"Detected {len(response.get('Blocks', []))} text blocks")

except Exception as e:
    print(f"[ERROR] {e}")
