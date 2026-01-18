# Phase 3: Notifications, Production & Advanced Features

**Start Date:** TBD
**Estimated Duration:** 15-20 hours
**Status:** 📝 Planning

---

## Overview

Phase 3 transforms Expense Splitter from a local development app into a production-ready service with automated notifications and advanced features.

**Key Objectives:**
1. Implement AWS SNS for SMS payment reminders
2. Deploy to production (accessible to friends)
3. Add friends management UI
4. Enhance expense status workflow
5. Add analytics and insights

---

## Task 1: AWS SNS SMS Notifications

### Goal
Enable automated SMS payment reminders when users click "Send Reminder" button.

### Implementation

#### Step 1.1: Set Up AWS SNS
- Create SNS topic in AWS Console
- Configure IAM permissions for SNS
- Add SNS credentials to `.env`
- Test SMS sending with boto3

#### Step 1.2: Create SNS Service
**File:** `backend/app/services/sns.py` (NEW FILE)

Features:
- Send individual SMS to participant
- SMS templates for different reminder types
- Error handling for failed sends
- Cost tracking (log sends for billing)

#### Step 1.3: Add Reminder Endpoint
**File:** `backend/app/routes/expenses.py`

New endpoint: `POST /api/expenses/{id}/send-reminder`
- Get expense by ID
- Verify user is creator (authorization)
- For each participant who hasn't paid:
  - Send SMS via SNS service
  - Log reminder sent
- Return success count

#### Step 1.4: Connect Frontend Button
**File:** `src/components/ExpenseCard.jsx`

Update "Send Reminder" button:
- Call reminder API endpoint
- Show loading state during send
- Display success/error message
- Disable button after sending (cooldown)

### Success Criteria
- ✅ SMS successfully sent to participant's phone
- ✅ Customizable message templates
- ✅ Error handling for invalid phone numbers
- ✅ Cost under $0.01 per SMS

---

## Task 2: Friends Management UI

### Goal
Allow admin to add/remove friends via dashboard UI instead of editing backend file.

### Implementation

#### Step 2.1: Create Backend Endpoints
**File:** `backend/app/routes/friends.py`

Add new endpoints:
- `POST /api/friends/` - Add new friend
- `DELETE /api/friends/{id}` - Remove friend
- Validation: email format, no duplicates
- Store in DynamoDB (friends table)

#### Step 2.2: Create Friends Management Component
**File:** `src/components/ManageFriends.jsx` (NEW FILE)

Features:
- Form to add friend (name, email, phone)
- List of current friends with avatars
- Delete button for each friend
- Confirmation dialog before delete
- Real-time updates

#### Step 2.3: Add to Dashboard
**File:** `src/pages/Dashboard.jsx`

Add new tab: "Manage Friends"
- Accessible to admin only
- Shows friend count
- Quick add form

### Success Criteria
- ✅ Add friend via UI, appears in participant lists immediately
- ✅ Delete friend, removed from all dropdown lists
- ✅ Email validation (no invalid emails)
- ✅ Duplicate detection (error if email exists)

---

## Task 3: Expense Status Workflow

### Goal
Track expense lifecycle: pending → pending_review → settled

### Implementation

#### Step 3.1: Add Status Update Endpoint
**File:** `backend/app/routes/expenses.py`

Enhance existing `PATCH /api/expenses/{id}/status`:
- Validate status transitions
- Update DynamoDB
- Return updated expense

#### Step 3.2: Add Status UI
**File:** `src/components/ExpenseCard.jsx`

Features:
- Status badge (color-coded)
- "Mark as Settled" button (creator only)
- "Mark as Paid" button (participants)
- Status history timeline

### Success Criteria
- ✅ Creator can mark expense as settled
- ✅ Participants can mark as pending review
- ✅ Settled expenses excluded from "You Owe" metric
- ✅ Clear visual status indicators

---

## Task 4: Production Deployment

### Goal
Deploy backend to Render.com and frontend to Vercel.

### Implementation

#### Step 4.1: Backend Deployment (Render)
- Create `render.yaml` configuration
- Set up environment variables in Render dashboard
- Configure DynamoDB access from Render
- Deploy and test

**Estimated Cost:** $0/month (free tier) or $7/month (Starter)

#### Step 4.2: Frontend Deployment (Vercel)
- Connect GitHub repository to Vercel
- Configure build settings (Vite)
- Set environment variables (API URL)
- Deploy

**Cost:** $0/month (free tier)

