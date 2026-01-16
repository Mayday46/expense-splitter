import { X } from "lucide-react";

export const Dialog = ({ open, onClose, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70"
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export const DialogContent = ({ children, onClose }) => {
    return (
        <div className="relative">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <X className="h-5 w-5" />
            </button>
            {children}
        </div>
    );
};

export const DialogHeader = ({ children }) => {
    return (
        <div className="px-6 py-4 border-b dark:border-gray-700">
            {children}
        </div>
    );
};

export const DialogTitle = ({ children }) => {
    return (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {children}
        </h2>
    );
};

export const DialogBody = ({ children }) => {
    return (
        <div className="px-6 py-4">
            {children}
        </div>
    );
};

export const DialogFooter = ({ children }) => {
    return (
        <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
            {children}
        </div>
    );
};
