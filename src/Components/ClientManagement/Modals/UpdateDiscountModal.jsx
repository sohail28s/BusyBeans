import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const UpdateDiscountModal = ({ isOpen, onClose, customerId, initialDiscounts = [] }) => {
    const [categories, setCategories] = useState([]);
    const [discounts, setDiscounts] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const modalRef = useRef(null);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Fetch Categories and map existing discounts
    useEffect(() => {
        if (!isOpen) return;

        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/category-management/category-list/all', getAuthConfig());
                if (res.data?.status === 'success' && res.data?.data?.data?.length > 0) {
                    setCategories(res.data.data.data);
                } else {
                    throw new Error("No categories found");
                }
            } catch (error) {
            
                setCategories([
                    { id: 9, name: "Wild category" },
                    { id: 17, name: "Flavor Syrups- 1 bottle" },
                    { id: 3, name: "Drip coffee Machines" },
                    { id: 4, name: "Coffee Beans - Whole Bean" },
                    { id: 5, name: "Single Serve Beverage Pod- Box of 12" },
                    { id: 6, name: "Soluble" },
                    { id: 7, name: "Espresso Machines" },
                    { id: 8, name: "Condiments" },
                    { id: 10, name: "Coffee Beans- ground" },
                ]);
            } finally {
                // Map existing discounts into state
                const initialDiscountState = {};
                initialDiscounts.forEach(d => {
                    if (d.categoryId && d.percentage) {
                        initialDiscountState[d.categoryId] = String(d.percentage);
                    }
                });
                setDiscounts(initialDiscountState);
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [isOpen, initialDiscounts]);

    const handleDiscountChange = (categoryId, value) => {
        // Strictly allow ONLY numbers (remove any non-numeric characters)
        const numericValue = value.replace(/\D/g, '');
        
        setDiscounts(prev => ({
            ...prev,
            [categoryId]: numericValue
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const savingToast = toast.loading("Saving user discounts...");

        try {
            // Format the exact payload required: {"userDiscount":[{"categoryId":9,"percentage":3}]}
            const formattedDiscounts = Object.entries(discounts)
                .filter(([_, percentage]) => percentage !== "" && percentage !== null)
                .map(([categoryId, percentage]) => ({
                    categoryId: parseInt(categoryId),
                    percentage: parseInt(percentage)
                }));

            const payload = { userDiscount: formattedDiscounts };

            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/customer-update/${customerId}`, payload, getAuthConfig());

            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(savingToast, { render: "Discounts updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
                onClose(); // Close modal on success
            }
        } catch (error) {
            console.error("Save Discount Error:", error);
            toast.update(savingToast, { render: error.response?.data?.message || "Failed to update discounts.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[750px] max-h-[90vh] rounded-[8px] shadow-2xl flex flex-col font-sans animate-fadeIn"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
                    <h2 className="text-[18px] font-bold text-black">Update User Discount by Category</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <h3 className="text-[14px] font-medium text-gray-700 mb-4">User Discounts</h3>
                    
                    <div className="border border-[#e2e8f0] rounded-[6px] p-1">
                        {/* Grid Headers */}
                        <div className="grid grid-cols-[1fr,1fr] gap-4 px-4 py-2 bg-white">
                            <span className="text-[12px] font-semibold text-[#6b7280]">Category</span>
                            <span className="text-[12px] font-semibold text-[#6b7280]">Discount %</span>
                        </div>

                        {/* Grid Rows */}
                        <div className="flex flex-col gap-2 p-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-400 text-[14px] italic">Loading categories...</div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="grid grid-cols-[1fr,1fr] gap-4 items-center">
                                        {/* Read-only Category Box matching layout */}
                                        <div className="h-[42px] px-4 flex items-center bg-[#f9fafb] border border-[#e2e8f0] rounded-[4px] text-[14px] text-gray-800">
                                            {cat.name}
                                        </div>
                                        {/* Strictly Numeric Input */}
                                        <input 
                                            type="text" 
                                            value={discounts[cat.id] || ''}
                                            onChange={(e) => handleDiscountChange(cat.id, e.target.value)}
                                            placeholder={`Enter % for ${cat.name}`}
                                            className="h-[42px] px-4 bg-white border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-[#86644c] text-[14px] text-gray-800 placeholder-gray-400 transition-colors"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-5 border-t border-[#e2e8f0] flex items-center justify-end gap-4 bg-[#f9fafb] rounded-b-[8px]">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="h-[42px] px-8 border border-[#d1d5db] text-[#374151] text-[14px] font-medium rounded-[4px] hover:bg-gray-100 transition-colors bg-white disabled:opacity-50       "
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || isLoading}
                        className="h-[42px] px-8 bg-[#86644c] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>

            </div>
        </div>
    );
};