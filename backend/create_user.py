"""
Helper script to create user credentials for your expense splitter app
Run this to generate password hashes for your friends!

Usage:
    python create_user.py
"""

from passlib.context import CryptContext
import json

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("=" * 60)
print("EXPENSE SPLITTER - CREATE USER CREDENTIALS")
print("=" * 60)
print("\nThis script helps you add login credentials for your friends.")
print("You'll need to copy the output to backend/.env file.\n")

# Get user input
name = input("Friend's full name (e.g., Long He): ").strip()
email = input("Friend's email (e.g., longhe58@gmail.com): ").strip()
phone = input("Friend's phone number (optional, e.g., (917) 322-9555): ").strip()
password = input("Create a password for them (e.g., longhe123): ").strip()

# Generate password hash
password_hash = pwd_context.hash(password)

# Create user object
user = {
    "email": email,
    "password_hash": password_hash,
    "name": name,
}

if phone:
    user["phone"] = phone

# Output
print("\n" + "=" * 60)
print("USER CREATED SUCCESSFULLY!")
print("=" * 60)
print("\nCopy this user object:")
print("-" * 60)
print(json.dumps(user, indent=2))
print("-" * 60)

print("\n📋 HOW TO ADD TO .env FILE:")
print("1. Open backend/.env")
print("2. Find the USERS line (line 23)")
print("3. Add this user to the JSON array")
print("\nExample:")
print('USERS=\'[')
print('  {"email":"test@example.com","password_hash":"...","name":"Test User"},')
print(f'  {json.dumps(user)}')
print("]'")

print("\n" + "=" * 60)
print(f"✅ {name} can now login with:")
print(f"   Email: {email}")
print(f"   Password: {password}")
print("=" * 60)
print("\n⚠️  SHARE PASSWORD SECURELY (text/in-person, not email!)")
