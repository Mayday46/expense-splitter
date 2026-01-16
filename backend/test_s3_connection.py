"""
Test S3 Service - Does it connect?
"""

from app.services.s3 import s3_service

print("=" * 60)
print("Testing S3 Connection")
print("=" * 60)

# Try to list objects in bucket (just to test connection)
try:
    response = s3_service.s3_client.list_objects_v2(
        Bucket=s3_service.bucket_name,
        MaxKeys=5  # Only get first 5 files
    )

    print("\n[SUCCESS] S3 connection works!")
    print(f"Bucket: {s3_service.bucket_name}")
    print(f"Region: {s3_service.s3_client.meta.region_name}")

    # Show files in bucket
    if 'Contents' in response:
        print(f"\nFiles in bucket: {len(response['Contents'])} found")
        for obj in response['Contents']:
            print(f"  - {obj['Key']}")
    else:
        print("\nBucket is empty (no files yet)")

except Exception as e:
    print(f"\n[ERROR] Connection failed: {e}")

print("=" * 60)
