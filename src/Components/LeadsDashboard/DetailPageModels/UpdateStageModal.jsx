import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const STAGES = [
    'New Enquiry', 
    'Contacted', 
    'Quoted', 
    'Demo/Scheduled', 
    'Negotiation', 
    'Nurture', 
    'WON'
];

export const UpdateStageModal = ({ isOpen, onClose, lead, onSuccess }) => {
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Form State
    const [selectedStage, setSelectedStage] = useState('');
    const [note, setNote] = useState('');

    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && lead) {
            setSelectedStage(lead.status || 'New Enquiry');
            setNote('');
            setIsDropdownOpen(false);
        }
    }, [isOpen, lead]);

    // Handle clicking outside to close modal or dropdown
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            } else if (!isDropdownOpen && modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, onClose, isDropdownOpen]);

    const handleUpdate = async () => {
        if (!selectedStage) return toast.warning("Please select a stage.");
        if (!lead || !lead.id) return;

        setIsSaving(true);
        const loadingNode = toast.loading("Updating pipeline stage...");

        try {
            const payload = {
                status: selectedStage,
                stageNote: note
            };

            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/leads/${lead.id}`, 
                payload, 
                getAuthConfig()
            );

            if (res.data?.success || res.status === 200 || res.status === 201) {
                toast.update(loadingNode, { 
                    render: "Stage updated successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); 
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { 
                render: error.response?.data?.message || "Failed to update stage.", 
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
                className="bg-white w-full max-w-[400px] rounded-[6px] shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] flex flex-col font-sans animate-fadeIn"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0 mb-6">
                    <div className="text-[20px] font-bold text-[#374151] leading-[30px]">
                        Update Pipeline Stage
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {/* Exact SVG from your HTML */}
                        <svg className="w-4 h-4 text-[#374151]" viewBox="0 0 14 14" fill="none">
                            <path d="M 8.01186 7.00933 L 12.27 2.75116 C 12.341 2.68501 12.398 2.60524 12.4375 2.51661 C 12.4769 2.42798 12.4982 2.3323 12.4999 2.23529 C 12.5016 2.13827 12.4838 2.0419 12.4474 1.95194 C 12.4111 1.86197 12.357 1.78024 12.2884 1.71163 C 12.2198 1.64302 12.138 1.58893 12.0481 1.55259 C 11.9581 1.51625 11.8617 1.4984 11.7647 1.50011 C 11.6677 1.50182 11.572 1.52306 11.4834 1.56255 C 11.3948 1.60204 11.315 1.65898 11.2488 1.72997 L 6.99067 5.98814 L 2.7325 1.72997 C 2.59553 1.60234 2.41437 1.53286 2.22718 1.53616 C 2.03999 1.53946 1.8614 1.61529 1.72901 1.74767 C 1.59663 1.88006 1.5208 2.05865 1.5175 2.24584 C 1.5142 2.43303 1.58368 2.61419 1.71131 2.75116 L 5.96948 7.00933 L 1.71131 11.2675 C 1.576 11.403 1.5 11.5866 1.5 11.7781 C 1.5 11.9696 1.576 12.1532 1.71131 12.2887 C 1.84679 12.424 2.03043 12.5 2.2219 12.5 C 2.41338 12.5 2.59702 12.424 2.7325 12.2887 L 6.99067 8.03052 L 11.2488 12.2887 C 11.3843 12.424 11.568 12.5 11.7594 12.5 C 11.9509 12.5 12.1346 12.424 12.27 12.2887 C 12.4053 12.1532 12.4813 11.9696 12.4813 11.7781 C 12.4813 11.5866 12.4053 11.403 12.27 11.2675 L 8.01186 7.00933 Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 flex flex-col gap-4">
                    
                    {/* Select Stage Dropdown */}
                    <div className="flex flex-col relative" ref={dropdownRef}>
                        <label className="text-[14px] font-medium text-[#374151] mb-2 block leading-[20px]">
                            Select New Stage
                        </label>
                        <div 
                            onClick={() => !isSaving && setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-between h-[43px] px-4 border border-[#e2e8f0] rounded-[6px] cursor-pointer hover:border-gray-300 transition-colors bg-white"
                        >
                            <span className="text-[16px] text-[#333] truncate">
                                {selectedStage || 'Choose stage...'}
                            </span>
                            <div className="flex items-center">
                                <span className="w-[1px] h-5 bg-[#e2e8f0] mx-2"></span>
                                <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                    {/* Exact SVG from your HTML */}
                                    <svg className="w-5 h-5 text-[#d3d3d3]" viewBox="0 0 20 20" fill="none">
                                        <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" fill="currentColor"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Dropdown Options */}
                        {isDropdownOpen && (
                            <div className="absolute top-[72px] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                {STAGES.map((stage) => (
                                    <div 
                                        key={stage} 
                                        onClick={() => {
                                            setSelectedStage(stage);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`px-4 py-2 text-[16px] cursor-pointer transition-colors ${
                                            selectedStage === stage ? 'bg-[#eff6ff] text-[#2563eb] font-medium' : 'text-[#333] hover:bg-gray-50'
                                        }`}
                                    >
                                        {stage}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Textarea */}
                    <div className="flex flex-col mt-2">
                        <label className="text-[14px] font-medium text-[#374151] mb-1 block leading-[20px]">
                            Note (Optional)
                        </label>
                        <textarea 
                            rows="3"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={isSaving}
                            placeholder="Add a note about this stage update..."
                            className="w-full h-[89px] border border-[#e2e8f0] rounded-[8px] p-2 text-[16px] text-[#4b5563] placeholder-gray-400 resize-none focus:outline-none focus:border-[#86644c] transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button 
                            onClick={onClose} 
                            disabled={isSaving}
                            className="h-[36px] px-4 text-[#4b5563] text-[14px] bg-transparent font-medium rounded-[8px] hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleUpdate} 
                            disabled={isSaving}
                            className="h-[36px] px-4 bg-[#86644c] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[76px]"
                        >
                            {isSaving ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Update'
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};