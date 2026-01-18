# Phase 2: Dashboard Enhancement & Friends Management

**Start Date:** December 25, 2024
**Completion Date:** January 18, 2026
**Actual Duration:** ~14 hours
**Status:** ✅ COMPLETE

---

## ✅ Phase 2 Completion Summary

**All tasks completed successfully!**

✅ **Task 1:** Dashboard Status Cards - Real-time metrics implemented via `useExpenseMetrics` hook
✅ **Task 2:** Friends Management System - Centralized API with `GET /api/friends/` endpoint
✅ **Task 3:** DynamoDB Migration - All expenses persist to DynamoDB with GSI for queries

**Bonus Achievements:**
- Login page modernized with shadcn/ui components
- GitHub repository created and code pushed
- Mac development environment configured
- Temp token files cleaned up

---

## Overview (Original Plan)

Phase 2 focuses on making the app **production-ready** by:
1. Displaying real data on the dashboard
2. Building a friends management system
3. Preparing for DynamoDB migration (Phase 3)

**Key Principle:** This is a **personal app for 15-20 friends/family**, not a public SaaS product. Friends are manually added by you (the admin), not via self-registration.

---

## Task 1: Fix Dashboard Status Cards

### Current State
Status cards show hardcoded values:
- "Total Expenses: 2"
- "Amount Owed: $22.50"
- "Friends: 2"

**File:** `src/components/StatusSection.jsx` (lines 10-32)

### Goal
Calculate and display **real data** from the backend API.

---

### Implementation Steps

#### Step 1.1: Add State to Dashboard
**File:** `src/pages/Dashboard.jsx`

Add state to store calculated metrics:
```javascript
const [statusMetrics, setStatusMetrics] = useState({
    totalExpenses: 0,
    amountOwed: 0,
    friendsCount: 0
});
```

#### Step 1.2: Calculate Metrics from Expenses
**File:** `src/pages/Dashboard.jsx`

Create calculation function:
```javascript
const calculateMetrics = (expenses) => {
    // Total expenses count
    const totalExpenses = expenses.length;

    // Amount owed calculation
    // Sum all expenses where current user is a participant but not the payer
    const amountOwed = expenses.reduce((total, expense) => {
        const userParticipant = expense.participants.find(
            p => p.email === currentUser.email
        );

        // If user didn't pay but participated, add their share
        if (userParticipant && expense.paid_by !== currentUser.email) {
            return total + userParticipant.amount;
        }
        return total;
    }, 0);

    // Friends count (unique participants excluding current user)
    const uniqueFriends = new Set();
    expenses.forEach(expense => {
        expense.participants.forEach(participant => {
            if (participant.email !== currentUser.email) {
                uniqueFriends.add(participant.email);
            }
        });
    });
    const friendsCount = uniqueFriends.size;

    return { totalExpenses, amountOwed, friendsCount };
};
```

#### Step 1.3: Update Metrics on Data Change
Call `calculateMetrics` whenever expenses are fetched:
```javascript
useEffect(() => {
    const loadExpenses = async () => {
        const data = await expenseAPI.getAllExpenses();
        setExpenses(data);

        // Calculate and update metrics
        const metrics = calculateMetrics(data);
        setStatusMetrics(metrics);
    };
    loadExpenses();
}, []);
```

#### Step 1.4: Pass Metrics to StatusSection
**File:** `src/pages/Dashboard.jsx`
```javascript
<StatusSection metrics={statusMetrics} />
```

#### Step 1.5: Update StatusSection Component
**File:** `src/components/StatusSection.jsx`

Replace hardcoded values with props:
```javascript
const StatusSection = ({ metrics }) => {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <CardComponent
                header="Total Expenses"
                contentMetric={metrics.totalExpenses.toString()}
                contentSubtitle="active splits"
                icon={<Landmark className="h-4 w-4 text-muted-foreground"/>}
            />

            <CardComponent
                header="Amount Owed"
                contentMetric={`$${metrics.amountOwed.toFixed(2)}`}
                contentSubtitle="pending payments"
                icon={<BanknoteIcon className="h-4 w-4 text-muted-foreground"/>}
            />

            <CardComponent
                header="Friends"
                contentMetric={metrics.friendsCount.toString()}
                contentSubtitle="in your network"
                icon={<UsersIcon className="h-4 w-4 text-muted-foreground"/>}
            />
        </div>
    );
};
```

