import { useState, useRef } from "react";
import Header from "../components/Header";
import ManualEntry from "../components/ManualEntry";
import NavBar from "../components/Navbar";
import RecentExpenses from "../components/RecentExpenses";
import StatusSection from "../components/StatusSection";
import UploadReceipt from "../components/UploadReceipt";
import AddParticipantsModal from "../components/AddParticipantsModal";

const Dashboard = () => {

    const [activeTab, setActiveTab] = useState("manual");
    const [modalOpen, setModalOpen] = useState(false);
    const [extractedReceiptData, setExtractedReceiptData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);  // Triggers re-fetch of metrics
    const recentExpensesRef = useRef(null);

    const handleDelete = () => {
        console.log("Delete expense");
    }

    const handleSendReminder = () => {
        console.log("Send payment reminder");
    }

    // Handler when user clicks "Use This Data" button
    const handleUseReceiptData = (extractedData) => {
        setExtractedReceiptData(extractedData);
        setModalOpen(true);
    };

    // Handler when expense is successfully created
    const handleExpenseCreated = () => {
        // Switch to expenses tab to show the new expense
        setActiveTab("expenses");
        // Trigger refresh of expenses list AND metrics
        if (recentExpensesRef.current?.fetchExpenses) {
            recentExpensesRef.current.fetchExpenses();
        }
        setRefreshTrigger(prev => prev + 1);  // Increment to trigger metrics refresh
    };

    // Handler when expense is deleted
    const handleExpenseDeleted = () => {
        setRefreshTrigger(prev => prev + 1);  // Trigger metrics refresh
    };

    return (
        <div className = "p-4 md:p-8 space-y-4 md:space-y-6">
            <Header />
            <StatusSection refreshTrigger={refreshTrigger} />
            <NavBar
                activeTab = {activeTab}
                setActiveTab = {setActiveTab}
                expensesCount = {5}
            
            />

            {activeTab === "expenses" && (
                <RecentExpenses ref={recentExpensesRef} onExpenseDeleted={handleExpenseDeleted} />
            )}

            {activeTab === "upload" && (
                <UploadReceipt onUseData={handleUseReceiptData} />
            )}

            {activeTab === "manual" && (
                <ManualEntry onExpenseCreated={handleExpenseCreated} />
            )}

            {/* Modal for adding participants to receipt expense */}
            <AddParticipantsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                extractedData={extractedReceiptData}
                onSuccess={handleExpenseCreated}
            />

        </div>
    );
}

export default Dashboard;