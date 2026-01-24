import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CreditCard, DollarSign, Receipt } from "lucide-react";
import { useState } from "react";

const initialNotifications = [
    {
        id: 1,
        type: "expense_added",
        from: "Alice",
        message: "added you to",
        target: "Dinner at Mizumi Sushi",
        amount: 25.00,
        timestamp: "10 minutes ago",
        unread: true,
        icon: Receipt,
    },
    {
        id: 2,
        type: "payment_requested",
        from: "Bob",
        message: "requested",
        target: "Movie Tickets",
        amount: 15.50,
        timestamp: "30 minutes ago",
        unread: true,
        icon: DollarSign,
    },
    {
        id: 3,
        type: "payment_received",
        from: "Carol",
        message: "paid you for",
        target: "Groceries",
        amount: 32.00,
        timestamp: "2 hours ago",
        unread: false,
        icon: CreditCard,
    },
    {
        id: 4,
        type: "expense_added",
        from: "Dave",
        message: "added you to",
        target: "Uber ride",
        amount: 18.75,
        timestamp: "5 hours ago",
        unread: false,
        icon: Receipt,
    },
    {
        id: 5,
        type: "payment_received",
        from: "Eve",
        message: "paid you for",
        target: "Coffee run",
        amount: 8.50,
        timestamp: "1 day ago",
        unread: false,
        icon: CreditCard,
    },
    {
        id: 6,
        type: "payment_requested",
        from: "Frank",
        message: "requested",
        target: "Concert tickets",
        amount: 75.00,
        timestamp: "2 days ago",
        unread: false,
        icon: DollarSign,
    },
]

const NotificationPanel = () => {

    const [notifications, setNotifications] = useState(initialNotifications);
    const [tab, setTab] = useState("all");

    const unreadCount = notifications.filter((n) => n.unread).length;
    const filtered = tab === "unread" ? notifications.filter((n) => n.unread) : notifications;

    const markAsRead = (id) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
        );
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, unread: false })))
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="relative mt-2 md:mt-3">
                    <Bell />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="center" className="w-[380px] p-0 z-[100]">
                <Tabs value={tab} onValueChange={setTab}>

                    <div className="flex items-center justify-between border-b px-3 py-2">
                        <TabsList className="bg-transparent">
                            <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
                            <TabsTrigger value="unread" className="text-sm">
                                Unread ({unreadCount})
                            </TabsTrigger>
                        </TabsList>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-muted-foreground hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        ) : (
                            filtered.map((n) => {
                                const Icon = n.icon;
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className="flex w-full items-start gap-3 border-b px-3 py-3 text-left hover:bg-accent"
                                    >
                                        <div className="mt-1 text-muted-foreground">
                                            <Icon size={18} />
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${n.unread ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                                                {n.from} {n.message}{" "}
                                                <span className="font-medium">{n.target}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                ${n.amount.toFixed(2)} • {n.timestamp}
                                            </p>
                                        </div>
                                        {n.unread && (
                                            <span className="mt-1 inline-block size-2 rounded-full bg-primary" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                </Tabs>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationPanel;