#### Step 4.3: Custom Domain (Optional)
- Purchase domain (e.g., `expense-splitter.com`)
- Configure DNS for Vercel
- Set up HTTPS

### Success Criteria
- ✅ Backend accessible at production URL
- ✅ Frontend accessible at production URL
- ✅ HTTPS enabled
- ✅ Environment variables properly configured
- ✅ Friends can access from phones

---

## Task 5: Analytics Dashboard

### Goal
Provide spending insights and visualizations.

### Implementation

#### Step 5.1: Add Analytics Endpoint
**File:** `backend/app/routes/analytics.py` (NEW FILE)

Endpoints:
- `GET /api/analytics/monthly-spending` - Spending by month
- `GET /api/analytics/category-breakdown` - Spending by category
- `GET /api/analytics/top-friends` - Most frequent expense partners

#### Step 5.2: Create Analytics Component
**File:** `src/components/Analytics.jsx` (NEW FILE)

Features:
- Monthly spending chart (line graph)
- Category pie chart
- Top friends list
- Date range selector

#### Step 5.3: Add to Dashboard
**File:** `src/pages/Dashboard.jsx`

Add new tab: "Analytics"

### Success Criteria
- ✅ Charts render correctly
- ✅ Data accurate
- ✅ Mobile-responsive
- ✅ Export to CSV option

---

## Phase 3 Timeline

| Task | Estimated Time | Priority |
|------|---------------|----------|
| AWS SNS Integration | 4 hours | HIGH |
| Friends Management UI | 3 hours | MEDIUM |
| Expense Status Workflow | 3 hours | MEDIUM |
| Production Deployment | 5 hours | HIGH |
| Analytics Dashboard | 4 hours | LOW |
| Testing & Bug Fixes | 3 hours | HIGH |
| **TOTAL** | **22 hours** | |

---

## Phase 3 Completion Criteria

### Must Have (Blocking Production)
- ✅ SMS reminders working
- ✅ Backend deployed to Render
- ✅ Frontend deployed to Vercel
- ✅ HTTPS enabled
- ✅ All existing features working in production

### Nice to Have (Can defer)
- Friends management UI (can still edit backend file)
- Analytics dashboard
- Custom domain

---

## Cost Estimates

### Monthly AWS Costs (Phase 3)
| Service | Usage | Cost |
|---------|-------|------|
| S3 | <1 GB storage | $0.00 (Free Tier) |
| Textract | <100 receipts | $0.00 (Free Tier) |
| DynamoDB | <25 GB, <200M requests | $0.00 (Free Tier) |
| SNS (SMS) | ~50 messages/month | $3.25 ($0.065/SMS) |
| **Total AWS** | | **$3.25/month** |

### Hosting Costs
| Service | Plan | Cost |
|---------|------|------|
| Render (Backend) | Free tier | $0.00 |
| Vercel (Frontend) | Free tier | $0.00 |
| **Total Hosting** | | **$0.00/month** |

### Grand Total: **$3.25/month** (well under $20 budget)

---

## User Notification System (NEW IDEA)

**Note:** Winston has a new idea for notifications - to be discussed and added here.

---

## Files to Create/Modify

### New Files
- `backend/app/services/sns.py` - SNS SMS service
- `backend/app/routes/analytics.py` - Analytics endpoints
- `src/components/ManageFriends.jsx` - Friends management UI
- `src/components/Analytics.jsx` - Analytics dashboard
- `render.yaml` - Render deployment config

### Modified Files
- `backend/app/routes/expenses.py` - Add reminder endpoint
- `backend/app/routes/friends.py` - Add POST/DELETE endpoints
- `src/components/ExpenseCard.jsx` - Connect reminder button
- `src/pages/Dashboard.jsx` - Add new tabs
- `backend/.env` - Add SNS credentials

---

## Testing Checklist

### SMS Notifications
- [ ] Send reminder to valid phone number
- [ ] Handle invalid phone numbers
- [ ] Rate limiting (don't spam)
- [ ] Cost tracking

### Friends Management UI
- [ ] Add friend with valid data
- [ ] Duplicate email validation
- [ ] Delete friend
- [ ] Friends appear in dropdowns immediately

### Production Deployment
- [ ] Backend API accessible
- [ ] Frontend loads correctly
- [ ] HTTPS works
- [ ] Database connections work
- [ ] Environment variables set correctly

---

**Status:** Ready to start after Winston's notification idea discussion

**Next Step:** Define notification system requirements based on Winston's new idea
