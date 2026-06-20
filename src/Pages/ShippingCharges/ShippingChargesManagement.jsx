import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';

export const ShippingChargesManagement = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
        const setShowProfile = useStore((state) => state.setShowProfile);
        const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [shippingRanges, setShippingRanges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- Fetch Data ---
    const fetchShippingCharges = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/shipping-charges-list', getAuthConfig());
            if (res.data?.status === 'success') {
                // Sort by weightFrom to ensure correct sequential order for editing
                const sortedData = (res.data.data.data || []).sort((a, b) => a.weightFrom - b.weightFrom);
                setShippingRanges(sortedData);
            } else {
                toast.error("Failed to fetch shipping charges.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching shipping charges.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchShippingCharges();
    }, []);

    // --- Top Navbar ---
    useEffect(() => {
        setTitle('Shipping Charges Management');
        setShowProfile(false);
        setActions(null); 
        return () => setTitle('');setShowProfile(true);
    }, [setTitle, setActions , setShowProfile]);

    // --- Handlers ---

    const handleInputChange = (id, field, value) => {
        setShippingRanges(prev => prev.map(range => {
            if (range.id === id) {
                return { ...range, [field]: value };
            }
            return range;
        }));
    };

    const handleAddRow = () => {
        setShippingRanges(prev => {
            let nextMinRange = 0;
            if (prev.length > 0) {
                // Find the maximum weightTo in the current array to set the next minimum safely
                const maxCurrentWeightTo = Math.max(...prev.map(r => Number(r.weightTo) || 0));
                nextMinRange = maxCurrentWeightTo + 1;
            }

            const newRow = {
                id: `new-${Date.now()}`, // Temporary local ID
                company: "FedEx Ground E", // Default company based on payload structure
                weightFrom: nextMinRange,
                weightTo: '',
                charges: ''
            };
            return [...prev, newRow];
        });
    };

    const handleDeleteRow = (idToDelete) => {
        setShippingRanges(prev => prev.filter(range => range.id !== idToDelete));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const loadingId = toast.loading("Saving shipping charges...");

        try {
            // 1. Format payload exactly as requested
            // Ensure numbers are numbers and charges are strings (based on example payload)
            const payloadRanges = shippingRanges.map(range => ({
                company: range.company || "FedEx Ground E",
                weightFrom: Number(range.weightFrom),
                weightTo: Number(range.weightTo),
                charges: String(range.charges)
            }));

            const payload = { ranges: payloadRanges };

            // 2. Send PATCH request
            const res = await axios.patch(
                'https://testingbb.trimworldwide.com/api/v1/admin/shipping-charges-update',
                payload,
                getAuthConfig()
            );

            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Shipping charges updated successfully!", type: "success", isLoading: false, autoClose: 2000 });
                // Re-fetch to get real IDs from the server for any newly added rows
                fetchShippingCharges(); 
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.update(loadingId, { render: error.response?.data?.message || "Error saving shipping charges.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-80px)] justify-start bg-white font-sans p-6 md:p-8">
            <div className=" mx-auto w-full flex flex-col">
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 text-gray-500 italic">
                        Loading shipping tiers...
                    </div>
                ) : (
                    <>
                        {/* Headers */}
                        <div className="grid grid-cols-4 gap-6 mb-4 px-2 border-b border-gray-100 pb-3">
                            <div className="text-[15px] font-bold text-[#4b5563]">Min Range</div>
                            <div className="text-[15px] font-bold text-[#4b5563]">Max Range</div>
                            <div className="text-[15px] font-bold text-[#4b5563]">Charges($)</div>
                            <div className="text-[15px] font-bold text-[#4b5563]">Action</div>
                        </div>

                        {/* Rows */}
                        <div className="flex flex-col gap-3">
                            {shippingRanges.map((range) => (
                                <div key={range.id} className="grid grid-cols-4 gap-6 items-center">
                                    
                                    {/* Min Range (Read-Only) */}
                                    <div>
                                        <input 
                                            type="number"
                                            value={range.weightFrom}
                                            readOnly
                                            className="w-full h-[45px] px-4 bg-gray-50 border border-gray-200 rounded-[6px] text-[#374151] cursor-not-allowed outline-none"
                                        />
                                    </div>

                                    {/* Max Range (Editable) */}
                                    <div>
                                        <input 
                                            type="number"
                                            value={range.weightTo}
                                            onChange={(e) => handleInputChange(range.id, 'weightTo', e.target.value)}
                                            placeholder="Max"
                                            className="w-full h-[45px] px-4 bg-white border border-gray-200 rounded-[6px] text-[#374151] focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Charges (Editable) */}
                                    <div>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={range.charges}
                                            onChange={(e) => handleInputChange(range.id, 'charges', e.target.value)}
                                            placeholder="Charge amount"
                                            className="w-full h-[45px] px-4 bg-white border border-gray-200 rounded-[6px] text-[#374151] focus:border-black focus:ring-1 
                                            focus:ring-black outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Delete Action (Local only until Save) */}
                                    <div>
                                        <button 
                                            onClick={() => handleDeleteRow(range.id)}
                                            className="text-red-600 font-semibold border border-red-600 w-20"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    
                                </div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                            <button 
                                onClick={handleAddRow}
                                disabled={isSaving}
                                className="h-[45px] px-6 bg-[#8C6D4F] text-white font-medium rounded-[6px] hover:bg-[#7a5e42] transition-colors disabled:opacity-50"
                            >
                                Add More Charges
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-[45px] px-10 bg-[#8C6D4F] text-white font-medium rounded-[6px] hover:bg-[#7a5e42] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                            >
                                {isSaving ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default ShippingChargesManagement;