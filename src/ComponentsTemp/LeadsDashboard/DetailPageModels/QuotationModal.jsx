import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const QuotationModal = ({ isOpen, onClose, lead, onSuccess }) => {
    const modalRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [amount, setAmount] = useState('');

    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, onClose]);

    const handleSend = async () => {
        if (!amount) return toast.warning("Please enter a quotation amount.");
        if (!lead || !lead.id) return;

        setIsSaving(true);
        const loadingNode = toast.loading("Sending quotation...");

        try {
            // Build payload with amount from input and automatically generated current ISO date
            const payload = {
                amount: amount.toString(),
                date: new Date().toISOString()
            };

            const res = await axios.post(
                `https://testingbb.trimworldwide.com/api/v1/leads/${lead.id}/quotation`, 
                payload, 
                getAuthConfig()
            );

            if (res.data?.success || res.status === 200 || res.status === 201) {
                toast.update(loadingNode, { 
                    render: "Quotation sent successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); 
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { 
                render: error.response?.data?.message || "Failed to send quotation.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[420px] rounded-[12px] shadow-2xl flex flex-col font-sans animate-fadeIn p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[22px] font-bold text-[#2d3748]">
                        Send Quotation
                    </h2>
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-2 mb-8">
                    <label className="text-[15px] font-medium text-[#4a5568]">
                        Quotation Amount
                    </label>
                    <input 
                        type="text" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isSaving}
                        placeholder="e.g. $3,20,000"
                        className="w-full h-[46px] border border-[#e2e8f0] bg-white rounded-[8px] px-4 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors disabled:opacity-50 disabled:bg-gray-50"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-4 mt-2">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="px-4 py-2 text-[#4a5568] text-[15px] font-medium hover:text-gray-900 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSend} 
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-[#86644c] text-white text-[15px] font-medium rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                    >
                        {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};