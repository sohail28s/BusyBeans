import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
const MODAL_CONFIG = {
    followUp: {
        title: 'Schedule Follow-up',
        dateLabel: 'Follow-up Date',
        notesLabel: 'Feedback/Notes',
        notesPlaceholder: 'Add notes or feedback...',
        endpoint: 'follow-up',
        successMsg: 'Follow-up scheduled successfully!'
    },
    siteVisit: {
        title: 'Schedule Site Visit',
        dateLabel: 'Visit Date',
        notesLabel: 'Location Notes',
        notesPlaceholder: 'Add location details or entry instructions...',
        endpoint: 'site-visit',
        successMsg: 'Site visit scheduled successfully!'
    }
};

export const ScheduleModal = ({ isOpen, onClose, lead, onSuccess, type }) => {
    const modalRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    
    const activeConfig = MODAL_CONFIG[type] || MODAL_CONFIG.followUp;

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setDate('');
            setNotes('');
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

    const handleSchedule = async () => {
        if (!date) return toast.warning(`Please select a ${activeConfig.dateLabel.toLowerCase()}.`);
        if (!lead || !lead.id) return;

        setIsSaving(true);
        const loadingNode = toast.loading(`Scheduling ${type === 'followUp' ? 'follow-up' : 'site visit'}...`);
        
        try {
            const payload = {
                date: new Date(date).toISOString(), // Ensure proper ISO format for API
                notes: notes
            };
            const res = await axios.post(
                `https://testingbb.trimworldwide.com/api/v1/leads/${lead.id}/${activeConfig.endpoint}`,
                payload,
                getAuthConfig()
            );

            if (res.data?.success || res.status === 200 || res.status === 201) {
                toast.update(loadingNode, { render: activeConfig.successMsg, type: "success", isLoading: false, autoClose: 3000 });
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { render: error.response?.data?.message || `Failed to schedule.`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[420px] rounded-lg shadow-2xl flex flex-col font-sans animate-fadeIn p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[22px] font-bold text-[#1f2937]">
                        {activeConfig.title}
                    </h2>
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-6">
                    {/* Date Input */}
                    <div className="flex flex-col">
                        <label className="text-[15px] font-medium text-[#374151] mb-2 block">
                            {activeConfig.dateLabel}
                        </label>
                        <div className="relative">
                            <input 
                                type="datetime-local" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                disabled={isSaving}
                                // Ensuring the picker background defaults to white on supported browsers
                                className="w-full h-[46px] bg-white border border-gray-200 rounded-[6px] px-3 text-[14px] text-gray-700 outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-all disabled:opacity-50 disabled:bg-gray-50 cursor-pointer appearance-none color-scheme-light"
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                    </div>

                    {/* Feedback / Notes Textarea */}
                    <div className="flex flex-col">
                        <label className="text-[15px] font-medium text-[#374151] mb-2 block">
                            {activeConfig.notesLabel}
                        </label>
                        <textarea 
                            rows="4" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            disabled={isSaving}
                            placeholder={activeConfig.notesPlaceholder}
                            className="w-full bg-white border border-gray-200 rounded-[6px] p-3 text-[14px] text-gray-700 placeholder-gray-400 resize-none outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-all disabled:opacity-50 disabled:bg-gray-50"
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-4 mt-8">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="px-4 py-2 text-[#4b5563] text-[15px] font-medium hover:text-gray-900 transition-colors disabled:opacity-50 outline-none"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSchedule} 
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#86644c] text-white text-[15px] font-medium rounded-lg hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[110px] outline-none"
                    >
                        {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Schedule'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};