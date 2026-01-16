import boto3
from app.config import settings

print("Testing AnalyzeExpense API...")
print(f"Current region: {settings.AWS_REGION}")

# Try us-east-1 region instead
client = boto3.client(
    'textract',
    region_name='us-east-1',  # Force us-east-1 instead of us-east-2
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

try:
    # Try AnalyzeExpense
    response = client.analyze_expense(
        Document={
            'S3Object': {
                'Bucket': 'expense-splitter-receipts-winston',
                'Name': 'receipt1.jpg'
            }
        }
    )

    print("[SUCCESS] AnalyzeExpense works in us-east-1!")

    # Show what it extracted
    if response.get('ExpenseDocuments'):
        summary = response['ExpenseDocuments'][0].get('SummaryFields', [])
        print(f"Extracted {len(summary)} fields from receipt")

        # Try to find merchant and total
        for field in summary[:5]:  # Show first 5 fields
            field_type = field.get('Type', {}).get('Text', 'Unknown')
            value = field.get('ValueDetection', {}).get('Text', 'N/A')
            print(f"  - {field_type}: {value}")

except Exception as e:
    print(f"[ERROR] {e}")
    print("\nTrying us-east-2 again...")

    # Try original region
    client2 = boto3.client(
        'textract',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )

    try:
        response2 = client2.analyze_expense(
            Document={
                'S3Object': {
                    'Bucket': 'expense-splitter-receipts-winston',
                    'Name': 'receipt1.jpg'
                }
            }
        )
        print(f"[SUCCESS] AnalyzeExpense works in {settings.AWS_REGION}!")
    except Exception as e2:
        print(f"[ERROR in {settings.AWS_REGION}] {e2}")
