
import { useEffect, useState, useCallback } from "react";
import { expenseAPI } from "../services/api";

/**
 * Custom hook to calculate expense metrics for status cards
 * Returns: { totalExpenses, owedToYou, youOwe, loading, error, refetch }
 *
 * Pass refreshTrigger to force recalculation when it changes
 */

export const useExpenseMetrics = (refreshTrigger = 0) => {
    const [metrics, setMetrics] = useState({
        totalExpenses: 0,
        owedToYou: 0,
        youOwe: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const calculateMetrics = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch all expenses from API
            const expenses = await expenseAPI.getAllExpenses();

            // Get current user's email from localStorage/JWT
            const token = localStorage.getItem('token');
            let currentUserEmail = '';
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                currentUserEmail = payload.sub;
            }

            // Filter to exclude SETTLED expenses (include both pending and pending_review)
            const pendingExpenses = expenses.filter(expense => expense.status !== 'settled');

            // Metric 1: Total Expenses (count unsettled expenses)
            const totalExpenses = pendingExpenses.length;

            // Metric 2: Owed to You (only from unsettled expenses)
            // Logic:
            // 1. Filter expenses where you are the creator (already filtered to unsettled)
            // 2. For each expense, sum up participant amounts
            // 3. Add them all together
            const owedToYou = pendingExpenses
                .filter(expense => expense.user_id === currentUserEmail)
                .reduce((total, expense) => {
                    // Sum all participant amounts for this expense
                    const participantTotal = expense.participants.reduce(
                        (sum, participant) => sum += participant.amount,
                        0
                    );
                    return total + participantTotal;
                }, 0)

            // Metric 3: You owe (only from unsettled expenses)
            // Logic:
            // 1. Filter expenses where you're a participant (not creator) - already filtered to unsettled
            // 2. Find YOUR amount in each expense
            // 3. Add them all together
            const youOwe = pendingExpenses
                .filter(expense => {
                    // Check to see if you're a participant
                    const isParticipant = expense.participants.some(
                        participant => participant.email === currentUserEmail
                    );
                    const isCreater = expense.user_id === currentUserEmail;
                    return isParticipant && !isCreater;
                })
                .reduce((total, expense) => {
                    // Find YOUR amount in this expense
                    const yourParticipation = expense.participants.find(
                        participant => participant.email === currentUserEmail
                    );
                    const yourAmount = yourParticipation ? yourParticipation.amount : 0;
                    return total + yourAmount;
                }, 0);

            // Update state, after all calculation
            // Round to 2 decimals but keep as numbers (not strings)
            setMetrics({
                totalExpenses,
                owedToYou: parseFloat(owedToYou.toFixed(2)),
                youOwe: parseFloat(youOwe.toFixed(2))
            });

        } catch (error) {
            setError(error.message || 'Failed to calculate metrics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        calculateMetrics();
    }, [refreshTrigger, calculateMetrics]);

    const refetch = () => {
        calculateMetrics();
    };

    return { ...metrics, loading, error, refetch };
};