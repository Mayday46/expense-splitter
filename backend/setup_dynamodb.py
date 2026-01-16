"""
DynamoDB Table Setup Script
===========================
This script creates the DynamoDB tables needed for the Expense Splitter app.

Run once to initialize your database:
    python setup_dynamodb.py

What this does:
1. Connects to AWS using credentials from .env
2. Creates an 'expenses' table with proper structure
3. Sets up an index for querying expenses by user

Learning Goals:
- Understand DynamoDB table structure
- Learn about primary keys and indexes
- See how billing modes work
"""

import boto3
from botocore.exceptions import ClientError
from app.config import settings

def create_expenses_table():
    """
    Create the expenses table in DynamoDB

    Table Structure:
    ----------------
    Primary Key: id (unique expense ID)
    Index: user_id-index (to find all expenses for a user)

    Why do we need an index?
    - Without it: Must scan ALL expenses to find user's expenses (slow!)
    - With it: Directly query expenses for a specific user (fast!)
    """

    # Connect to DynamoDB in AWS
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )

    table_name = settings.DYNAMODB_TABLE_EXPENSES

    try:
        # Step 1: Check if table already exists
        # (Don't want to create it twice!)
        existing_tables = [table.name for table in dynamodb.tables.all()]
        if table_name in existing_tables:
            print(f"✅ Table '{table_name}' already exists!")
            return dynamodb.Table(table_name)

        # Step 2: Create the table
        print(f"📝 Creating table '{table_name}'...")

        table = dynamodb.create_table(
            TableName=table_name,

            # PRIMARY KEY DEFINITION
            # This is how DynamoDB finds items
            KeySchema=[
                {
                    'AttributeName': 'id',  # Field name
                    'KeyType': 'HASH'       # HASH = partition key (main identifier)
                }
            ],

            # ATTRIBUTE DEFINITIONS
            # Only need to define attributes used in keys/indexes
            # Other fields (description, amount, etc.) are flexible
            AttributeDefinitions=[
                {
                    'AttributeName': 'id',
                    'AttributeType': 'S'  # S = String type
                },
                {
                    'AttributeName': 'user_id',
                    'AttributeType': 'S'  # S = String type
                }
            ],

            # INDEXES (for efficient querying)
            # This lets us query: "Get all expenses where user_id = X"
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'user_id-index',
                    'KeySchema': [
                        {
                            'AttributeName': 'user_id',
                            'KeyType': 'HASH'  # Query by user_id
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'  # Include all item attributes in query results
                    }
                    # NOTE: No ProvisionedThroughput needed with PAY_PER_REQUEST billing
                }
            ],

            # BILLING MODE
            # PAY_PER_REQUEST = only pay for requests you make (no minimum cost)
            # Perfect for low-volume apps like yours
            BillingMode='PAY_PER_REQUEST',
        )

        # Step 3: Wait for table to be ready
        # Table creation is async - need to wait before using it
        print("⏳ Waiting for table to be created...")
        table.meta.client.get_waiter('table_exists').wait(TableName=table_name)

        print(f"✅ Table '{table_name}' created successfully!")
        return table

    except ClientError as e:
        print(f"❌ Error: {e}")
        raise

def verify_table(table_name):
    """Show table details to confirm it was created correctly"""

    dynamodb = boto3.resource(
        'dynamodb',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )

    table = dynamodb.Table(table_name)

    print(f"\n📊 Table Information:")
    print(f"   Name: {table.table_name}")
    print(f"   Status: {table.table_status}")
    print(f"   Item Count: {table.item_count}")

    if table.global_secondary_indexes:
        print(f"   Indexes:")
        for index in table.global_secondary_indexes:
            print(f"   - {index['IndexName']} (on {index['KeySchema'][0]['AttributeName']})")

def main():
    """Main setup function"""

    print("=" * 60)
    print("🚀 DynamoDB Setup")
    print("=" * 60)
    print(f"AWS Region: {settings.AWS_REGION}")
    print(f"Table Name: {settings.DYNAMODB_TABLE_EXPENSES}")
    print()

    try:
        # Create the table
        table = create_expenses_table()

        # Show what was created
        verify_table(settings.DYNAMODB_TABLE_EXPENSES)

        print("\n" + "=" * 60)
        print("✅ Setup Complete!")
        print("=" * 60)
        print("\n📝 Next Steps:")
        print("1. Verify in AWS Console: https://console.aws.amazon.com/dynamodb")
        print("2. Create DynamoDB service layer (we'll code this together!)")
        print("3. Update routes to use DynamoDB")
        print()

    except Exception as e:
        print(f"\n❌ Setup Failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check AWS credentials in backend/.env")
        print("2. Verify AWS_REGION is correct (should be us-east-2)")
        print("3. Test AWS connection with: aws dynamodb list-tables")
        print()

if __name__ == "__main__":
    main()
