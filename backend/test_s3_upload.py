"""
Test S3 Upload - Upload a fake receipt and see it appear in S3
"""

from app.services.s3 import s3_service

print("=" * 60)
print("Testing S3 Upload")
print("=" * 60)

# Create fake image data (just some bytes to test)
fake_image_data = b"This is fake image data for testing upload"

# Upload it
print("\nUploading fake receipt...")
s3_url = s3_service.upload_file(
    file_bytes=fake_image_data,
    file_name="test_receipt.jpg",
    user_id="winston@example.com"
)

print("\n" + "=" * 60)
print("Upload Complete!")
print("=" * 60)
print(f"S3 URL: {s3_url}")
print("\nNow check your S3 bucket in AWS Console - you should see a new file!")
print("=" * 60)

# List files to confirm
print("\nFiles in bucket now:")
response = s3_service.s3_client.list_objects_v2(
    Bucket=s3_service.bucket_name,
    Prefix="receipts/"
)

if 'Contents' in response:
    for obj in response['Contents']:
        print(f"  - {obj['Key']}")
else:
    print("  (no files found)")

print("=" * 60)
