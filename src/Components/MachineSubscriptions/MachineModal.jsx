import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../utils/orderUtils';
const API_URL = "https://testingbb.trimworldwide.com/api/v1/admin/coffee-machine";
const MACHINE_TYPES = ['Commercial', 'Espresso', 'Drip coffee', 'Other'];
export const MachineModal = ({ isOpen, onClose, machine, onSuccess }) => {
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('Commercial');
    const [tag, setTag] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [uptoEmployees, setUptoEmployees] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const isEditMode = Boolean(machine);


    // Populate data when modal opens
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(machine.name || '');
                setType(machine.type || 'Commercial');
                setTag(machine.tag || '');
                setDesc(machine.desc || '');
                setPrice(machine.price || '');
                setUptoEmployees(machine.uptoEmployees || '');
                setImagePreview(machine.image ? `https://testingbb.trimworldwide.com/${machine.image}` : '');
                setImageFile(null);
            } else {
                // Reset for Add Mode
                setName('');
                setType('Commercial');
                setTag('');
                setDesc('');
                setPrice('');
                setUptoEmployees('');
                setImagePreview('');
                setImageFile(null);
            }
        }
    }, [isOpen, machine, isEditMode]);

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

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle Submit (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !type || !tag || !price) {
            return toast.warning("Please fill in all required fields.");
        }

        setIsSaving(true);
        const loadingNode = toast.loading(isEditMode ? "Updating machine..." : "Adding new machine...");

        try {
            // Build multipart/form-data payload
            const formData = new FormData();
            formData.append('name', name);
            formData.append('type', type);
            formData.append('tag', tag);
            formData.append('desc', desc);
            formData.append('price', price);
            formData.append('uptoEmployees', uptoEmployees);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }

            let res;
            if (isEditMode) {
                // Edit Request
                res = await axios.patch(`${API_URL}/${machine.id}`, formData, getAuthConfig());
            } else {
                // Add Request
                res = await axios.post(API_URL, formData, getAuthConfig());
            }

            if (res.data?.status === 'success' || res.status === 200 || res.status === 201) {
                toast.update(loadingNode, { 
                    render: isEditMode ? "Machine updated successfully!" : "Machine added successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                if (onSuccess) onSuccess(); 
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { 
                render: error.response?.data?.message || "Failed to save machine.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[600px] rounded-[6px] shadow-2xl flex flex-col font-nunito max-h-[90vh] overflow-hidden animate-fadeIn"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-[#e5e7eb] shrink-0">
                    <h2 className="text-[20px] font-bold text-[#374151]">
                        {isEditMode ? 'Edit Coffee Machine' : 'Add New Coffee Machine'}
                    </h2>
                    <button 
                        type="button"
                        onClick={onClose} 
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 text-[#374151]" viewBox="0 0 14 14" fill="none">
                            <path d="M 8.01186 7.00933 L 12.27 2.75116 C 12.341 2.68501 12.398 2.60524 12.4375 2.51661 C 12.4769 2.42798 12.4982 2.3323 12.4999 2.23529 C 12.5016 2.13827 12.4838 2.0419 12.4474 1.95194 C 12.4111 1.86197 12.357 1.78024 12.2884 1.71163 C 12.2198 1.64302 12.138 1.58893 12.0481 1.55259 C 11.9581 1.51625 11.8617 1.4984 11.7647 1.50011 C 11.6677 1.50182 11.572 1.52306 11.4834 1.56255 C 11.3948 1.60204 11.315 1.65898 11.2488 1.72997 L 6.99067 5.98814 L 2.7325 1.72997 C 2.59553 1.60234 2.41437 1.53286 2.22718 1.53616 C 2.03999 1.53946 1.8614 1.61529 1.72901 1.74767 C 1.59663 1.88006 1.5208 2.05865 1.5175 2.24584 C 1.5142 2.43303 1.58368 2.61419 1.71131 2.75116 L 5.96948 7.00933 L 1.71131 11.2675 C 1.576 11.403 1.5 11.5866 1.5 11.7781 C 1.5 11.9696 1.576 12.1532 1.71131 12.2887 C 1.84679 12.424 2.03043 12.5 2.2219 12.5 C 2.41338 12.5 2.59702 12.424 2.7325 12.2887 L 6.99067 8.03052 L 11.2488 12.2887 C 11.3843 12.424 11.568 12.5 11.7594 12.5 C 11.9509 12.5 12.1346 12.424 12.27 12.2887 C 12.4053 12.1532 12.4813 11.9696 12.4813 11.7781 C 12.4813 11.5866 12.4053 11.403 12.27 11.2675 L 8.01186 7.00933 Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
                    
                    {/* Image Upload Button */}
                    <div className="flex justify-center mb-6">
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-[112px] h-[112px] rounded-[12px] border-[1.5px] border-dashed border-[#d1d5db] flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden group cursor-pointer"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-[12px] font-bold tracking-wider uppercase">Change</span>
                                    </div>
                                </>
                            ) : (
                                <svg className="w-[40px] h-[40px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M 10.3 21 H 5 A 2 2 0 0 1 3 19 V 5 A 2 2 0 0 1 5 3 H 19 A 2 2 0 0 1 21 5 V 15 L 17.9 11.9 A 2 2 0 0 0 15.086 11.914 L 6 21" />
                                    <path d="M 14 19.5 L 17 16.5 L 20 19.5" />
                                    <path d="M 17 22 V 16.5" />
                                    <circle cx="9" cy="9" r="2" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Machine Name */}
                    <div className="flex flex-col mb-4">
                        <label className="text-[14px] font-semibold text-[#4b5563] mb-[6px]">Machine Name*</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Type Name.." 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={isSaving}
                            className="w-full h-[46px] border bg-white  border-[#e5e7eb] rounded-[6px] px-4 text-[15px] text-[#374151] placeholder-gray-400 focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors"
                        />
                    </div>

                    {/* Machine Type */}
                    <div className="flex flex-col mb-4 relative">
                        <label className="text-[14px] font-semibold text-[#4b5563] mb-[6px]">Machine Type*</label>
                        <select 
                            required
                            value={type}
                            onChange={e => setType(e.target.value)}
                            disabled={isSaving}
                            className="w-full h-[46px] border border-[#e5e7eb] rounded-[6px] px-4 pr-10 text-[15px] text-[#374151] appearance-none focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors bg-white cursor-pointer"
                        >
                            {MACHINE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <svg className="w-5 h-5 text-gray-400 absolute right-3 top-[33px] pointer-events-none" viewBox="0 0 20 20" fill="none">
                            <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" fill="currentColor"/>
                        </svg>
                    </div>

                    {/* Tag */}
                    <div className="flex flex-col mb-4">
                        <label className="text-[14px] font-semibold text-[#4b5563] mb-[6px]">Tag*</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Type Tag.." 
                            value={tag}
                            onChange={e => setTag(e.target.value)}
                            disabled={isSaving}
                            className="w-full h-[46px] border  bg-white border-[#e5e7eb] rounded-[6px] px-4 text-[15px] text-[#374151] placeholder-gray-400 focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors"
                        />
                    </div>

                    {/* What's included (Desc) */}
                    <div className="flex flex-col mb-4">
                        <label className="text-[14px] font-semibold text-[#4b5563] mb-[6px]">What’s included</label>
                        <textarea 
                            rows="3" 
                            placeholder="Add details" 
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            disabled={isSaving}
                            className="w-full min-h-[80px] bg-white border border-[#e5e7eb] rounded-[6px] p-4 text-[15px] text-[#374151] placeholder-gray-400 resize-none focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors"
                        />
                    </div>

                    {/* Price and Office Size Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#4b5563] mb-[6px]">Price* (per month)</label>
                            <input 
                                required
                                type="number" 
                                placeholder="$150 / month" 
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                disabled={isSaving}
                                className="w-full  bg-white h-[46px] border border-[#e5e7eb] rounded-[6px] px-4 text-[15px] text-[#374151] placeholder-gray-400 focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#4b5563] mb-[6px]">Office size</label>
                            <input 
                                type="number" 
                                placeholder="25" 
                                value={uptoEmployees}
                                onChange={e => setUptoEmployees(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-white h-[46px] border border-[#e5e7eb] rounded-[6px] px-4 text-[15px] text-[#374151] placeholder-gray-400 focus:outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4">
                        <button 
                            type="button"
                            onClick={onClose} 
                            disabled={isSaving}
                            className="h-[44px] px-6 text-[#4b5563] text-[15px] font-bold rounded-[8px] hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="h-[44px] px-10 bg-[#86644c] text-white text-[15px] font-bold rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[110px]"
                        >
                            {isSaving ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isEditMode ? 'Update' : 'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};