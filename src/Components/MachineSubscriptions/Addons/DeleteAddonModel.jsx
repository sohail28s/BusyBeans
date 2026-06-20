import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../../utils/orderUtils';

export const DeleteAddonModal = ({ isOpen, onClose, addonData, onSuccess }) => {
    const modalRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                if (!isDeleting) onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, onClose, isDeleting]);

    // --- Handle Delete Action ---
    const handleDelete = async () => {
        if (!addonData || !addonData.id) return;
        
        setIsDeleting(true);
        const loadingId = toast.loading("Deleting addon...");

        try {
            const response = await axios.delete(
                `https://testingbb.trimworldwide.com/api/v1/subscription/addons/${addonData.id}`, 
                getAuthConfig()
            );
            
            // Check for success based on typical API responses
            if (response.data?.success || response.data?.status === 'success' || response.status === 200 || response.status === 204) {
                toast.update(loadingId, { 
                    render: "Addon deleted successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); // Re-fetch the table data
                onClose(); // Close the modal
            } else {
                throw new Error(response.data?.message || "Failed to delete addon.");
            }
        } catch (error) {
            toast.update(loadingId, { 
                render: error.response?.data?.message || error.message || "An error occurred while deleting.", 
                type: "error", 
                isLoading: false, 
                autoClose: 4000 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[500px] rounded-[8px] shadow-xl flex flex-col font-sans animate-scaleIn relative overflow-hidden"
            >
                {/* Close Button (X) */}
                <button 
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="pt-8 pb-4 flex justify-center items-center">
                    <h2 className="text-[22px] font-bold text-[#374151]">
                        Delete Addon
                    </h2>
                </div>

                {/* Body Content */}
                <div className="px-10 pb-6 text-center">
                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                        Are you sure you want to delete this addon? This action cannot be undone.
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="px-10 pb-8 flex items-center justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting}
                        className="h-[44px] px-8 text-[#86644c] font-medium bg-white border border-[#86644c] rounded-[6px] hover:bg-[#fef7e8] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        className="h-[44px] px-10 bg-[#ef4444] text-white font-medium rounded-[6px] hover:bg-[#dc2626] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                        {isDeleting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};