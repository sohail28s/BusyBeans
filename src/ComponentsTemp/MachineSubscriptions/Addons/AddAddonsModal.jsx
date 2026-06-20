import React, { useRef, useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { getAuthConfig } from '../../../utils/orderUtils'; 

export const AddAddonsModal = ({ isOpen, onClose, onSuccess }) => { 
    const modalRef = useRef(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    const [addonsList, setAddonsList] = useState([ 
        { id: crypto.randomUUID(), name: '', description: '', price: '' } 
    ]); 

    useEffect(() => { 
        if (isOpen) { 
            setAddonsList([{ id: crypto.randomUUID(), name: '', description: '', price: '' }]); 
        } 
    }, [isOpen]); 

    useEffect(() => { 
        const handleOutsideClick = (e) => { 
            if (modalRef.current && !modalRef.current.contains(e.target)) { 
                if (!isSubmitting) onClose(); 
            } 
        }; 
        if (isOpen) document.addEventListener('mousedown', handleOutsideClick); 
        return () => document.removeEventListener('mousedown', handleOutsideClick); 
    }, [isOpen, onClose, isSubmitting]); 

    // --- Dynamic Form Handlers --- 
    const handleAddAnother = () => { 
        setAddonsList(prev => [ 
            ...prev, 
            { id: crypto.randomUUID(), name: '', description: '', price: '' } 
        ]); 
    }; 

    const handleRemoveAddon = (idToRemove) => { 
        setAddonsList(prev => prev.filter(addon => addon.id !== idToRemove)); 
    }; 

    const handleChange = (id, field, value) => { 
        setAddonsList(prev => prev.map(addon => 
            addon.id === id ? { ...addon, [field]: value } : addon 
        )); 
    }; 

    // --- Submit Logic --- 
    const handleSubmit = async (e) => { 
        e.preventDefault(); // Prevent standard form submit if triggered by enter key
        
        // 1. Validation: Check if any form is empty (Name and Price are required) 
        for (let i = 0; i < addonsList.length; i++) { 
            const addon = addonsList[i]; 
            if (!addon.name.trim() || !addon.price.trim()) { 
                toast.error(`Addon ${i + 1} has missing required fields (Name or Price). Please fill them or remove the form.`); 
                return; // Stop submission 
            } 
        } 
        
        setIsSubmitting(true); 
        const loadingId = toast.loading("Adding addons..."); 
        
        try { 
            const payload = addonsList.map(addon => ({ 
                name: addon.name.trim(), 
                description: addon.description.trim(), 
                price: parseFloat(addon.price).toFixed(2) 
            })); 
            
            // 3. API Call 
            const response = await axios.post( 
                `https://testingbb.trimworldwide.com/api/v1/subscription/addons`, 
                payload, 
                getAuthConfig() 
            ); 
            
            // 4. Success Handling 
            if (response.data?.success || response.status === 200 || response.status === 201) { 
                toast.update(loadingId, { render: "Addons added successfully!", type: "success", isLoading: false, autoClose: 3000 }); 
                if (onSuccess) onSuccess(); // Re-fetch table data 
                onClose(); // Close modal 
            } else { 
                throw new Error(response.data?.message || "Failed to add addons."); 
            } 
        } catch (error) { 
            toast.update(loadingId, { render: error.response?.data?.message || error.message || "An error occurred while adding.", type: "error", isLoading: false, autoClose: 4000 }); 
        } finally { 
            setIsSubmitting(false); 
        } 
    }; 

    if (!isOpen) return null; 

    return ( 
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"> 
            
            <style>{`
                input[type='number']::-webkit-inner-spin-button,
                input[type='number']::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type='number'] {
                    -moz-appearance: textfield;
                }
            `}</style>

            <div 
                ref={modalRef} 
                className="bg-white w-[90%] md:w-[700px] max-h-[90vh] rounded-xl shadow-xl flex flex-col font-sans animate-fadeIn relative" 
            > 
                {/* Header */} 
                <div className="p-6 border-b border-gray-200 flex items-center justify-center relative shrink-0"> 
                    <h2 className="text-2xl font-bold text-gray-900 text-center"> 
                        Add Addons 
                    </h2> 
                    <button 
                        onClick={onClose} 
                        disabled={isSubmitting} 
                        className="absolute right-6 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 outline-none" 
                    > 
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"> 
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> 
                        </svg> 
                    </button> 
                </div> 

                {/* Form Body */} 
                <form className="flex flex-col p-6 overflow-hidden"> 
                    
                    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar"> 
                        {addonsList.map((addon, index) => ( 
                            <div key={addon.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 transition-all"> 
                                
                                <div className="flex items-center justify-between mb-2"> 
                                    <h4 className="font-semibold text-gray-700">Addon {index + 1}</h4> 
                                    {addonsList.length > 1 && ( 
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveAddon(addon.id)} 
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" 
                                            title="Remove this addon" 
                                        > 
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
                                            </svg>
                                        </button> 
                                    )} 
                                </div> 

                                <div className="space-y-2"> 
                                    <label className="text-sm font-medium text-gray-700"> Name <span className="text-red-500">*</span> </label> 
                                    <input 
                                        type="text" 
                                        value={addon.name} 
                                        onChange={(e) => handleChange(addon.id, 'name', e.target.value)} 
                                        placeholder="e.g., Advanced Water Filter" 
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] outline-none transition-all" 
                                        disabled={isSubmitting} 
                                    /> 
                                </div> 

                                <div className="space-y-2"> 
                                    <label className="text-sm font-medium text-gray-700"> Description </label> 
                                    <textarea 
                                        value={addon.description} 
                                        onChange={(e) => handleChange(addon.id, 'description', e.target.value)} 
                                        placeholder="e.g., Multi-stage filtration system for the purest coffee taste" 
                                        rows="2"
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] outline-none resize-none transition-all" 
                                        disabled={isSubmitting} 
                                    /> 
                                </div> 

                                <div className="space-y-2"> 
                                    <label className="text-sm font-medium text-gray-700"> Price <span className="text-red-500">*</span> </label> 
                                    <div className="relative"> 
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span> 
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            min="0" 
                                            value={addon.price} 
                                            onChange={(e) => handleChange(addon.id, 'price', e.target.value)} 
                                            placeholder="20.00" 
                                            className="border border-gray-300 rounded-md pl-7 pr-3 py-2 w-full bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] outline-none transition-all appearance-none" 
                                            disabled={isSubmitting} 
                                        /> 
                                    </div> 
                                </div> 

                            </div> 
                        ))} 
                    </div> 

                    {/* Add Another Section */} 
                    <div className="flex justify-between items-center pt-6 mt-2 border-t border-gray-200"> 
                        <button 
                            type="button" 
                            onClick={handleAddAnother} 
                            disabled={isSubmitting} 
                            className="flex items-center gap-2 px-4 py-2 text-[#86644c] border border-[#86644c] rounded-md hover:bg-[#86644c] hover:text-white transition-colors text-sm font-medium disabled:opacity-50 outline-none" 
                        > 
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                                <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                            </svg>
                            Add Another 
                        </button> 
                    </div> 

                    {/* Action Buttons */} 
                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 shrink-0"> 
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting} 
                            className="border border-[#86644c] text-[#86644c] px-6 py-2.5 rounded-lg hover:bg-[#86644c] hover:text-white transition-colors text-sm font-medium disabled:opacity-50 outline-none" 
                        > 
                            Cancel 
                        </button> 
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={isSubmitting} 
                            className="bg-[#86644c] text-white px-10 py-2.5 rounded-lg border border-[#86644c] hover:bg-white hover:text-[#86644c] transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center min-w-[120px] outline-none" 
                        > 
                            {isSubmitting ? ( 
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> 
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> 
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> 
                                </svg> 
                            ) : ( 
                                "Save" 
                            )} 
                        </button> 
                    </div> 
                </form> 
            </div> 
        </div> 
    ); 
};