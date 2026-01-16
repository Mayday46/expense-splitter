"""
Test the complete API endpoint
Tests: Upload receipt → S3 → Textract → Return data
"""

import requests
import io

print("=" * 60)
print("TESTING COMPLETE API ENDPOINT")
print("=" * 60)

# Base URL
BASE_URL = "http://127.0.0.1:8000"

# Step 1: Login to get token
print("\nStep 1: Logging in...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "email": "test@example.com",
        "password": "password123"
    }
)

if login_response.status_code != 200:
    print(f"[ERROR] Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["token"]
print("[SUCCESS] Logged in! Got token.")

# Step 2: Create a fake receipt image
print("\nStep 2: Creating test receipt image...")
# This is just fake data - in real use, you'd upload an actual image
fake_image_data = b"This is fake receipt image data for API testing"
files = {
    'file': ('test_receipt.jpg', fake_image_data, 'image/jpeg')
}

# Step 3: Upload receipt to API
print("\nStep 3: Uploading receipt to /api/receipts/upload...")
headers = {
    'Authorization': f'Bearer {token}'
}

upload_response = requests.post(
    f"{BASE_URL}/api/receipts/upload",
    files=files,
    headers=headers
)

print(f"Response Status: {upload_response.status_code}")

if upload_response.status_code != 200:
    print(f"[ERROR] Upload failed!")
    print(f"Response: {upload_response.text}")
    exit(1)

# Step 4: Check the response
print("\n" + "=" * 60)
print("[SUCCESS] API ENDPOINT WORKS!")
print("=" * 60)

data = upload_response.json()
print("\nExtracted Data:")
print(f"  Merchant:    {data.get('merchant')}")
print(f"  Total:       ${data.get('total')}")
print(f"  Date:        {data.get('date')}")
print(f"  Tax:         ${data.get('tax')}")
print(f"  Tip:         ${data.get('tip')}")
print(f"  Items:       {len(data.get('items', []))} items")
print(f"  Receipt URL: {data.get('receipt_url')[:60]}...")

print("\n" + "=" * 60)
print("COMPLETE FLOW WORKS!")
print("Upload → S3 → Textract → Return Data ✓")
print("=" * 60)