---

### Success Metrics - Task 1

| Metric | How to Test | Expected Result |
|--------|-------------|-----------------|
| **Total Expenses** | Create 3 expenses, check card | Shows "3" |
| **Amount Owed** | Create expense where someone else paid, you participated with $25 share | Shows "$25.00" |
| **Friends Count** | Create expenses with 4 different people | Shows "4" |
| **Updates on Delete** | Delete an expense | Card values update immediately |
| **Updates on Create** | Create new expense | Card values update immediately |

---

## Task 2: Build Friends Management System

### Current State
Friends are **hardcoded** in two places:
- `src/components/ManualEntry.jsx` (lines 21-25)
- `src/components/AddParticipantsModal.jsx` (lines 12-16)

Hardcoded list:
```javascript
const participants = [
    { id: 1, name: "John Doe", initials: "JD", contact: "john@email.com" },
    { id: 2, name: "Jane Smith", initials: "JS", contact: "jane@email.com" },
    { id: 3, name: "Alice Johnson", initials: "AJ", contact: "(555) 123-4567" }
];
```

### Goal
**Admin-controlled friends system** where you (Winston) manually add friends via a management UI. Friends cannot self-register.

---

### Implementation Steps

#### Step 2.1: Create Friends Backend Model
**File:** `backend/app/models/friends.py` (NEW FILE)

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

class Friend(BaseModel):
    id: str  # UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    initials: str
    added_by: str  # Admin email who added this friend
    created_at: str  # ISO timestamp
```

#### Step 2.2: Create Friends API Endpoints
**File:** `backend/app/routes/friends.py` (NEW FILE)

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from app.middleware.auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

# Temporary in-memory storage (will migrate to DynamoDB in Phase 3)
friends_db: List[Dict] = []

@router.get("/")
async def get_all_friends(user: Dict = Depends(get_current_user)) -> List[Dict]:
    """
    Get all friends added by current user
    Only admins can see the full friends list
    """
    # Filter friends added by current user (admin)
    user_friends = [f for f in friends_db if f['added_by'] == user['email']]
    return user_friends

@router.post("/")
async def add_friend(
    friend_data: Dict,
    user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Add a new friend (admin only)
    Required fields: name, email
    Optional: phone
    """
    # Generate initials from name
    name_parts = friend_data['name'].split()
    initials = ''.join([part[0].upper() for part in name_parts[:2]])

    # Check if friend already exists
    existing = next(
        (f for f in friends_db if f['email'] == friend_data['email']),
        None
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Friend with this email already exists"
        )

    # Create new friend
    new_friend = {
        'id': str(uuid.uuid4()),
        'name': friend_data['name'],
        'email': friend_data['email'],
        'phone': friend_data.get('phone'),
        'initials': initials,
        'added_by': user['email'],
        'created_at': datetime.utcnow().isoformat()
    }

    friends_db.append(new_friend)
    return new_friend

@router.delete("/{friend_id}")
async def delete_friend(
    friend_id: str,
    user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Delete a friend (admin only)
    Can only delete friends you added
    """
    global friends_db

    # Find friend
    friend = next((f for f in friends_db if f['id'] == friend_id), None)

    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    # Verify ownership
    if friend['added_by'] != user['email']:
        raise HTTPException(
            status_code=403,
            detail="Can only delete friends you added"
        )

    # Delete
    friends_db = [f for f in friends_db if f['id'] != friend_id]

    return {"message": "Friend deleted successfully"}
```

#### Step 2.3: Register Friends Router
**File:** `backend/app/main.py`

Add import:
```python
from app.routes import auth, expenses, receipts, friends
```

Register router:
```python
app.include_router(friends.router, prefix="/api/friends", tags=["Friends"])
```

#### Step 2.4: Seed Initial Friends Data
**File:** `backend/app/routes/friends.py`

Add seed data for testing (remove before production):
```python
# Seed data (for development only)
friends_db = [
    {
        'id': str(uuid.uuid4()),
        'name': 'John Doe',
        'email': 'john@email.com',
        'phone': '(555) 111-1111',
        'initials': 'JD',
        'added_by': 'test@example.com',
        'created_at': datetime.utcnow().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Jane Smith',
        'email': 'jane@email.com',
        'phone': '(555) 222-2222',
        'initials': 'JS',
        'added_by': 'test@example.com',
        'created_at': datetime.utcnow().isoformat()
    }
]
```

#### Step 2.5: Add Friends API Client
**File:** `src/services/api.ts`

Add after `receiptAPI`:
```typescript
// Friends API calls
export const friendsAPI = {
    getAllFriends: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/friends/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }

        return response.json();
    },

    addFriend: async (friendData: { name: string; email: string; phone?: string }) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/friends/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(friendData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add friend');
        }

        return response.json();
    },

    deleteFriend: async (friendId: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/friends/${friendId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete friend');
        }

        return response.json();
    }
};
```

#### Step 2.6: Create Friends Management Component
**File:** `src/components/ManageFriends.jsx` (NEW FILE)

```javascript
import { useState, useEffect } from 'react';
import { friendsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2 } from "lucide-react";

const ManageFriends = () => {
    const [friends, setFriends] = useState([]);
    const [newFriend, setNewFriend] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            const data = await friendsAPI.getAllFriends();
            setFriends(data);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();

        if (!newFriend.name || !newFriend.email) {
            alert('Name and email are required');
            return;
        }

        try {
            await friendsAPI.addFriend(newFriend);
            setNewFriend({ name: '', email: '', phone: '' });
            loadFriends(); // Refresh list
            alert('Friend added successfully!');
        } catch (error) {
            alert(`Failed to add friend: ${error.message}`);
        }
    };

    const handleDeleteFriend = async (friendId) => {
        if (!confirm('Are you sure you want to remove this friend?')) {
            return;
        }

        try {
            await friendsAPI.deleteFriend(friendId);
            loadFriends(); // Refresh list
        } catch (error) {
            alert(`Failed to delete friend: ${error.message}`);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add Friend Form */}
                <form onSubmit={handleAddFriend} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h3 className="font-semibold text-lg">Add New Friend</h3>

                    <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input
                            type="text"
                            value={newFriend.name}
                            onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input
                            type="email"
                            value={newFriend.email}
                            onChange={(e) => setNewFriend({ ...newFriend, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="john@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                        <input
                            type="tel"
                            value={newFriend.phone}
                            onChange={(e) => setNewFriend({ ...newFriend, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="(555) 123-4567"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Friend
                    </button>
                </form>

                {/* Friends List */}
                <div>
                    <h3 className="font-semibold text-lg mb-4">Your Friends ({friends.length})</h3>

                    {loading ? (
                        <p className="text-gray-500">Loading friends...</p>
                    ) : friends.length === 0 ? (
                        <p className="text-gray-500">No friends added yet. Add your first friend above!</p>
                    ) : (
                        <div className="space-y-2">
                            {friends.map((friend) => (
                                <div
                                    key={friend.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                            {friend.initials}
                                        </div>
                                        <div>
                                            <p className="font-medium">{friend.name}</p>
                                            <p className="text-sm text-gray-500">{friend.email}</p>
                                            {friend.phone && (
                                                <p className="text-sm text-gray-500">{friend.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteFriend(friend.id)}
                                        className="text-red-600 hover:text-red-700 p-2"
                                        title="Remove friend"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ManageFriends;
```

#### Step 2.7: Add Friends Tab to Dashboard
**File:** `src/pages/Dashboard.jsx`

Add ManageFriends to the tabs:
```javascript
import ManageFriends from "../components/ManageFriends";

// In the tabs array
const tabs = [
    { id: 'manual', label: 'Manual Entry', component: <ManualEntry onSubmit={handleManualSubmit} /> },
    { id: 'upload', label: 'Upload Receipt', component: <UploadReceipt onUseData={handleReceiptData} /> },
    { id: 'recent', label: 'Recent Expenses', component: <RecentExpenses expenses={expenses} onDelete={handleDeleteExpense} onSendReminder={handleSendReminder} /> },
    { id: 'friends', label: 'Manage Friends', component: <ManageFriends /> }  // NEW
];
```

#### Step 2.8: Update ManualEntry to Use Friends API
**File:** `src/components/ManualEntry.jsx`

Replace hardcoded participants with API data:
```javascript
import { friendsAPI } from "../services/api";

const ManualEntry = ({ onSubmit }) => {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const loadFriends = async () => {
            try {
                const friends = await friendsAPI.getAllFriends();
                // Transform to participant format
                const participantList = friends.map(f => ({
                    id: f.id,
                    name: f.name,
                    initials: f.initials,
                    contact: f.email
                }));
                setParticipants(participantList);
            } catch (error) {
                console.error('Failed to load friends:', error);
            }
        };
        loadFriends();
    }, []);

    // Rest of component...
};
```

#### Step 2.9: Update AddParticipantsModal to Use Friends API
**File:** `src/components/AddParticipantsModal.jsx`

Same change as ManualEntry - fetch from API instead of hardcoded list.

---

### Success Metrics - Task 2

| Metric | How to Test | Expected Result |
|--------|-------------|-----------------|
| **Add Friend** | Click "Manage Friends" tab, add friend "Bob (bob@email.com)" | Friend appears in list immediately |
| **Delete Friend** | Click trash icon on friend | Friend removed from list, confirmation shown |
| **Duplicate Check** | Try adding same email twice | Error: "Friend already exists" |
| **Persistence** | Add friend, refresh page | Friend still in list (survives refresh) |
| **Participants Updated** | Add friend, go to Manual Entry | New friend appears in participant dropdown |
| **Friends Count Card** | Add 3 new friends, create expense with them | Status card shows correct count |
| **Form Validation** | Try submitting without name/email | Error message shown |
| **Admin Only** | (Future: Multiple users) Only admin can add/delete | Others see read-only list |

---

## Task 3: Prepare for DynamoDB Migration (Phase 3)

### Goal
Ensure code is structured to easily swap in-memory storage for DynamoDB.

### Steps

#### Step 3.1: Create Database Service Interface
**File:** `backend/app/services/database.py` (NEW FILE)

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Optional

class DatabaseService(ABC):
    """
    Abstract interface for database operations
    Allows easy swap between in-memory and DynamoDB
    """

    @abstractmethod
    async def create_expense(self, expense: Dict) -> Dict:
        pass

    @abstractmethod
    async def get_all_expenses(self, user_email: str) -> List[Dict]:
        pass

    @abstractmethod
    async def delete_expense(self, expense_id: str) -> bool:
        pass

    @abstractmethod
    async def create_friend(self, friend: Dict) -> Dict:
        pass

    @abstractmethod
    async def get_all_friends(self, user_email: str) -> List[Dict]:
        pass

    @abstractmethod
    async def delete_friend(self, friend_id: str) -> bool:
        pass
```

**Note:** This will make Phase 3 DynamoDB migration much easier!

---

## Phase 2 Timeline

| Task | Estimated Time | Priority |
|------|---------------|----------|
| Fix Status Cards | 2 hours | HIGH |
| Friends Backend API | 2 hours | HIGH |
| Friends Frontend UI | 3 hours | HIGH |
| Update Participant Components | 2 hours | MEDIUM |
| Testing & Bug Fixes | 2 hours | HIGH |
| **TOTAL** | **11 hours** | |

---

## Phase 2 Completion Criteria

### Must Have (Blocking Phase 3) ✅ ALL COMPLETE
- ✅ Status cards show real calculated data - **DONE** (useExpenseMetrics hook)
- ✅ Friends centralized API - **DONE** (GET /api/friends/ working)
- ✅ DynamoDB integration - **DONE** (All expenses persist)
- ✅ Participant components use friends API - **DONE** (ManualEntry + Modal)
- ✅ Metrics update on dashboard - **DONE** (refreshTrigger pattern)

### Nice to Have (Deferred to Phase 3)
- ⏳ Friends management UI (add/remove via dashboard)
- ⏳ Phone number validation
- ⏳ Friend search/filter
- ⏳ Bulk friend import
- ⏳ Friend profile pictures

---

## ✅ PHASE 2 COMPLETE - READY FOR PHASE 3

**Next Steps:** See `PHASE_3_PLAN.md` (to be created)

## User Access Model (Personal App)

### How Friends Are Added

**Option 1: Manual Admin Entry (RECOMMENDED for MVP)**
- You (Winston) manually add each friend through "Manage Friends" UI
- Friends are given credentials separately (email/password via text/in-person)
- **No self-registration** - keeps it simple and controlled
- Limit: 15-20 friends (your circle)

**Implementation:**
- Friends added via ManageFriends component
- User accounts created manually in backend/auth.py
- Credentials shared out-of-band (text message, in person)

**Example Workflow:**
1. You add "John Doe (john@email.com)" in Manage Friends UI
2. You manually add login credentials for John in backend:
   ```python
   USERS_DB = [
       {"email": "test@example.com", "password": "password123", "name": "Winston"},
       {"email": "john@email.com", "password": "john123", "name": "John Doe"},
   ]
   ```
3. You text John: "Login at myapp.com with john@email.com / john123"
4. John logs in and can create/view expenses

**Option 2: Invite Links (Future Enhancement)**
- You send invite link to friend
- Friend clicks link, sets password
- Auto-added to your friends list
- More complex, requires email service

**Decision:** Start with Option 1 (manual) for Phase 2.

---

## Files to Create/Modify

### New Files
- `backend/app/routes/friends.py` - Friends API endpoints
- `backend/app/models/friends.py` - Friend data model
- `backend/app/services/database.py` - Database interface (for Phase 3)
- `src/components/ManageFriends.jsx` - Friends management UI

### Modified Files
- `backend/app/main.py` - Register friends router
- `src/services/api.ts` - Add friendsAPI
- `src/pages/Dashboard.jsx` - Add status metrics, friends tab
- `src/components/StatusSection.jsx` - Accept metrics props
- `src/components/ManualEntry.jsx` - Fetch friends from API
- `src/components/AddParticipantsModal.jsx` - Fetch friends from API

---

## Testing Checklist

### Status Cards Testing
- [ ] Create 5 expenses, verify "Total Expenses" shows 5
- [ ] Create expense where you owe $50, verify "Amount Owed" shows $50
- [ ] Add 3 friends, create expenses with them, verify "Friends" shows 3
- [ ] Delete expense, verify cards update immediately
- [ ] Refresh page, verify cards persist

### Friends Management Testing
- [ ] Add friend with valid data, appears in list
- [ ] Add friend with duplicate email, shows error
- [ ] Delete friend, removed from list
- [ ] Add friend, appears in Manual Entry participant list
- [ ] Add friend, appears in Upload Receipt participant modal
- [ ] Refresh page, friends list persists

### Integration Testing
- [ ] End-to-end: Add friend → Create expense with them → Status cards update
- [ ] Dashboard shows correct metrics for complex scenarios (multiple expenses, multiple participants)

---

## Notes

### Why This Order?
1. **Status cards first** - Quick visual win, teaches data flow
2. **Friends system second** - Foundational for everything else
3. **DynamoDB third** (Phase 3) - Now you have data structures to migrate

### Cost Impact
- No additional AWS costs in Phase 2 (using existing backend)
- DynamoDB in Phase 3 will be free tier (~$0/month for 15-20 users)

### Security Considerations
- Friends can only see expenses they're part of (filtered by user email)
- Admin (you) can manage all friends
- JWT tokens prevent unauthorized access

---

**Ready to Start?** Let's begin with Task 1: Fix Status Cards!
