# Code Review - Expense Splitter App

**Review Date:** 2025-12-26
**Status:** Development Phase - Friends Management Complete

---

## ✅ WHAT'S WORKING

### Backend
- ✅ JWT Authentication with bcrypt password hashing
- ✅ Manual user management via .env (6 users configured)
- ✅ Friends API with current user filtering
- ✅ Expense creation with participant tracking
- ✅ Expense filtering (shows expenses you created OR participate in)
- ✅ Receipt upload integration (AWS Textract ready)

### Frontend
- ✅ Login/Authentication flow
- ✅ Friends loaded from backend API
- ✅ Manual expense entry with participant selection
- ✅ Receipt upload with OCR processing
- ✅ Recent expenses display
- ✅ Split calculation includes payer (+1 logic)

---

## 🚨 CRITICAL BUGS (Must Fix Before Testing)

### Bug #1: Split Calculation in AddParticipantsModal (Receipt Flow)
**File:** `src/components/AddParticipantsModal.jsx`
**Line:** 62

**Current Code:**
```javascript
const splitAmount = extractedData.total / selectedParticipants.length;
```

**Problem:** This DOESN'T include the person who paid!

**Example:**
- Total: $100
- Selected: 1 participant (Long He)
- Calculates: $100 / 1 = $100 per person ❌
- Should be: $100 / 2 = $50 per person ✅

**Impact:** Receipt-based expenses will have WRONG amounts!

**Same issue on line 176** (display preview)

---

### Bug #2: Authorization Check Inconsistency
**File:** `backend/app/routes/expenses.py`
**Lines:** 96-97 (GET single expense), 112-113 (DELETE expense)

**Current Code:**
```python
if expense["user_id"] != user["email"]:
    raise HTTPException(status_code=403, detail="Not authorized")
```

**Problem:**
- `GET /expenses/` returns expenses you participate in
- But `GET /expenses/{id}` blocks participants from viewing details
- Participants can see expense in list but can't click to view it!

**Expected Behavior:**
- GET single: Allow if creator OR participant
- DELETE: Only allow creator (this is correct)

---

## ⚠️ LOGIC ISSUES (Important But Not Breaking)

### Issue #1: Hardcoded Status Cards
**File:** `src/components/StatusSection.jsx`
**Lines:** 16, 23, 30

**Current:** Shows fake data
- Total Expenses: 2
- Amount Owed: $22.50
- Friends: 2

**Should:** Calculate from real data
- Total Expenses: Count expenses you participate in
- Amount Owed: Sum of amounts where you're a participant
- Friends: Count from friends API

---

### Issue #2: "Paid By Who" Input Does Nothing
**File:** `src/components/ManualEntry.jsx`
**Lines:** 193-200

**Current:** Input field exists but:
- Not connected to state
- Value not used in expense creation
- Misleading to users

**Your Design Decision:** Creator is always the payer
**Fix:** Remove this input field to avoid confusion

---

### Issue #3: ManualEntry Doesn't Refresh Expenses Tab
**File:** `src/components/ManualEntry.jsx`

**Problem:**
- After creating expense, user must manually switch tabs to see it
- UploadReceipt flow DOES auto-switch and refresh

**Suggestion:** Either:
1. Auto-switch to "Expenses" tab after creation
2. Show success message telling user to check Expenses tab

---

### Issue #4: Per-Person Display in RecentExpenses
**File:** `src/components/RecentExpenses.jsx`
**Line:** 74

**Current Code:**
```javascript
const perPersonAmount = expense.total_amount / expense.participants.length
```

**Question:** Does `expense.participants` include the creator?
- If NO: This is wrong (same as AddParticipantsModal bug)
- If YES: This is correct

**Need to verify:** Check what ManualEntry sends to backend

---

## 📊 SUMMARY

### What We Built
1. **Authentication System**
   - 6 users with secure passwords
   - JWT-based auth
   - Manual user management

2. **Friends System**
   - Shared network (all users see same friends)
   - Current user filtered out
   - Managed in backend code only

3. **Expense Creation**
   - Manual entry flow
   - Receipt OCR flow
   - Participant selection
   - Split calculation (mostly correct)

4. **Expense Viewing**
   - See expenses you created
   - See expenses you participate in
   - Shows "Paid by You" vs "Paid by [Name]"

### Critical Path to Working App
**Must fix before full testing:**
1. ✅ Fix split calculation in AddParticipantsModal (+1 for payer)
2. ✅ Fix authorization for viewing single expense (allow participants)
3. ⚠️ Remove "Paid By Who" input field (confusing/non-functional)

**Should fix for better UX:**
4. Calculate real status card metrics
5. Refresh expenses after manual entry
6. Verify per-person amount calculation

---

## 🔍 WHAT TO TEST

After fixing critical bugs:

1. **Login as Winston**
   - Create expense with Long He
   - Verify split is correct (total / 2)
   - Check Recent Expenses shows "Paid by You"

2. **Login as Long He**
   - Check Recent Expenses shows expense
   - Verify shows "Paid by Winston Lin"
   - Verify amount is correct
   - Try clicking to view details (should work after Bug #2 fix)

3. **Receipt Flow**
   - Upload receipt as Winston
   - Add Long He as participant
   - Verify split calculation includes payer

---

## 📝 ARCHITECTURE NOTES

**Design Decisions Made:**
- Expense creator = always the payer
- No "who paid" selection needed
- Creator always included in split (+1)
- Admin-only friend management
- Shared friend network (not individual lists)

**Data Flow:**
```
Frontend → API → In-Memory DB (expenses_db list)
         ↓
    localStorage (JWT token)
```

**Current Limitations:**
- Data lost on server restart (in-memory DB)
- No receipt storage yet (S3 integration ready)
- Status cards show fake data
- No payment tracking (all "pending")

---

## ✅ RECOMMENDATIONS

**Before continuing:**
1. Fix the 2 critical bugs
2. Test the fixed flow end-to-end
3. Verify split calculations are correct
4. Then move on to new features

**Next features to build:**
1. Real status card calculations
2. Mark expenses as "paid"
3. Payment reminder functionality
4. Receipt image storage (S3)

---

**Ready to fix bugs?** Let me know and I'll guide you through each fix step-by-step!
