from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Participant(BaseModel):
    """Participant in an expense"""
    email: str
    name: str
    amount: float

class ReceiptItem(BaseModel):
    """Item from a receipt"""
    name: str
    price: float

class ExpenseCreate(BaseModel):
    """Request to create a new expense"""
    description: str
    total_amount: float
    participants: List[Participant]
    receipt_url: str | None = None
    # Receipt details (optional)
    items: Optional[List[ReceiptItem]] = None
    tax: Optional[float] = None
    tip: Optional[float] = None
    subtotal: Optional[float] = None

class Expense(ExpenseCreate):
    """Expense model"""
    id: str
    user_id: str  # Creator's email
    created_by_name: str  # Creator's name for display
    created_at: str
    status: str = "pending"  # pending, settled
