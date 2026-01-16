"""
Standalone test to verify login works
Run this while backend is running
"""
import requests
import json

# Test the login endpoint
url = "http://localhost:8000/api/auth/login"
payload = {
    "email": "winstonnlinn@gmail.com",
    "password": "winston123"
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print()

response = requests.post(url, json=payload)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
print()

if response.status_code == 200:
    print("✅ LOGIN SUCCESSFUL!")
    data = response.json()
    print(f"Token received: {data.get('token', '')[:50]}...")
else:
    print("❌ LOGIN FAILED!")
    print("This means the backend is NOT loading the correct .env file")
