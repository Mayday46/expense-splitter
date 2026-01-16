
import { Card, CardContent } from "@/components/ui/card";
import { Check, SendIcon, Trash2Icon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ExpenseCard = ( { location, status, date, paidBy, totalAmount, perPersonAmount, participants, items, tax, tip, subtotal, isCreator, onDelete, onSendReminder, onMarkPaid, onMarkSettled } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine status badge display
    const getStatusBadge = () => {
        switch (status) {
            case "settled":
                return (
                    <div className="inline-flex items-center gap-1 px-2 py-0 pb-0.5 rounded-full bg-green-600 text-white text-xs font-medium">
                        <Check className="h-3 w-3" />
                        Settled
                    </div>
                );
            case "pending_review":
                return (
                    <div className="inline-flex items-center gap-1 px-2 py-0 pb-0.5 rounded-full bg-blue-600 text-white text-xs font-medium">
                        Pending Review
                    </div>
                );
            case "pending":
            default:
                return (
                    <div className="inline-flex items-center gap-1 px-2 py-0 pb-0.5 rounded-full bg-gray-100 text-black-700 text-xs font-medium">
                        Pending
                    </div>
                );
        }
    };

    return (
        <Card>
            <CardContent>
                {/* Row 1: Location + Status + Delete Button */}
                <div className = "flex items-center justify-between">
                    <div className = "flex items-center gap-2">
                        <span> 📍 {location} </span>
                        {getStatusBadge()}
                    </div>
                    <button className = "text-red-500 hover:text-red-700 px-1 py-0.5" onClick = {onDelete}>
                        <Trash2Icon className = "h-4 w-4" />
                    </button>
                </div>

                {/* Row 2: Date + Paid By */}
                <div className = "text-sm text-muted-foreground text-left my-2">
                    {date} • Paid by {paidBy}
                </div>

                {/* Row 3: Total + Per Person + Expand Button */}
                <div className = "flex justify-between items-center">
                    <span className = "text-2xl font-bold text-foreground"> Total: {totalAmount} </span>
                    <div className="flex items-center gap-3">
                        <p className = "text-sm text-muted-foreground"> Per Person: {perPersonAmount} </p>
                        {(items || tax !== undefined || tip !== undefined) && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && (items || tax !== undefined || tip !== undefined) && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Receipt Details</h4>

                        {/* Items List */}
                        {items && items.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Items Purchased:</p>
                                <ul className="space-y-1">
                                    {items.map((item, index) => (
                                        <li key={index} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                            <span>{item.name}</span>
                                            <span>${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Financial Breakdown */}
                        <div className="space-y-1 text-sm border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                            {subtotal !== undefined && (
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Subtotal:</span>
                                    <span>${typeof subtotal === 'number' ? subtotal.toFixed(2) : subtotal}</span>
                                </div>
                            )}
                            {tax !== undefined && (
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Tax:</span>
                                    <span>${typeof tax === 'number' ? tax.toFixed(2) : tax}</span>
                                </div>
                            )}
                            {tip !== undefined && (
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Tip:</span>
                                    <span>${typeof tip === 'number' ? tip.toFixed(2) : tip}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <hr className = "my-4"/>
                
                {/* Row 4: Participants */}
                <div className = "flex items-center gap-3 mb-4">
                    {participants && participants.map(person => (
                        <div key = {person.name} className = "flex items-center gap-2">
                            
                            <div className = "h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                                
                                {person.initials}
                            </div>
                            <span className = "text-sm">{person.name}</span>
                        </div>
                    ))}
                </div>

                {/* Row 5: Action Buttons (Different for Creator vs Participant) */}
                <div className = "flex gap-2">
                    {isCreator ? (
                        // Creator sees: Send Reminder + Mark Settled
                        <>
                            <button
                                onClick = {onSendReminder}
                                disabled = {status === "settled"}
                                className = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 flex-1"
                            >
                                <SendIcon className="h-4 w-4" />
                                Send Reminder
                            </button>
                            <button
                                onClick = {onMarkSettled}
                                disabled = {status === "settled"}
                                className = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 bg-green-600 text-white hover:bg-green-700 h-9 px-4 py-2 flex-1"
                            >
                                <Check className="h-4 w-4" />
                                {status === "settled" ? 'Settled' : 'Mark Settled'}
                            </button>
                        </>
                    ) : (
                        // Participant sees: Mark as Paid / Pending Review / Settled
                        <button
                            onClick = {onMarkPaid}
                            disabled = {status === "pending_review" || status === "settled"}
                            className = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 bg-green-600 text-white hover:bg-green-700 h-9 px-4 py-2 flex-1"
                        >
                            <Check className="h-4 w-4" />
                            {status === "settled" ? 'Settled' : status === "pending_review" ? 'Pending Review' : 'Mark as Paid'}
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    )

}

export default ExpenseCard;