# Expense Splitter

**AI-powered expense splitting for friends and family**

A mobile-first web application that eliminates the friction of splitting bills by combining receipt OCR (AWS Textract) with automated payment reminders. Built as a personal app for 15-20 close friends and family members.

---

## Current Status

**Phase 1:** ✅ Complete (AWS Textract Integration)
**Phase 2:** 🚧 In Progress (Dashboard & Friends Management)
**Phase 3:** ⏳ Planned (DynamoDB Migration)

See [PROGRESS.md](./PROGRESS.md) for detailed status and [PHASE_2_PLAN.md](./PHASE_2_PLAN.md) for next steps.

---

## Features

### ✅ Completed
- **Receipt Scanning:** Upload receipt photos → AWS Textract extracts merchant, total, items, tax, tip
- **Manual Entry:** Create expenses manually with custom participants
- **Expense Tracking:** View recent expenses with full item breakdowns
- **JWT Authentication:** Secure login system
- **Mobile-First UI:** Responsive design with dark/light theme

### 🚧 In Progress
- **Dashboard Metrics:** Real-time calculation of total expenses, amount owed, friends count
- **Friends Management:** Add/remove friends through admin UI

### ⏳ Planned
- **Data Persistence:** DynamoDB integration (currently in-memory)
- **Payment Reminders:** AWS SNS SMS notifications
- **Debt Tracking:** See who owes you and what you owe

---

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (components)

**Backend:**
- Python + FastAPI
- JWT authentication
- In-memory storage (migrating to DynamoDB)

**AWS Services:**
- **S3:** Receipt image storage (90-day auto-delete)
- **Textract:** OCR for receipt data extraction
- **SNS:** (Planned) SMS payment reminders

**Cost:** $0-$1.50/month (well under $20 budget)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- AWS Account (configured in `.env`)

### Installation

**1. Clone and install frontend:**
```bash
npm install
```

**2. Install backend dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**3. Configure environment variables:**

Create `backend/.env`:
```env
# AWS Credentials
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=expense-splitter-receipts-winston

# Backend Config
SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

### Running the Application

**Start Backend (Terminal 1):**
```bash
cd backend
uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000

**Start Frontend (Terminal 2):**
```bash
npm run dev
```
Frontend runs at: http://localhost:5173

**Test Login:**
- Email: `test@example.com`
- Password: `password123`

---

## Project Structure

```
expense-splitter/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.py      # Login/logout
│   │   │   ├── expenses.py  # Expense CRUD
│   │   │   ├── receipts.py  # Receipt upload & OCR
│   │   │   └── friends.py   # (Phase 2) Friends management
│   │   ├── services/        # Business logic
│   │   │   ├── s3.py        # S3 file upload
│   │   │   └── textract.py  # OCR processing
│   │   ├── middleware/      # Auth middleware
│   │   ├── config.py        # Environment config
│   │   └── main.py          # FastAPI app
│   └── .env                 # AWS credentials (gitignored)
│
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main app page
│   │   └── LoginPage.jsx    # Login screen
│   ├── components/
│   │   ├── ManualEntry.jsx          # Manual expense form
│   │   ├── UploadReceipt.jsx        # Receipt upload & OCR
│   │   ├── RecentExpenses.jsx       # Expense list
│   │   ├── StatusSection.jsx        # Dashboard cards
│   │   └── AddParticipantsModal.jsx # Participant selector
│   └── services/
│       └── api.ts           # Backend API client
│
├── PROGRESS.md              # Detailed development status
├── PHASE_2_PLAN.md          # Phase 2 implementation guide
├── CLAUDE.md                # Project guidelines for AI
└── README.md                # This file
```

---

## API Documentation

### Authentication
```bash
POST /api/auth/login
Body: { "email": "test@example.com", "password": "password123" }
Returns: { "token": "jwt-token", "user": {...} }
```

### Expenses
```bash
GET    /api/expenses/              # Get all expenses
POST   /api/expenses/              # Create expense
DELETE /api/expenses/{id}          # Delete expense
```

### Receipts
```bash
POST /api/receipts/upload          # Upload & process receipt
Body: multipart/form-data with file
Returns: { merchant, total, date, items, tax, tip, receipt_url }
```

### Friends (Phase 2)
```bash
GET    /api/friends/               # Get all friends
POST   /api/friends/               # Add friend
DELETE /api/friends/{id}           # Remove friend
```

Interactive API docs: http://localhost:8000/docs

---

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed coding standards and architecture principles.

**Key Principles:**
- Mobile-first responsive design
- Functional React components with hooks
- Tailwind CSS for all styling (no inline styles)
- Comments for complex business logic
- RESTful API design

---

## User Management (Personal App Model)

This is a **private app for 15-20 friends/family**, not a public SaaS product.

**How friends access the app:**
1. You (admin) manually add friends via "Manage Friends" UI
2. You manually create login credentials in backend
3. You share credentials with friends (text/in-person)
4. Friends log in with provided credentials

**No self-registration** - keeps it simple and controlled.

---

## AWS Configuration

**Region:** us-east-2 (Ohio)

**S3 Bucket:**
- Name: `expense-splitter-receipts-winston`
- Lifecycle: Auto-delete receipts after 90 days
- Cost: ~$0/month (within Free Tier)

**Textract:**
- API: AnalyzeExpense (receipt-optimized)
- Cost: $0 for first 1,000 pages/month, then $0.015/page
- Expected: $0-$1.50/month

---

## Testing

### Manual Testing Checklist
- [ ] Upload receipt → OCR extracts correct data
- [ ] Create manual expense → Appears in Recent Expenses
- [ ] Delete expense → Removed from list
- [ ] Login/logout → Token persists across page refreshes
- [ ] Mobile view → All features work on small screens

### Test Data
Use receipts from:
- Restaurants (itemized bills work best)
- Grocery stores
- Gas stations

---

## Troubleshooting

### "Failed to fetch" on login
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`

### "Access Denied" from AWS
- Verify AWS credentials in `backend/.env`
- Check IAM user has S3 and Textract permissions

### Receipt OCR returns "Unknown Merchant"
- Use clear, well-lit photos
- Ensure text is readable
- Crop to just the receipt area
- Textract works best with typed receipts

---

## Roadmap

**Phase 1** (✅ Complete)
- AWS Textract integration
- Receipt upload & OCR
- Manual expense entry
- Basic expense tracking

**Phase 2** (🚧 In Progress)
- Fix dashboard status cards (real data)
- Build friends management system
- Centralize participant data

**Phase 3** (⏳ Planned)
- Migrate to DynamoDB
- Add payment reminders (AWS SNS)
- Debt tracking & settlement
- Deploy to production (Render + Vercel)

---

## Contributing

This is a personal learning project, but feedback is welcome!

**Contact:** Winston (test@example.com)

---

## License

Private personal project - Not for commercial use

---

## Acknowledgments

Built as a learning project to understand:
- Fullstack development (React + FastAPI)
- AWS services (S3, Textract, DynamoDB, SNS)
- Mobile-first design principles
- Real-world API integration

**Powered by:** AWS Textract OCR, React, FastAPI, Tailwind CSS
