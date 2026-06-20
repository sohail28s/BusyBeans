import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const UnlinkCustomerModal = ({ isOpen, onClose, onSuccess, customerData }) => {
    const [isUnlinking, setIsUnlinking] = useState(false);

    const handleUnlink = async () => {
        if (!customerData || !customerData.id) return;

        setIsUnlinking(true);
        const loadingId = toast.loading("Unlinking customer...");

        try {
            const payload = {
                info: {
                    employeeId: null
                }
            };

            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/customer-update/${customerData.id}`,
                payload,
                getAuthConfig()
            );

            // Accept 200, 204, or standard success status
            if (res.status === 200 || res.status === 204 || res.data?.status === 'success') {
                toast.update(loadingId, { 
                    render: "Customer unlinked successfully.", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 2000 
                });
                onSuccess(); // Refresh the table on the details page
                onClose();   // Close the modal
            } else {
                throw new Error("API call failed");
            }
        } catch (error) {
            console.error("Unlink error:", error);
            toast.update(loadingId, { 
                render: error.response?.data?.message || "Failed to unlink customer.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsUnlinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[450px] rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
                    <h2 className="text-[18px] font-semibold text-[#374151]">
                        Unlink Customer
                    </h2>
                    <button 
                        onClick={onClose} 
                        disabled={isUnlinking} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-left">
                    <p className="text-[15px] text-[#4b5563] leading-relaxed">
                        Are you sure you want to unlink <span className="font-semibold text-gray-800">{customerData?.companyName || customerData?.name}</span> from this employee? The customer will no longer be assigned to this employee.
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isUnlinking}
                        className="h-[40px] px-6 text-gray-600 font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleUnlink}
                        disabled={isUnlinking}
                        className="h-[40px] px-6 bg-[#dc2626] text-white font-medium rounded-[6px] hover:bg-[#b91c1c] transition-colors shadow-sm flex items-center justify-center min-w-[100px]"
                    >
                        {isUnlinking ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            "Unlink"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};