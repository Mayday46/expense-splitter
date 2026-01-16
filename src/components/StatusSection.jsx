import { motion } from "framer-motion";
import { BanknoteIcon, Landmark, TrendingUp } from "lucide-react";
import CardComponent from "./CardComponent";
import { useExpenseMetrics } from "../hooks/useExpenseMetrics";

const StatusSection = ({ refreshTrigger = 0 }) => {
    const { totalExpenses, owedToYou, youOwe, loading, error } = useExpenseMetrics(refreshTrigger);

    if (loading) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-600">Loading metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4">
                <p className="text-red-600">Error loading metrics: {error}</p>
            </div>
        );
    }

    return (

        <motion.div
            initial = {{ opacity: 0, y: 20 }}
            animate = {{ opacity: 1, y: 0  }}
            transition = {{ delay: 0.1 }}
            className = "grid grid-cols-2 md:grid-cols-3 gap-3"
        >
            <CardComponent
                header = "Total Expenses"
                contentMetric = {totalExpenses}
                contentSubtitle = "active splits"
                icon = {<Landmark className = "h-4 w-4 text-muted-foreground"/>}
            />

            <CardComponent
                header = "Owed to You"
                contentMetric = {`$${owedToYou}`}
                contentSubtitle = "pending payments"
                icon = {<TrendingUp className = "h-4 w-4 text-muted-foreground"/>}
            />

            <CardComponent
                header = "You Owe"
                contentMetric = {`$${youOwe}`}
                contentSubtitle = "to others"
                icon = {<BanknoteIcon className = "h-4 w-4 text-muted-foreground"/>}
            />
        </motion.div>

    )
}

export default StatusSection;