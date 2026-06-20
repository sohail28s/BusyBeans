import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../../utils/orderUtils';

export const EditAddonModal = ({ isOpen, onClose, addonData, onSuccess }) => {
    const modalRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        if (addonData && isOpen) {
            setFormData({
                name: addonData.name || '',
                description: addonData.description || '',
                price: addonData.price || ''
            });
        }
    }, [addonData, isOpen]);

    // Handle Outside Clicks
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                if (!isSubmitting) onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, onClose, isSubmitting]);

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Form Submission (PATCH Request)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name.trim() || !formData.price) {
            toast.error("Name and Price are required fields.");
            return;
        }

        if (!addonData?.id) {
            toast.error("Error: Addon ID is missing.");
            return;
        }

        setIsSubmitting(true);
        const loadingId = toast.loading("Updating addon...");

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price)
            };

            const response = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/subscription/addons/${addonData.id}`,
                payload,
                getAuthConfig()
            );

            if (response.data?.success || response.status === 200) {
                toast.update(loadingId, { 
                    render: "Addon updated successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); // Re-fetch the table data
                onClose(); // Close the modal
            } else {
                throw new Error(response.data?.message || "Failed to update addon.");
            }
        } catch (error) {
            toast.update(loadingId, { 
                render: error.response?.data?.message || error.message || "An error occurred while updating.", 
                type: "error", 
                isLoading: false, 
                autoClose: 4000 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[550px] rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn"
            >
                {/* Close Button (X) */}
                <button 
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="pt-8 pb-6 flex justify-center items-center">
                    <h2 className="text-[22px] font-bold text-[#374151]">
                        Edit Addon
                    </h2>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-6">
                    
                    {/* Name Input */}
                    <div>
                        <label className="block text-[14px] text-[#4b5563] mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter addon name"
                            className="w-full h-[45px] px-4 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-shadow text-[15px]  bg-white text-gray-800"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label className="block text-[14px] text-[#4b5563] mb-2">
                            Description
                        </label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                            className="w-full p-4 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-shadow resize-none h-[120px] text-[15px]  bg-white text-gray-800"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className="block text-[14px] text-[#4b5563] mb-2">
                            Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[15px]">$</span>
                            <input 
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full h-[45px] pl-8 pr-4 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-shadow text-[15px]  bg-white text-gray-800 appearance-none"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-4 mt-4">
                        <button 
                            type="button"
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="h-[45px] px-8 text-[#86644c] font-medium bg-white border border-[#86644c] rounded-[6px] hover:bg-[#fef7e8] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="h-[45px] px-8 bg-[#86644c] text-white font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Update"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};