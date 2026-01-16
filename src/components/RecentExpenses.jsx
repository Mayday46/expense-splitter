import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { expenseAPI } from "../services/api";
import ExpenseCard from "./ExpenseCard";

// const testExpenses = {
//         location: "Pizza Place",
//         isPaid: true,
//         date: "2025-11-28",
//         paidBy: "Alice",
//         totalAmount: "$80.00",
//         perPersonAmount: "$40.00",
//         participants: [
//             { name: "Bob Lin", initials: "BL" },
//             { name: "Andy Shi", initials: "AS" }
//         ],
//     }

const RecentExpenses = forwardRef(({ onExpenseDeleted }, ref) => {

    const [expenses, setExpenses] = useState([]); // Stores expenses from backend
    const [loading, setLoading] = useState(true); // Shows loading spinner
    const [error, setError] = useState(""); // Shows error messages

    const fetchExpenses = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await expenseAPI.getAllExpenses();
            setExpenses(data);
        } catch (error) {
            setError(error.message || "Fail to load expenses");
        } finally {
            setLoading(false);
        }
    }

    // Expose fetchExpenses to parent component via ref
    useImperativeHandle(ref, () => ({
        fetchExpenses
    }));

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        try {
            await expenseAPI.deleteExpense(expenseId);
            setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));

            // Notify parent to refresh metrics
            if (onExpenseDeleted) {
                onExpenseDeleted();
            }
        } catch (error) {
            alert("Fail to delete expense: " + error.message);
        }
    }

    const transformExpense = (expense) => {
        // Get current user's email from localStorage
        const token = localStorage.getItem('token');
        let currentUserEmail = '';
        if (token) {
            // Decode JWT to get user email (JWT structure: header.payload.signature)
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserEmail = payload.sub; // 'sub' contains user email
        }

        // Determine if current user is the creator
        const isCreator = expense.user_id === currentUserEmail;

        // Calculate per-person amount (including creator)
        const perPersonAmount = expense.participants.length > 0 ? (expense.total_amount / (expense.participants.length + 1)).toFixed(2) : expense.total_amount.toFixed(2);
        const getInitials = (name) => {
            return name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
        }

        return {
            id: expense.id,
            location: expense.description,
            status: expense.status,  // Pass actual status: "pending", "pending_review", or "settled"
            date: new Date(expense.created_at).toLocaleDateString(),
            paidBy: isCreator ? "You" : expense.created_by_name,  // Show creator's name if you're a participant
            totalAmount: `$${expense.total_amount.toFixed(2)}`,
            perPersonAmount: `$${perPersonAmount}`,
            participants: expense.participants.map(p => ({
                name: p.name,
                initials: getInitials(p.name)
            })),
            // Include receipt details if available
            items: expense.items || null,
            tax: expense.tax,
            tip: expense.tip,
            subtotal: expense.subtotal,
            isCreator: isCreator  // Pass this to ExpenseCard
        }
    }

    const handleMarkPaid = async (expenseId) => {
        if (!window.confirm("Confirm that you have paid this expense? The creator will be notified.")) {
            return;
        }

        try {
            // Update status to pending_review
            await expenseAPI.updateExpenseStatus(expenseId, "pending_review");

            // Update local state immediately using functional update
            setExpenses(prevExpenses => prevExpenses.map(exp =>
                exp.id === expenseId ? { ...exp, status: "pending_review" } : exp
            ));

            // Notify parent to refresh metrics
            if (onExpenseDeleted) {
                onExpenseDeleted();
            }
        } catch (error) {
            alert("Failed to mark as paid: " + error.message);
        }
    };

    const handleMarkSettled = async (expenseId) => {
        if (!window.confirm("Mark this expense as settled? This means all payments have been completed.")) {
            return;
        }

        try {
            // Call backend API to update status
            await expenseAPI.updateExpenseStatus(expenseId, "settled");

            // Update local state to reflect the change immediately using functional update
            setExpenses(prevExpenses => prevExpenses.map(exp =>
                exp.id === expenseId ? { ...exp, status: "settled" } : exp
            ));

            // Notify parent to refresh metrics
            if (onExpenseDeleted) {
                onExpenseDeleted();  // Reusing this callback to trigger refresh
            }
        } catch (error) {
            alert("Failed to mark as settled: " + error.message);
        }
    };

    const handleSendReminder = () => {
        // SMS feature not configured - placeholder for future implementation
        alert("SMS reminders are not configured. Manually text your friends for now!");
    };

    if (loading) {
        return (
            <div className = "text-center py-8">
                <p className = "text-gray-600"> Loading expenses... </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className = "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        )
    }
    
    if (expenses.length === 0) {
        return (
            <div className = "text-center py-8">
                <p className = "text-gray-600"> No expense yet.</p>
            </div>
        )
    }

    return (
        <div className = "space-y-4">
            {expenses.map(expense => {
                const transformed = transformExpense(expense);
                return(
                    <ExpenseCard
                        key={expense.id}
                        location={transformed.location}
                        status={transformed.status}
                        date={transformed.date}
                        paidBy={transformed.paidBy}
                        totalAmount={transformed.totalAmount}
                        perPersonAmount={transformed.perPersonAmount}
                        participants={transformed.participants}
                        items={transformed.items}
                        tax={transformed.tax}
                        tip={transformed.tip}
                        subtotal={transformed.subtotal}
                        isCreator={transformed.isCreator}
                        onDelete={() => handleDelete(expense.id)}
                        onSendReminder={() => handleSendReminder(expense.id)}
                        onMarkPaid={() => handleMarkPaid(expense.id)}
                        onMarkSettled={() => handleMarkSettled(expense.id)}
                    />
                )
            })}

        </div>
    )
});

// Add display name for debugging
RecentExpenses.displayName = 'RecentExpenses';

export default RecentExpenses;