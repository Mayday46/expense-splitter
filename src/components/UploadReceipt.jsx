import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { receiptAPI } from "../services/api";


const UploadReceipt = ({ onUseData }) => {

    const [receiptImage, setReceiptImage] = useState(null);
    const [imageFile, setImageFile] = useState(null); // Stores actual file
    const [processing, setProcessing] = useState(false); // Shows "Processing...." state
    const [extractedData, setExtractedData] = useState(null); // OCR results

    // Ref for file inputs
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Handle for file inputs
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Clear previous extraction
            setExtractedData(null);
        }
    }

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const event = { target: { files: [file]} };
            handleFileSelect(event);
        }
    };

    // Real AWS Textract Processing - uploads to S3 and extracts receipt data
    const handleProcessReceipt = async () => {
        setProcessing(true);

        try {
            // Call your backend API: Upload to S3 → Textract gets data from s3 -> Extract Data → Return OCR data
            const ocrData = await receiptAPI.uploadAndProcess(imageFile);

            // Set the extracted data (merchant, total, date, items, tax, tip)
            setExtractedData(ocrData);
        } catch (error) {
            console.error('OCR processing failed:', error);
            alert(`Failed to process receipt: ${error.message}`);
            setProcessing(false);
            return;
        }

        setProcessing(false);
    };

    // Reset everything - allows user to upload a new receipt
    const handleReset = () => {
        setReceiptImage(null);
        setImageFile(null);
        setExtractedData(null);
        setProcessing(false);
    };

    // Trigger file input when user clicks the upload area
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Trigger camera input when user clicks camera button
    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-left">Upload Receipt</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Upload Area - only show if no image uploaded */}
                {!receiptImage && (
                    <>
                        <div
                            onClick={handleUploadClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        >
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium mb-2">
                                Drag and drop your receipt here
                            </p>
                            <p className="text-sm text-muted-foreground">
                                or Click to Browse Files
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t"/>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or use your camera
                                </span>
                            </div>
                        </div>

                        {/* Camera Button */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleCameraClick}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 flex-1"
                            >
                                <Camera className="h-5 w-5"/>
                                Take Photo
                            </button>
                        </div>
                    </>
                )}

                {/* Image Preview - show after upload */}
                {receiptImage && (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={receiptImage}
                                alt="Receipt preview"
                                className="w-full h-auto rounded-lg border border-gray-300"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                            >
                                Upload Different Receipt
                            </button>

                            {!extractedData && (
                                <button
                                    onClick={handleProcessReceipt}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? "Processing..." : "Extract Data"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Extracted Data Display */}
                {extractedData && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">Extracted Data</h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Merchant:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{extractedData.merchant}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{extractedData.date}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ${(extractedData.total - extractedData.tax - extractedData.tip).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">${extractedData.tax.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tip:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">${extractedData.tip.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-700">
                                <span className="text-gray-900 dark:text-gray-100 font-semibold">Total:</span>
                                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">${extractedData.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="mt-4">
                            <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100"> Item Purchased </h4>
                            <ul className="space-y-1 text-sm">
                                {extractedData.items.map((item, index) => (
                                    <li key={index} className="flex justify-between text-gray-800 dark:text-gray-200">
                                        <span>{item.name}</span>
                                        <span>${item.price.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Use This Data Button */}
                        <button
                            onClick={() => onUseData(extractedData)}
                            className="w-full mt-4 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600"
                        >
                            Use This Data for Expense
                        </button>
                    </div>
                )}

            </CardContent>

        </Card>
    )
}

export default UploadReceipt;