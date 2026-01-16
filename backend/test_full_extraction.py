"""
Test full receipt extraction - see all fields
"""

from app.services.textract import textract_service
import json

print("=" * 60)
print("TESTING FULL RECEIPT EXTRACTION")
print("=" * 60)

# Analyze your receipt
result = textract_service.analyze_receipt(
    'expense-splitter-receipts-winston',
    'receipt1.jpg'
)

print("\n" + "=" * 60)
print("EXTRACTED DATA:")
print("=" * 60)
print(json.dumps(result, indent=2))

print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
print(f"Merchant:  {result['merchant']}")
print(f"Date:      {result['date']}")
print(f"Total:     ${result['total']:.2f}")
print(f"Tax:       ${result['tax']:.2f}")
print(f"Tip:       ${result['tip']:.2f}")
print(f"Subtotal:  ${result['subtotal']:.2f}")
print(f"Items:     {len(result['items'])} items found")

if result['items']:
    print("\nITEMS:")
    for i, item in enumerate(result['items'], 1):
        print(f"  {i}. {item['name']:30s} ${item['price']:.2f}")

print("=" * 60)
