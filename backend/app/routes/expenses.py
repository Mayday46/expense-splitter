
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from decimal import Decimal
import uuid
from pydantic import BaseModel
from app.models.expense import Expense, ExpenseCreate
from app.middleware.auth import get_current_user
from app.services import dynamodb_service

# Create a router (group of realted endpoints)
router = APIRouter()

# Using DynamoDB for persistent storage!
# Data now persists across server restarts

# Request model for status update
class StatusUpdate(BaseModel):
    status: str

# Helper function to convert all floats to Decimal (DynamoDB requirement)
def convert_floats_to_decimal(obj):
    """Recursively convert all float values to Decimal in nested structures"""
    if isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    else:
        return obj

# CREATE EXPENSE ENDPOINT

@router.post("/", response_model = Expense)
def create_expense(expense: ExpenseCreate, user = Depends(get_current_user)):
    """Create a new expense"""
    # Generate a unique ID
    expense_id = str(uuid.uuid4())


    # Get current timestamp
    created_at = datetime.utcnow().isoformat()

    # Build expense data
    expense_data = {
        "id": expense_id,
        "user_id": user["email"],
        "created_by_name": user["name"],
        "description": expense.description,
        "total_amount": expense.total_amount,
        "participants": [participant.dict() for participant in expense.participants],
        "receipt_url": expense.receipt_url,
        "created_at": created_at,
        "status": "pending",
        "items": [item.dict() for item in expense.items] if expense.items else None,
        "tax": expense.tax,
        "tip": expense.tip,
        "subtotal": expense.subtotal
    }

    # Convert ALL floats to Decimal (DynamoDB requirement)
    expense_data = convert_floats_to_decimal(expense_data)

    # Save to DynamoDB
    dynamodb_service.create_expense(expense_data)

    # DEBUG: Log what was saved
    print(f"\n🔹 EXPENSE CREATED by {user['email']}")
    print(f"🔹 Participants: {[p['email'] for p in expense_data['participants']]}")
    print(f"🔹 Saved to DynamoDB\n")

    return expense_data


# GET ALL EXPENSES ENDPOINT
@router.get("/", response_model = List[Expense])
def get_expenses(user = Depends(get_current_user)):

    """Get all expenses for the current user"""

    # Get expenses created by this user from DynamoDB
    current_user_email = user["email"]

    print(f"\n[DEBUG] Getting expenses for: {current_user_email}")

    # Get expenses where user is the creator
    created_expenses = dynamodb_service.get_user_expenses(current_user_email)

    # Also need to get expenses where user is a participant
    # For now, get all expenses and filter (we'll optimize this later with another index)
    all_expenses = dynamodb_service.get_all_expenses()

    user_expenses = []

    # Add expenses created by user
    user_expenses.extend(created_expenses)

    # Add expenses where user is a participant (but not creator)
    for expense in all_expenses:
        # Skip if already added (user is creator)
        if expense["user_id"] == current_user_email:
            continue

        # Check if user is a participant
        is_participant = any(
            participant["email"] == current_user_email
            for participant in expense["participants"]
        )
        if is_participant:
            print(f"[DEBUG]   ✅ User is PARTICIPANT - including expense")
            user_expenses.append(expense)

    print(f"[DEBUG] Found {len(user_expenses)} expenses")

    return user_expenses


# GET ONE EXPENSE ENDPOINT
@router.get("/{expense_id}", response_model = Expense)

def get_expense(expense_id: str, user = Depends(get_current_user)):

    """Get a single expense by ID"""

    # Get expense from DynamoDB
    expense = dynamodb_service.get_expense_by_id(expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense["user_id"] != user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this expense")

    return expense


# UPDATE EXPENSE STATUS ENDPOINT
@router.patch("/{expense_id}/status")
def update_expense_status(expense_id: str, status_update: StatusUpdate, user = Depends(get_current_user)):
    """
    Update expense status (e.g., 'pending' -> 'settled')

    Only the creator can mark as settled
    Participants can mark their own payment status (future feature)
    """
    # Get the expense to verify ownership
    expense = dynamodb_service.get_expense_by_id(expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Validate status value
    valid_statuses = ["pending", "pending_review", "settled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    # Authorization checks:
    # - Only creator can mark as settled
    # - Only participants can mark as pending_review
    # - Anyone can change back to pending
    if status_update.status == "settled" and expense["user_id"] != user["email"]:
        raise HTTPException(status_code=403, detail="Only the creator can mark expense as settled")

    if status_update.status == "pending_review":
        # Check if user is a participant (not creator)
        is_participant = any(
            participant["email"] == user["email"]
            for participant in expense["participants"]
        )
        is_creator = expense["user_id"] == user["email"]
        if not is_participant or is_creator:
            raise HTTPException(status_code=403, detail="Only participants can mark expense as pending review")

    # Update status in DynamoDB
    updated_expense = dynamodb_service.update_expense_status(expense_id, status_update.status)

    print(f"\n✅ Expense {expense_id[:8]}... status updated to: {status_update.status}")

    return updated_expense


# DELETE EXPENSE ENDPOINT
@router.delete("/{expense_id}")
def delete_expense(expense_id: str, user = Depends(get_current_user)):
    """Delete an expense by ID - anyone involved can delete"""

    # First, get the expense to check if it exists
    expense = dynamodb_service.get_expense_by_id(expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Check if user is either the creator OR a participant
    is_creator = expense["user_id"] == user["email"]
    is_participant = any(
        participant["email"] == user["email"]
        for participant in expense["participants"]
    )

    if not is_creator and not is_participant:
        raise HTTPException(status_code=403, detail="Not authorized to delete this expense")

    # Delete from DynamoDB
    dynamodb_service.delete_expense(expense_id)

    return {"message": "Expense deleted"}



