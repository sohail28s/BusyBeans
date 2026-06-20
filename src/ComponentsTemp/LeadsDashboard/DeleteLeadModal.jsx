import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const DeleteLeadModal = ({ isOpen, onClose, lead, onSuccess }) => {
    const modalRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleDelete = async () => {
        if (!lead || !lead.id) return;

        setIsDeleting(true);
        const loadingNode = toast.loading("Deleting lead...");

        try {
            const res = await axios.delete(`https://testingbb.trimworldwide.com/api/v1/leads/${lead.id}`, getAuthConfig());

            if (res.data?.success || res.status === 200 || res.status === 204) {
                toast.update(loadingNode, { 
                    render: "Lead deleted successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); // Trigger re-fetch on the dashboard
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { 
                render: error.response?.data?.message || "Failed to delete lead.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white w-full max-w-[400px] rounded-[6px] shadow-2xl flex flex-col font-sans animate-fadeIn">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0]">
                    <h2 className="text-[20px] font-bold text-[#1f2937] tracking-wide">Confirm Delete</h2>
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 flex flex-col gap-6">
                    <p className="text-[16px] text-gray-700 leading-relaxed">
                        Are you sure you want to delete this lead for <strong className="text-black font-semibold">{lead.company || lead.machineName || 'this customer'}</strong>? This action cannot be undone.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#e2e8f0] flex items-center justify-end gap-3 bg-[#f9fafb] rounded-b-[6px]">
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting}
                        className="h-[36px] px-4 bg-white border border-[#e2e8f0] text-[#4b5563] text-[14px] font-medium rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        className="h-[36px] px-4 bg-[#ef4444] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#dc2626] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[74px]"
                    >
                        {isDeleting ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};