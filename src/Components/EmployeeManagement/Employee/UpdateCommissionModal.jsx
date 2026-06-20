import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const UpdateCommissionModal = ({ isOpen, onClose, onSuccess, employeeData }) => {
    const [commission, setCommission] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate initial value when modal opens
    useEffect(() => {
        if (isOpen && employeeData) {
            // Set existing commission, defaulting to '' if undefined
            setCommission(employeeData.commissionPercentage || '');
        } else {
            setCommission('');
        }
    }, [isOpen, employeeData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const commissionValue = parseFloat(commission);

        // Validation
        if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
            return toast.error("Please enter a valid commission between 0 and 100.");
        }

        setIsSubmitting(true);
        const loadingId = toast.loading("Updating commission...");

        try {
            const payload = {
                commissionPercentage: commissionValue
            };

            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/employee/${employeeData.id}/commission`, 
                payload, 
                getAuthConfig()
            );

            if (res.status === 200 || res.data?.status === 'success') {
                toast.update(loadingId, { render: "Commission updated successfully!", type: "success", isLoading: false, autoClose: 2000 });
                onSuccess(); // Trigger table refresh
                onClose();   // Close the modal
            } else {
                throw new Error("API call failed");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.update(loadingId, { render: error.response?.data?.message || "Failed to update commission.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[500px] rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-center px-6 py-6 border-b border-gray-100 relative shrink-0">
                    <h2 className="text-[20px] font-semibold text-[#374151]">
                        Update Commission Percentage
                    </h2>
                    <button 
                        onClick={onClose} 
                        disabled={isSubmitting} 
                        className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <form id="commissionForm" onSubmit={handleSubmit} className="flex flex-col gap-2">
                        <label className="block text-[14px] font-medium text-[#4b5563]">
                            Commission Percentage (%)
                        </label>
                        
                        <input 
                            required 
                            type="number" 
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00" 
                            value={commission} 
                            onChange={(e) => setCommission(e.target.value)} 
                            disabled={isSubmitting}
                            className="w-full h-[45px] px-4 bg-white text-gray-900 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#8C6D4F] focus:ring-1 focus:ring-[#8C6D4F] text-[15px] placeholder:text-gray-400 transition-colors" 
                        />
                        
                        <p className="text-[13px] text-gray-500 mt-1">
                            Enter a value between 0 and 100
                        </p>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-white shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="h-[42px] px-6 text-[#4b5563] font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="commissionForm"
                        disabled={isSubmitting}
                        className="h-[42px] px-6 bg-[#86644c] text-white font-medium rounded-[6px] hover:bg-[#73543d] transition-colors shadow-sm flex items-center justify-center min-w-[160px]"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            "Update Commission"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};