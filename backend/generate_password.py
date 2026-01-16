#!/usr/bin/env python3
"""
Helper script to generate password hashes for users

Usage:
    python generate_password.py
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_hash(password: str) -> str:
    """Generate bcrypt hash for a password"""
    return pwd_context.hash(password)

if __name__ == "__main__":
    print("Password Hash Generator")
    print("=" * 50)
    password = input("Enter password to hash: ")
    hash_result = generate_hash(password)
    print(f"\nPassword hash:\n{hash_result}")
    print("\nAdd this to your .env USERS JSON:")
    print(f'"password_hash": "{hash_result}"')
