import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { expenseAPI, friendsAPI } from "../services/api";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

const AddParticipantsModal = ({ open, onClose, extractedData, onSuccess }) => {
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch friends from backend API (your real friends list!)
    const [participants, setParticipants] = useState([]);

    // Load friends when modal opens
    useEffect(() => {
        if (open) {
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
                    setError('Failed to load friends list');
                }
            };

            loadFriends();
        }
    }, [open]);

    const handleParticipantToggle = (participant) => {
        const isSelected = selectedParticipants.find(p => p.id === participant.id);
        if (isSelected) {
            setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
        } else {
            setSelectedParticipants([...selectedParticipants, participant]);
        }
    };

    const handleCreateExpense = async () => {
        setError("");

        // Validation
        if (selectedParticipants.length === 0) {
            setError("Please select at least one participant");
            return;
        }

        setLoading(true);

        try {
            // Calculate split amount
            const splitAmount = extractedData.total / (selectedParticipants.length + 1);

            // Build participants array for backend
            const participantData = selectedParticipants.map(participant => ({
                email: participant.contact.includes("@")
                    ? participant.contact
                    : `${participant.name.toLowerCase().replace(" ", ".")}@example.com`,
                name: participant.name,
                amount: parseFloat(splitAmount.toFixed(2))
            }));

            // Create expense data
            const expenseData = {
                description: extractedData.merchant,
                total_amount: extractedData.total,
                participants: participantData,
                receipt_url: null, // Will add this when we have S3
                // Include receipt details
                items: extractedData.items || [],
                tax: extractedData.tax || 0,
                tip: extractedData.tip || 0,
                subtotal: extractedData.total - (extractedData.tax || 0) - (extractedData.tip || 0)
            };

            // Call backend API
            await expenseAPI.createExpense(expenseData);

            // Success! Close modal and refresh expenses
            onSuccess();
            onClose();

            // Reset state
            setSelectedParticipants([]);
        } catch (err) {
            setError(err.message || "Failed to create expense");
        } finally {
            setLoading(false);
        }
    };

    if (!extractedData) return null;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent onClose={onClose}>
                <DialogHeader>
                    <DialogTitle>Add Participants to Split Expense</DialogTitle>
                </DialogHeader>

                <DialogBody>
                    {/* Show extracted data summary */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Merchant:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{extractedData.merchant}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">${extractedData.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{extractedData.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Participants selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Select Participants
                        </label>

                        <div className="space-y-2">
                            {participants.map(participant => {
                                const isSelected = selectedParticipants.find(p => p.id === participant.id);
                                return (
                                    <div
                                        key={participant.id}
                                        onClick={() => handleParticipantToggle(participant)}
                                        className={`flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                                                : 'border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {participant.initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{participant.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{participant.contact}</p>
                                            </div>
                                        </div>
                                        {isSelected && <Check className="h-5 w-5 text-blue-600 dark:text-blue-400"/>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Show split amount preview for Uploading Receipt flow*/}
                    {selectedParticipants.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Split: ${(extractedData.total / (selectedParticipants.length + 1)).toFixed(2)} per person ({selectedParticipants.length} {selectedParticipants.length === 1 ? 'participant' : 'participants'})
                            </p>
                        </div>
                    )}
                </DialogBody>

                <DialogFooter>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateExpense}
                        disabled={loading || selectedParticipants.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    >
                        {loading ? "Creating..." : "Create Expense"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddParticipantsModal;
