import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
// Import the APIs to talk to your backend
import { expenseAPI, friendsAPI } from "../services/api";

const ManualEntry = ({ onExpenseCreated }) => {
    // State variables

    // Exisiting state - tracks which participants are selected
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    // State for the expense title (e.g, "Dinner at HaiDiLao")
    const [description, setDescription] = useState("");

    // State for total amount (e.g., "$150.00")
    const [totalAmount, setTotalAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState( { type: "", text: ""} );

    // Fetch friends from backend API (your real friends list!)
    const [participants, setParticipants] = useState([]);

    // Load friends when component mounts
    useEffect(() => {
        const loadFriends = async () => {
            try {
                const friends = await friendsAPI.getAllFriends();

                // Transform to participant format (match existing structure)
                const participantList = friends.map(f => ({
                    id: f.id,
                    name: f.name,
                    initials: f.initials,
                    contact: f.email  // Use email as contact
                }));

                setParticipants(participantList);
            } catch (error) {
                console.error('Failed to load friends:', error);
                setMessage({ type: 'error', text: 'Failed to load friends list' });
            }
        };

        loadFriends();
    }, []);

    
    // Toogles a participant on/off when selected
    const handleParticipantToggle = (participant) => {
        const isSelected = selectedParticipants.find(p => p.id === participant.id);
        if (isSelected) {
            setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
        } else {
            setSelectedParticipants([...selectedParticipants, participant]);
        }
    };
    

    // This function runs when user clicks "Create Expense" button
    const handleCreateExpense = async () => {
        // Clears any previous messages
        setMessage( { type: "", text: "" } );

        // Validation check
        if (!description.trim()) {
            setMessage( { type: "error", text: "Please enter an expense title"} );
            return; // This will stop and not call the API
        }

        if (!totalAmount || parseFloat(totalAmount) === 0) {
            setMessage( { type: "error", text: "Please enter a valid amount"} );
            return;
        }

        if (selectedParticipants.length === 0) {
            setMessage( {type: "error", text: "Please select at least one participant"} );
            return;
        }

        // Showing loading state (button will say "Creating....")
        setLoading(true);

        try {
            // Data preparation for BACKEND

            // Convert string to number
            const amount = parseFloat(totalAmount);

            // Calculate how much each person owes (split equally)
            const splitAmount = amount / (selectedParticipants.length + 1);

            // Build participants array in the format backend expects
            // Backend expects: { email: string, name: string, amount: float }
            const participantData = selectedParticipants.map(participant => ({
                email: participant.contact.includes("@")
                ? participant.contact
                : `${participant.name.toLowerCase().replace(" ", ".")}@example.com`,
                name: participant.name,
                amount: parseFloat(splitAmount.toFixed(2))
            }));


            const expenseData = {
                description: description,
                total_amount: amount,
                participants: participantData,
                receipt_url: null
            }

            // Calls BACKEND API
            const result = await expenseAPI.createExpense(expenseData);

            setMessage({
                type: "success",
                text: `Expense created sucessfully! ID: ${result.id.substring(0, 8)}....`
            });

            // Clear the form for next expense
            setDescription('');
            setTotalAmount('');
            setSelectedParticipants([]);

            // Notify parent to refresh metrics
            if (onExpenseCreated) {
                onExpenseCreated();
            }


        } catch (error) {
            // If there is an eeror involving API calling
            setMessage({
                type: "error",
                text: error.message || "Failed to create expense"
            });
        } finally {
            // Always turn off loading state, whether sucess or error
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className = "text-muted-foreground"> Add a new expense and split it with participants </CardTitle>
            </CardHeader>

            <CardContent className = "space-y-6 text-left">

                {/* Success / Error Message Display */}
                { message.text && (
                    <div className = {`p-3 rounded-md ${
                        message.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700" // Green for success
                        : "bg-red-50 border border-red-200 text-red-700"    // Red for errors
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className = "space-y-4">
                    <div>
                        <label className = "block text-sm font-medium mb-1 ">
                            Expense Title
                        </label>
                        <input
                            type = "text"
                            placeHolder = "e.g., Dinner at Italian Restaurant"
                            value = {description}
                            onChange = {(e) => setDescription(e.target.value)}
                            className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className = "block text-sm font-medium mb-2 ">
                            Total Amount ($)
                        </label>
                        <input
                            type = "number"
                            placeHolder = "e.g., 100.00"
                            value = {totalAmount}
                            onChange = {(e) => setTotalAmount(e.target.value)}
                            className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Show split amount per person */}
                    {totalAmount && selectedParticipants.length >0 && (
                        <div className = "bg-blue-50 border border-blue-200 p-3 rounded-md">
                            <p className = "text-sm text-blue-700">
                                Split: ${parseFloat(totalAmount / (selectedParticipants.length + 1)).toFixed(2)} per person
                            </p>
                        </div>
                    )}

                    {/* <div>
                        <label className = "block text-sm font-medium mb-2 ">
                            Paid By Who
                        </label>
                        <input
                            type = "text"
                            placeHolder = "e.g., John Doe"
                            className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div> */}

                    {/* Dividers*/}
                    <hr className = "my-6"/>
                    {/* <Separator /> */}

                    {/* Participants Section */}
                    <div className = "space-y-3">
                        <label className = "block text-sm font-medium mb-2">
                            Participants
                        </label>

                        <Card>
                            <CardContent className = "space-y-2">
                                {participants.map(participant => {
                                    const isSelected = selectedParticipants.find(p => p.id === participant.id);
                                    return (
                                        <div
                                            key = {participant.id}
                                            onClick = {() => handleParticipantToggle(participant)}
                                            className = {`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${isSelected ? 'bg-accent/50 border border-gray-300' : 'border border-transparent'}`}
                                        >
                                            <div className = "flex items-center gap-3">
                                                <div className = "h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                                                    {participant.initials}
                                                </div>

                                                <div>
                                                    <p className = "font-medium text-sm"> {participant.name} </p>
                                                    <p className = "text-xs text-muted-foreground"> {participant.contact} </p>
                                                </div>
                                            </div>
                                            {isSelected && <Check className = "h-5 w-5 text-green-600"/>}
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Selected participants list */}
                    <div>
                        <p className = "text-sm font-medium mb-2"> Selected ({selectedParticipants.length}): </p>
                        {selectedParticipants.length > 0 ? (
                            <ul className = "space-y-1">
                                {selectedParticipants.map(participant => (
                                    <li key = {participant.id} className = "text-sm text-muted-foreground">
                                        {participant.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className = "text-sm text-muted-foreground"> No participants selected. </p>
                        )}
                    </div>

                </div>
            </CardContent>
            <button

                onClick = {handleCreateExpense}
                disabled = {loading}
                className = "m-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 flex-1"
            >
                {loading ? "Creating..." : "Create Expense"}

            </button>
        </Card>
    )
}

export default ManualEntry;