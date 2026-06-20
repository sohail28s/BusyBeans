import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const DeleteEmployeeModal = ({ isOpen, onClose, onSuccess, employeeData }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!employeeData || !employeeData.id) return;

        setIsDeleting(true);
        const loadingId = toast.loading("Deleting employee...");

        try {
            const res = await axios.delete(
                `https://testingbb.trimworldwide.com/api/v1/admin/employee/${employeeData.id}`,
                getAuthConfig()
            );

            // Accept 200, 204, or standard success status
            if (res.status === 200 || res.status === 204 || res.data?.status === 'success') {
                toast.update(loadingId, { 
                    render: "Employee deleted successfully.", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 2000 
                });
                onSuccess(); // Refresh the table
                onClose();   // Close the modal
            } else {
                throw new Error("API call failed");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.update(loadingId, { 
                render: error.response?.data?.message || "Failed to delete employee.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[500px] rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
                    <h2 className="text-[18px] font-semibold text-[#374151]">
                        Delete Employee
                    </h2>
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 flex items-center justify-center text-center">
                    <p className="text-[16px] text-[#4b5563] font-medium">
                        Are you sure you want to delete this Employee?
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isDeleting}
                        className="h-[40px] px-6 text-gray-600 font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-[40px] px-6 bg-[#86644c] text-white font-medium rounded-[6px] hover:bg-[#73543d] transition-colors shadow-sm flex items-center justify-center min-w-[140px]"
                    >
                        {isDeleting ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            "Delete Employee"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};