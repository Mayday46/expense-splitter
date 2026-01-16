"""
DynamoDB Service Layer
======================
This file handles ALL database operations for expenses.

Why a service layer?
- Keeps database logic separate from HTTP routes
- Easy to test and modify
- Reusable across different parts of the app

Your Task:
- Fill in the ??? placeholders
- Read the comments to understand what each part does
- Test each function as you complete it
"""

import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from app.config import settings

# =============================================================================
# HELPER FUNCTION: Get DynamoDB Table
# =============================================================================

def get_table():
    """
    Connect to DynamoDB and return the expenses table

    This is used by all other functions, so we made it reusable!

    Returns:
        boto3 Table object
    """
    # Step 1: Create a connection to DynamoDB service
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=settings.AWS_REGION,  # TODO: Get from settings (what AWS region?)
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,  # TODO: Get AWS credentials from settings
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY  # TODO: Get AWS secret key from settings
    )

    # Step 2: Get the specific table we want to use
    table = dynamodb.Table(settings.DYNAMODB_TABLE_EXPENSES)  # TODO: What's the table name? (from settings)

    return table


# =============================================================================
# CREATE OPERATION
# =============================================================================

def create_expense(expense_data):
    """
    Save a new expense to DynamoDB

    Args:
        expense_data (dict): The expense to save
            Example: {
                'id': 'abc-123',
                'user_id': 'winston@gmail.com',
                'description': 'Dinner',
                'total_amount': 85.50,
                'participants': [...],
                'created_at': '2025-12-28T10:00:00Z'
            }

    Returns:
        dict: The saved expense (same as input)
    """
    # Step 1: Get the table
    table = get_table()

    # Step 2: Save the item to DynamoDB
    # put_item() adds a new item to the table
    table.put_item(Item= expense_data)  # TODO: What do we save? (hint: it's the parameter)

    # Step 3: Return the expense we just saved
    return expense_data  # TODO: What should we return?


# =============================================================================
# READ OPERATIONS
# =============================================================================

def get_user_expenses(user_id):
    """
    Get ALL expenses created by a specific user

    This uses the user_id-index we created in setup!

    Args:
        user_id (str): User's email address

    Returns:
        list: List of expense dictionaries

    Example:
        expenses = get_user_expenses('winston@gmail.com')
        # Returns: [
        #     {'id': '123', 'description': 'Dinner', ...},
        #     {'id': '456', 'description': 'Lunch', ...}
        # ]
    """
    # Step 1: Get the table
    table = get_table()

    # Step 2: Query the index
    # We're searching: "Find all expenses where user_id = X"
    response = table.query(
        IndexName='user_id-index',  # TODO: What's the index name? (hint: we created 'user_id-index')
        KeyConditionExpression=Key('user_id').eq(user_id)  # TODO: Equal to what? (hint: function parameter)
    )

    # Step 3: Extract items from response
    # DynamoDB returns: {'Items': [...], 'Count': 5, 'ScannedCount': 5}
    # We only want the Items list
    return response['Items']  # TODO: Which key has the list of items?


def get_expense_by_id(expense_id):
    """
    Get ONE specific expense by its ID

    Args:
        expense_id (str): The expense ID to look up

    Returns:
        dict or None: The expense if found, None if not found
    """
    # Step 1: Get the table
    table = get_table()

    # Step 2: Get item by primary key
    # get_item() fetches ONE item using the primary key
    response = table.get_item(
        Key={'id': expense_id}  # TODO: What's the expense_id we're looking for?
    )

    # Step 3: Return the item (or None if not found)
    # DynamoDB returns: {'Item': {...}} if found
    # or just {} if not found
    return response.get('Item')  # .get() returns None if key doesn't exist


def get_all_expenses():
    """
    Get ALL expenses in the database (for testing/debugging)

    WARNING: In production, this could return millions of items!
    Only use for small datasets or testing.

    Returns:
        list: All expenses
    """
    # Step 1: Get the table
    table = get_table()

    # Step 2: Scan the entire table
    # scan() reads EVERYTHING (expensive operation!)
    response = table.scan()

    # Step 3: Return all items
    return response['Items']


# =============================================================================
# DELETE OPERATION
# =============================================================================

def delete_expense(expense_id):
    """
    Delete an expense from DynamoDB

    Args:
        expense_id (str): ID of expense to delete

    Returns:
        bool: True if deleted successfully
    """
    # Step 1: Get the table
    table = get_table()

    # Step 2: Delete the item
    table.delete_item(
        Key={'id': expense_id}  # TODO: What's the key to delete?
    )

    # Step 3: Return success
    return True


# =============================================================================
# UPDATE OPERATION (Advanced - Optional)
# =============================================================================

def update_expense_status(expense_id, new_status):
    """
    Update the status of an expense (e.g., 'pending' -> 'paid')

    This is an ADVANCED operation - come back to this later!

    Args:
        expense_id (str): ID of expense to update
        new_status (str): New status value

    Returns:
        dict: Updated expense
    """
    table = get_table()

    # UpdateExpression is like SQL UPDATE SET
    response = table.update_item(
        Key={'id': expense_id},
        UpdateExpression='SET #status = :new_status',
        ExpressionAttributeNames={
            '#status': 'status'  # 'status' is a reserved word, so we use a placeholder
        },
        ExpressionAttributeValues={
            ':new_status': new_status
        },
        ReturnValues='ALL_NEW'  # Return the updated item
    )

    return response['Attributes']


# =============================================================================
# TESTING HELPER (for you to verify things work)
# =============================================================================

if __name__ == "__main__":
    """
    Test your functions here!

    Run this file directly to test:
        python -m app.services.dynamodb_service
    """
    print("🧪 Testing DynamoDB Service...")

    # Test 1: Get all expenses (should be empty at first)
    print("\n1. Get all expenses:")
    all_expenses = get_all_expenses()
    print(f"   Found {len(all_expenses)} expenses")

    # Test 2: Create a test expense
    print("\n2. Creating test expense...")
    test_expense = {
        'id': 'test-123',
        'user_id': 'winston@gmail.com',
        'description': 'Test Expense',
        'total_amount': Decimal('50.00'),  # DynamoDB requires Decimal, not float!
        'created_at': '2025-12-28T10:00:00Z'
    }
    create_expense(test_expense)
    print("   ✅ Created!")

    # Test 3: Get user's expenses
    print("\n3. Get winston's expenses:")
    winston_expenses = get_user_expenses('winston@gmail.com')
    print(f"   Found {len(winston_expenses)} expenses")

    # Test 4: Get by ID
    print("\n4. Get expense by ID:")
    expense = get_expense_by_id('test-123')
    print(f"   Found: {expense['description'] if expense else 'Not found'}")

    # Test 5: Delete
    print("\n5. Delete test expense:")
    delete_expense('test-123')
    print("   ✅ Deleted!")

    print("\n✅ All tests complete!")
