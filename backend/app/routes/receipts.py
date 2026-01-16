# EXTRACTS DATA FROM IMAGES AND PDFS USING AWS TEXTRACT AND RETURNS THE DATA IN JSON FORMAT

from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from app.middleware.auth import get_current_user
from app.services.s3 import s3_service
from app.services.textract import textract_service
from app.config import settings
from typing import Dict

# API Router: Creates a router (the switchboard)
# File: Tells FastAPI "this parameter is a file"
# UploadFile: The file object itself
# Depends: Used for authentication (checking who's logged in)
# HTTPException: For sending error messages (404, 401, etc.)

router = APIRouter()
@router.post("/upload")

async def upload_and_process_receipt(file: UploadFile = File(...), user: Dict = Depends(get_current_user)) -> Dict:

    """ Upload receipt image, process with Textract, return extracted data
        Flow:
            1. Validate file
            2. Upload to S3
            3. Process with Textract
            4. Return extracted data
    """

    # Step 1: Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code = 400,
            detail = f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Step 2: Validate file size (max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code = 400,
            detail = "File size exceeds 5MB limit."
        )
    
    # Step 3: Upload file to S3
    print(f"Uploading receipt for user: {user['email']}")

    s3_url = s3_service.upload_file(
        file_bytes = file_bytes,
        file_name = file.filename,
        user_id = user['email']
    )

    # Step 4: Extract data with Textract
    print(f"Processing receipt with Textract: {s3_url}")
    s3_key = s3_url.split('.amazonaws.com/')[-1]  # Extract key from URL

    extracted_data = textract_service.analyze_receipt(
        s3_bucket = settings.S3_BUCKET_NAME,
        s3_key = s3_key
    )

    # Step 5: Add receipt URL to response
    extracted_data['receipt_url'] = s3_url

    # Step 6: Return extracted data
    print(f"[SUCCESS] Receipt processed: {extracted_data['merchant']}")
    return extracted_data