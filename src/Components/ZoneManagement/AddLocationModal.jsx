import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../utils/orderUtils'; // Adjust path if needed
import { State, City } from 'country-state-city';

/**
 * Global Add Modal for States and Cities
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Closes the modal
 * @param {string} type - 'state' or 'city'
 * @param {object} country - Country data object (required)
 * @param {object} stateData 
 * @param {function} onSuccess 
 */
const AddLocationModal = ({ isOpen, onClose, type, country, stateData, onSuccess }) => {
    const [selectedItemToAdd, setSelectedItemToAdd] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef(null);

    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const pluralType = type === 'city' ? 'cities' : 'states';

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Reset modal state when closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedItemToAdd(null);
            setSearchQuery('');
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    // Dynamically fetch options from the library based on the type
    const libraryOptions = useMemo(() => {
        if (!country?.isoCode) return [];
        let allOptions = [];

        if (type === 'state') {
            allOptions = State.getStatesOfCountry(country.isoCode) || [];
        } else if (type === 'city') {
            if (!stateData?.isoCode) return [];
            allOptions = City.getCitiesOfState(country.isoCode, stateData.isoCode) || [];
        }
        
        // Filter based on search query
        if (searchQuery.trim()) {
            allOptions = allOptions.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return allOptions;
    }, [type, country, stateData, searchQuery]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItemToAdd) return toast.error(`Please select a ${type} to add.`);

        setIsSubmitting(true);
        try {
            // Construct the dynamic payload
            let payload = {};
            if (type === 'state') {
                payload = {
                    name: selectedItemToAdd.name,
                    isoCode: selectedItemToAdd.isoCode,
                    countryInSystemId: country.id,
                };
            } else if (type === 'city') {
                payload = {
                    name: selectedItemToAdd.name,
                    countryInSystemId: country.id,
                    stateInSystemId: stateData.id
                };
            }

            const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/address-management/${type}`;
            
            const res = await axios.post(apiUrl, payload, getAuthConfig());

            if (res.data?.status === 'success' || res.status === 201) {
                toast.success(`${formattedType} added successfully!`);
                onSuccess(); 
                onClose();
            } else {
                throw new Error(`Failed to add ${type}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Error adding ${type}.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-[500px] rounded-[12px] shadow-xl flex flex-col font-sans relative">
                
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-[20px] font-semibold text-gray-800">Add {formattedType}</h2>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleAddSubmit} className="p-8 flex flex-col gap-6">
                    <div>
                        <label className="block text-[14px] font-medium text-gray-700 mb-2">{formattedType}</label>
                        
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                type="button" 
                                disabled={isSubmitting} 
                                onClick={() => setIsDropdownOpen(o => !o)} 
                                className={`w-full flex items-center justify-between border rounded-[8px] px-4 h-[45px] text-[14px] bg-white transition-colors ${ isDropdownOpen ? 'border-[#86644c] ring-1 ring-[#86644c]' : 'border-gray-300 hover:border-gray-400' }`}
                            >
                                <span className={selectedItemToAdd ? 'text-gray-800' : 'text-gray-400'}>
                                    {selectedItemToAdd ? selectedItemToAdd.name : `Select ${formattedType}`}
                                </span>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white focus-within:border-blue-500 transition-colors">
                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                                            <input 
                                                autoFocus 
                                                type="text" 
                                                placeholder={`Search ${pluralType}...`} 
                                                value={searchQuery} 
                                                onChange={(e) => setSearchQuery(e.target.value)} 
                                                className="outline-none text-[13px] text-gray-700 placeholder-gray-400 w-full bg-transparent" 
                                            />
                                        </div>
                                    </div>
                                    <ul className="max-h-[220px] overflow-y-auto">
                                        {libraryOptions.length === 0 ? (
                                            <li className="px-4 py-4 text-[13px] text-gray-400 text-center italic">
                                                No matching {pluralType} found.
                                            </li>
                                        ) : (
                                            libraryOptions.map((item) => (
                                                <li 
                                                    key={item.isoCode || item.name} // States have isoCode, Cities usually just name
                                                    onClick={() => {
                                                        setSelectedItemToAdd(item);
                                                        setIsDropdownOpen(false);
                                                        setSearchQuery('');
                                                    }} 
                                                    className="px-4 py-2.5 text-[14px] text-gray-700 hover:bg-[#86644c] hover:text-white cursor-pointer transition-colors"
                                                >
                                                    {item.name}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="h-[42px] px-6 text-gray-600 font-medium border border-gray-300 rounded-[8px] hover:bg-gray-50 transition-colors text-[14px]">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !selectedItemToAdd} className="h-[42px] px-8 bg-[#86644c] text-white font-medium rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm flex items-center justify-center min-w-[100px] disabled:opacity-60 text-[14px]">
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLocationModal;