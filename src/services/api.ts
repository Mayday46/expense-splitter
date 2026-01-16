// This file handles ALL communication with your backend
// Think of it as a "phone book" - it knows how to call each backend endpoint

// Use your computer's IP address for mobile testing
// Change back to 'http://localhost:8000/api' for desktop-only testing
const API_BASE_URL = 'http://192.168.50.120:8000/api';

// Helper function to make requests with authentication
async function apiRequest(endpoint: string, options: RequestInit = {}) {

    const token = localStorage.getItem('token'); // Get JWT from browser storage

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Add token if exists
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
    }

    // Authentication API calls
    export const authAPI = {
    login: async (email: string, password: string) => {
        return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        });
    },

    getCurrentUser: async () => {
        return apiRequest('/auth/me');
    },
    };

    // Expense API calls
    export const expenseAPI = {
    createExpense: async (expenseData: any) => {
        return apiRequest('/expenses/', {
        method: 'POST',
        body: JSON.stringify(expenseData),
        });
    },

    getAllExpenses: async () => {
        return apiRequest('/expenses/');
    },

    getExpense: async (expenseId: string) => {
        return apiRequest(`/expenses/${expenseId}`);
    },

    deleteExpense: async (expenseId: string) => {
        return apiRequest(`/expenses/${expenseId}`, {
        method: 'DELETE',
        });
    },

    updateExpenseStatus: async (expenseId: string, status: string) => {
        return apiRequest(`/expenses/${expenseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        });
    },
};

// Receipt API calls (file uploads)
export const receiptAPI = {
    uploadAndProcess: async (file: File) => {
        const token = localStorage.getItem('token');

        // FormData is used for file uploads (different from JSON)
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/receipts/upload`, {
            method: 'POST',
            headers: {
                // NOTE: No 'Content-Type' header - browser sets it automatically for FormData
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData, // Send file data
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to process receipt');
        }

        return response.json();
    },
};

// Friends API calls (read-only - friends managed in backend code)
export const friendsAPI = {
    // Get all friends in the shared network
    getAllFriends: async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/friends/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch friends');
        }

        return response.json();
    }
};
