
from typing import Dict, List, Optional
from app.config import settings
import boto3

class TextractService:

    def __init__(self):
        print("Initializing TextractService with AWS Textract")
        self.textract_client = boto3.client(
            'textract',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )


    
    def analyze_receipt(self, s3_bucket: str, s3_key: str) -> Dict:
        
        """
        Analyzes a receipt image stored in an S3 bucket using Amazon Textract and returns the extracted information.
        """
        print(f"Calling AWS Textract for: s3://{s3_bucket}/{s3_key}")

        try:
            response = self.textract_client.analyze_expense(
                Document = {
                    'S3Object': {
                        'Bucket': s3_bucket,
                        'Name': s3_key
                    }
                }
            )

            print("[SUCCESS] Textract response received!")

            # Parse the response
            parsed_data = self._parse_expense_response(response)
            return parsed_data
        
        except Exception as e:
            print(f"Error analyzing receipt: {e}")

            # Return default values in case of an error
            return {
                'merchant': 'Unknown',
                'total': 0.0,
                'date': None,
                'items': [],
                'tax': 0.0,
                'tip': 0.0,
                'subtotal': 0.0,
                'confidence': 'error',
                'error': str(e)
            }

    def _parse_expense_response(self, response: Dict) -> Dict:

        """
        Parse Textract AnalyzeExpense response
        Textract returns complex nested JSON - we extract what we need
        """
        print("Parsing Textract response...")

        expense_documents = response.get('ExpenseDocuments', [])

        if not expense_documents:
            print("[WARNING] No expense documents found in response")
            return self._empty_receipt()
        

        # Get the first document's summary fields and line items
        summary_fields = expense_documents[0].get('SummaryFields', [])
        line_items = expense_documents[0].get('LineItemGroups', [])

        # Extract all key fields
        merchant = self._extract_field(summary_fields, ['VENDOR_NAME', 'MERCHANT_NAME'])
        total = self._extract_amount(summary_fields, ['TOTAL', 'AMOUNT_PAID'])
        date = self._extract_field(summary_fields, ['INVOICE_RECEIPT_DATE', 'DATE'])
        tax = self._extract_amount(summary_fields, ['TAX'])
        tip = self._extract_amount(summary_fields, ['TIP'])
        subtotal = self._extract_amount(summary_fields, ['SUBTOTAL'])

        # Extract line items
        items = self._extract_line_items(line_items)

        # Calculate subtotal if not provided
        if not subtotal and total:
            subtotal = total - (tax or 0) - (tip or 0)

        print(f"[EXTRACTED] merchant={merchant}, total={total}, items={len(items)}, tax={tax}, tip={tip}")

        return {
            'merchant': merchant or 'Unknown Merchant',
            'total': float(total or 0),
            'date': date,
            'items': items,
            'tax': float(tax or 0),
            'tip': float(tip or 0),
            'subtotal': float(subtotal or 0),
            'confidence': 'high'
        }
    
    def _extract_field(self, fields: List[Dict], field_types: List[str]) -> Optional[str]:
        """
        Extracts a field value from the Textract response based on the provided keys.
        """
        for field in fields:
            field_type = field.get('Type', {}).get('Text', '')
            if field_type in field_types:
                value = field.get('ValueDetection', {}).get('Text')
                if value:
                    return value.strip()
        
        return None
    
    def _extract_amount(self, fields: List, field_types: List[str]) -> Optional[float]:
        """Extract currency amount from Textract response"""
        value = self._extract_field(fields, field_types)

        if value:
            # Clean currency string: "$45.99" -> 45.99
            import re
            cleaned = re.sub(r'[^\d.]', '', value)
            try:
                return float(cleaned)
            except ValueError:
                return None
        return None

    def _extract_line_items(self, line_item_groups: List) -> List[Dict]:
        """
        Extract individual items from receipt
        Returns: [{'name': 'Burger', 'price': 15.99}, ...]
        """
        items = []

        for group in line_item_groups:
            for line_item in group.get('LineItems', []):
                item_name = None
                item_price = None

                for field in line_item.get('LineItemExpenseFields', []):
                    field_type = field.get('Type', {}).get('Text', '')
                    value = field.get('ValueDetection', {}).get('Text', '')

                    if field_type in ['ITEM', 'PRODUCT_CODE', 'DESCRIPTION']:
                        item_name = value.strip()
                    elif field_type in ['PRICE', 'EXPENSE_ROW']:
                        # Extract price
                        import re
                        cleaned = re.sub(r'[^\d.]', '', value)
                        try:
                            item_price = float(cleaned)
                        except ValueError:
                            pass

                if item_name and item_price:
                    items.append({
                        'name': item_name,
                        'price': item_price
                    })

        return items
    

    def _empty_receipt(self) -> Dict:
        """Return a default receipt with no information"""
        return {
            'merchant': 'Unknown',
            'total': 0.0,
            'date': None,
            'items': [],
            'tax': 0.0,
            'tip': 0.0,
            'subtotal': 0.0,
            'confidence': 'low',
        }


textract_service = TextractService()