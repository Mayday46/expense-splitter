# FRIENDS LIST API (Read-Only)
# Returns the shared network of friends for participant selection
# To add/remove friends: Just edit the FRIENDS_LIST below!

from fastapi import APIRouter, Depends
from typing import List, Dict
from app.middleware.auth import get_current_user
from datetime import datetime

router = APIRouter()

# ========================================
# YOUR FRIENDS LIST - EDIT THIS TO ADD/REMOVE FRIENDS
# ========================================
# This is the single source of truth for your friends network
# Everyone who logs in will see these people in the participant list

FRIENDS_LIST = [
    {
        "name": "Long He",
        "email": "longhe58@gmail.com",
        "phone": "(917) 322-9555"
    },
    {
        "name": "Andy (Xinji) Shi",
        "email": "andyshi@gmail.com",
        "phone": "(917) 698-8028"
    },
    {
        "name": "Winston Lin",
        "email": "winstonnlinn@gmail.com",
        "phone": "(917) 399-2626"
    },
    {
        "name": "Jiawen Lin",
        "email": "j.lin5408@gmail.com",
        "phone": "(917) 349-8699"
    },
    {
        "name": "Qiubin Huang",
        "email": "qiubinhuang@gmail.com",
        "phone": "(646) 464-3322"
    },
    {
        "name": "Elva Lin",
        "email": "elvalin@gmail.com",
        "phone": "(646) 639-1322"
    },
    # Add more friends here:
    # {
    #     "name": "Bob Williams",
    #     "email": "bob@email.com",
    #     "phone": "(555) 444-4444"
    # },
]


@router.get("/")
async def get_all_friends(user: Dict = Depends(get_current_user)) -> List[Dict]:
    """
    Get all friends in the shared network

    Returns: List of friends with name, email, phone, initials

    To add/remove friends: Edit the FRIENDS_LIST above in this file!
    """

    # Transform friends list to include auto-generated fields
    friends_with_metadata = []

    # Get current user's email to filter them out
    current_user_email = user['email'].lower()

    for friend in FRIENDS_LIST:
        friend_email = friend['email'].lower()

        # Skip current user - you shouldn't see yourself in the friends list!
        if friend_email == current_user_email:
            continue

        # Generate initials from name
        # Remove parentheses and their contents, then split
        import re
        clean_name = re.sub(r'\([^)]*\)', '', friend['name']).strip()
        name_parts = clean_name.split()

        if len(name_parts) >= 2:
            # Use first and last name parts
            initials = name_parts[0][0].upper() + name_parts[-1][0].upper()
        elif len(name_parts) == 1:
            initials = name_parts[0][:2].upper()
        else:
            initials = friend['name'][:2].upper()

        # Generate a consistent ID from email (for frontend keys)
        import hashlib
        friend_id = hashlib.md5(friend['email'].encode()).hexdigest()[:8]

        friends_with_metadata.append({
            'id': friend_id,
            'name': friend['name'],
            'email': friend_email,
            'phone': friend.get('phone', ''),
            'initials': initials,
            'created_at': datetime.utcnow().isoformat()
        })

    return friends_with_metadata


# ========================================
# HOW TO MANAGE FRIENDS:
# ========================================
#
# TO ADD A FRIEND:
# 1. Add a new entry to FRIENDS_LIST above:
#    {
#        "name": "New Friend",
#        "email": "newfriend@email.com",
#        "phone": "(555) 555-5555"  # Optional
#    },
# 2. Save this file
# 3. Backend auto-reloads (if running with --reload)
# 4. Friend appears in participant list immediately!
#
# TO REMOVE A FRIEND:
# 1. Delete or comment out their entry in FRIENDS_LIST
# 2. Save this file
# 3. Backend auto-reloads
# 4. Friend removed from participant list
#
# TO GIVE FRIEND LOGIN ACCESS:
# 1. Add them to FRIENDS_LIST (above)
# 2. Add their credentials to backend/app/routes/auth.py in USERS_DB
# 3. Share credentials with them (text/in-person)
#
# Later (Phase 3): This will move to DynamoDB, but you'll still
# manage it via database directly, not a UI.
#

