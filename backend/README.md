# Expense Splitter Backend

Backend API for the Expense Splitter application, built with Python and FastAPI.

## Tech Stack

- **Framework:** FastAPI
- **Language:** Python 3.10+
- **Database:** Amazon DynamoDB
- **AWS Services:** S3, Textract, SNS
- **Authentication:** JWT (JSON Web Tokens)

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and add:
- Your AWS credentials
- A secure JWT secret
- Your user list (friends/family)

### 3. Generate Password Hash for Users

To add a user, generate a password hash:

```python
python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('your-password'))"
```

Add the hash to the USERS JSON in `.env`:

```json
{
  "email": "friend@example.com",
  "password_hash": "$2b$12$...",
  "name": "Friend Name",
  "phone": "+12345678901"
}
```

## Running the Server

### Development Mode

```bash
# From the backend directory
uvicorn app.main:app --reload --port 8000

# Or
python -m app.main
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (requires auth)

### Expenses (Coming soon)

- `POST /api/expenses` - Create new expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get specific expense

### Receipts (Coming soon)

- `POST /api/receipts/upload` - Upload receipt to S3
- `POST /api/receipts/process` - Process receipt with Textract

### Notifications (Coming soon)

- `POST /api/notifications/send` - Send SMS notification

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration and settings
│   ├── routes/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── expenses.py      # Expense CRUD (TODO)
│   │   ├── receipts.py      # Receipt upload/processing (TODO)
│   │   └── notifications.py # SMS notifications (TODO)
│   ├── services/
│   │   ├── dynamodb.py      # DynamoDB operations (TODO)
│   │   ├── s3.py            # S3 upload service (TODO)
│   │   ├── textract.py      # Textract OCR (TODO)
│   │   └── sns.py           # SNS notifications (TODO)
│   ├── models/
│   │   ├── user.py          # User models
│   │   └── expense.py       # Expense models
│   └── middleware/
│       └── auth.py          # JWT verification
├── tests/                   # Unit tests (TODO)
├── requirements.txt         # Python dependencies
├── .env.example            # Example environment variables
└── README.md               # This file
```

## Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

## Deployment

See deployment guide for deploying to:
- Render.com (free tier)
- Railway ($5/month)
- AWS App Runner

## Next Steps

1. ✅ Basic FastAPI setup
2. ✅ Authentication with JWT
3. 🔄 DynamoDB integration
4. 🔄 S3 receipt upload
5. 🔄 Textract receipt processing
6. 🔄 SNS SMS notifications
7. 🔄 Expense CRUD endpoints
