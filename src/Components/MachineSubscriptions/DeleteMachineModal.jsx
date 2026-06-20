import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = "https://testingbb.trimworldwide.com/api/v1/admin/coffee-machine";

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const DeleteMachineModal = ({ isOpen, onClose, machineId, onSuccess }) => {
    const modalRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Handle Outside Clicks ---
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
    const handleDelete = async (e) => {
        e.preventDefault(); // Prevent default form submission reload
        if (!machineId) return;
        
        setIsDeleting(true);
        const loadingId = toast.loading("Deleting machine...");

        try {
            const response = await axios.delete(`${API_URL}/${machineId}`, getAuthConfig());
            
            if (response.data?.status === 'success' || response.status === 200 || response.status === 204) {
                toast.update(loadingId, { 
                    render: "Machine deleted successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); // Re-fetch the grid data
                onClose(); // Close the modal
            } else {
                throw new Error(response.data?.message || "Failed to delete machine.");
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
                className="bg-white w-full max-w-[600px] rounded-[6px] shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] flex flex-col font-nunito relative animate-fadeIn"
            >
                {/* Header */}
                <div className="flex items-center p-6 border-b border-[#e5e7eb] h-[80px] shrink-0">
                    <div className="flex-1 text-center text-[24px] font-bold text-[#374151] leading-8">
                        Delete Machine
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        disabled={isDeleting}
                        className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center text-[#374151] hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
                            <path d="M 8.01186 7.00933 L 12.27 2.75116 C 12.341 2.68501 12.398 2.60524 12.4375 2.51661 C 12.4769 2.42798 12.4982 2.3323 12.4999 2.23529 C 12.5016 2.13827 12.4838 2.0419 12.4474 1.95194 C 12.4111 1.86197 12.357 1.78024 12.2884 1.71163 C 12.2198 1.64302 12.138 1.58893 12.0481 1.55259 C 11.9581 1.51625 11.8617 1.4984 11.7647 1.50011 C 11.6677 1.50182 11.572 1.52306 11.4834 1.56255 C 11.3948 1.60204 11.315 1.65898 11.2488 1.72997 L 6.99067 5.98814 L 2.7325 1.72997 C 2.59553 1.60234 2.41437 1.53286 2.22718 1.53616 C 2.03999 1.53946 1.8614 1.61529 1.72901 1.74767 C 1.59663 1.88006 1.5208 2.05865 1.5175 2.24584 C 1.5142 2.43303 1.58368 2.61419 1.71131 2.75116 L 5.96948 7.00933 L 1.71131 11.2675 C 1.576 11.403 1.5 11.5866 1.5 11.7781 C 1.5 11.9696 1.576 12.1532 1.71131 12.2887 C 1.84679 12.424 2.03043 12.5 2.2219 12.5 C 2.41338 12.5 2.59702 12.424 2.7325 12.2887 L 6.99067 8.03052 L 11.2488 12.2887 C 11.3843 12.424 11.568 12.5 11.7594 12.5 C 11.9509 12.5 12.1346 12.424 12.27 12.2887 C 12.4053 12.1532 12.4813 11.9696 12.4813 11.7781 C 12.4813 11.5866 12.4053 11.403 12.27 11.2675 L 8.01186 7.00933 Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                {/* Form & Content */}
                <div className="p-6 md:px-8">
                    <form onSubmit={handleDelete} className="flex flex-col">
                        
                        <p className="flex items-center justify-center min-h-[200px] text-[18px] font-semibold text-[#4b5563] text-center m-0">
                            Are you sure you want to delete this machine?
                        </p>
                        
                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 mt-4 pt-2">
                            <button 
                                type="button" 
                                onClick={onClose}
                                disabled={isDeleting}
                                className="h-[49px] px-6 text-[#86644c] font-bold border border-[#86644c] rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isDeleting}
                                className="h-[49px] px-10 bg-[#86644c] text-white font-bold rounded-[8px] hover:bg-[#735541] transition-colors min-w-[128px] flex items-center justify-center disabled:opacity-50"
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
                        
                    </form>
                </div>
            </div>
        </div>
    );
};