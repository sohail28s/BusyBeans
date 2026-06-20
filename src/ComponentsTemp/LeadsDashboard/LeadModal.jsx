import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en.json';
import Flags from 'react-phone-number-input/flags';

const ROLES = ['Manager', 'Owner', 'Procurement', 'Director'];
const BUSINESS_TYPES = ['Office', 'Restaurant', 'Cafe', 'Other'];
const ORDER_TYPES = ['Machine + Beans', 'Machine Only', 'Beans Only'];
const USE_CASES = ['Small Cafe', 'Medium Cafe', 'Large Cafe', 'Office', 'Restaurant'];
const VOLUMES = ['50-80 cups/day', '80-100 cups/day', '100-200 cups/day', '200+ cups/day'];
const TIMELINES = ['Immediate', '1-2 Weeks', '1-3 Months', '3-6 Months'];
const CONTACT_METHODS = ['Phone', 'Email', 'WhatsApp'];
const LEAD_SOURCES = ['Website', 'Referral', 'Other'];

// --- Setup Phone Countries ---
const allCountries = getCountries().map(iso => ({
    iso,
    name: en[iso],
    code: `+${getCountryCallingCode(iso)}`,
    Flag: Flags[iso]
}));

// We sort by length descending so +1242 (Bahamas) is checked before +1 (US)
const sortedPhoneCountries = [...allCountries].sort((a, b) => b.code.length - a.code.length);

const priorityCountryDefaults = { '+1': 'US', '+44': 'GB', '+61': 'AU', '+7': 'RU', '+33': 'FR' };

// --- Custom Reusable Select Component ---
const CustomSelect = ({ label, value, options, onChange, placeholder, disabled, displayKey = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    const displayValue = value ? (displayKey ? value[displayKey] : value) : '';
    const filteredOptions = options.filter(opt => {
        const text = displayKey ? opt[displayKey] : opt;
        return text?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2 font-sans relative w-full" ref={wrapperRef}>
            {label && <label className="text-[14px] font-medium text-[#374151]">{label}</label>}
            <div 
                className={`flex items-center justify-between h-[42px] px-4 bg-white border rounded-[6px] transition-colors cursor-text ${
                    disabled ? 'opacity-60 cursor-not-allowed border-gray-200' : 'border-[#e2e8f0] focus-within:border-[#86644c]'
                }`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                <input
                    type="text" 
                    value={isOpen ? searchTerm : displayValue}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                    placeholder={placeholder} 
                    disabled={disabled}
                    className="w-full h-full bg-white outline-none text-[14px] text-gray-900 placeholder-gray-400 cursor-pointer"
                />
                <div className="flex items-center flex-shrink-0 cursor-pointer text-gray-400" onClick={() => !disabled && setIsOpen(!isOpen)}>
                    <span className="w-[1px] h-5 bg-[#e2e8f0] mx-2"></span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 max-h-[220px] overflow-y-auto custom-scrollbar mt-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, i) => (
                            <div
                                key={i} 
                                onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
                                className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors hover:bg-gray-50 text-gray-900`}
                            >
                                {displayKey ? opt[displayKey] : opt}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-[14px] text-gray-500 italic bg-white">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==============================================
// MAIN MODAL COMPONENT
// ==============================================
export const LeadModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const isEditMode = !!initialData;
    const modalRef = useRef(null);
    const phoneDropdownRef = useRef(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false); 

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // --- Form State ---
    const [formData, setFormData] = useState({
        contactName: '', company: '', role: '', contactEmail: '', phoneNumber: '',
        addressLineOne: '', addressLineTwo: '', zipCode: '', businessType: '', leadSource: '', preferredContact: '',
        snapshotType: '', snapshotUseCase: '', snapshotVolume: '', snapshotTimeline: '', estimatedValue: '', notes: ''
    });

    // --- Phone specific states ---
    const [selectedPhoneIso, setSelectedPhoneIso] = useState('US');
    const [isPhoneOpen, setIsPhoneOpen] = useState(false);

    // --- Dependent Location & Machine States ---
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [customCity, setCustomCity] = useState('');
    const [isCustomCityMode, setIsCustomCityMode] = useState(false);

    // --- API Data Arrays ---
    const [machines, setMachines] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const activePhoneCountry = allCountries.find(c => c.iso === selectedPhoneIso) || allCountries[0];
    const ActiveFlag = activePhoneCountry.Flag;

    // --- 1. Reset or Pre-fill Form on Open ---
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setIsInitializing(true);

                // --- FIXED PRIORITY PHONE PARSING LOGIC ---
                let parsedIso = 'US';
                let parsedPhone = '';
                
                if (initialData.contactPhone) {
                    const match = sortedPhoneCountries.find(c => initialData.contactPhone.startsWith(c.code));
                    
                    if (match) {
                        // If the matched code is in our priority list, force that ISO, otherwise use the matched one
                        parsedIso = priorityCountryDefaults[match.code] || match.iso;
                        parsedPhone = initialData.contactPhone.substring(match.code.length);
                    } else {
                        parsedPhone = initialData.contactPhone;
                    }
                }

                setFormData({
                    contactName: initialData.contactName || '',
                    company: initialData.company || '',
                    role: initialData.role || '',
                    contactEmail: initialData.contactEmail || '',
                    phoneNumber: parsedPhone,
                    addressLineOne: initialData.addressLineOne || '',
                    addressLineTwo: initialData.addressLineTwo || '',
                    zipCode: initialData.zipCode || '',
                    businessType: initialData.businessType || '',
                    leadSource: initialData.leadSource || '',
                    preferredContact: initialData.preferredContact || '',
                    snapshotType: initialData.snapshotType || '',
                    snapshotUseCase: initialData.snapshotUseCase || '',
                    snapshotVolume: initialData.snapshotVolume || '',
                    snapshotTimeline: initialData.snapshotTimeline || '',
                    estimatedValue: initialData.estimatedValue || '',
                    notes: initialData.notes || ''
                });
                setSelectedPhoneIso(parsedIso);
            } else {
                // Reset for Add
                setFormData({
                    contactName: '', company: '', role: '', contactEmail: '', phoneNumber: '',
                    addressLineOne: '', addressLineTwo: '', zipCode: '', businessType: '', leadSource: '', preferredContact: '',
                    snapshotType: '', snapshotUseCase: '', snapshotVolume: '', snapshotTimeline: '', estimatedValue: '', notes: ''
                });
                setSelectedMachine(null); setSelectedCountry(null); setSelectedState(null); setSelectedCity(null);
                setCustomCity(''); setIsCustomCityMode(false); setSelectedPhoneIso('US'); setIsPhoneOpen(false);
                setIsInitializing(false);
            }
        }
    }, [isOpen, initialData]);

    // --- Outside Click Handlers ---
    useEffect(() => {
        const handleModalClickOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
        const handlePhoneClickOutside = (e) => { if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target)) setIsPhoneOpen(false); };
        if (isOpen) {
            document.addEventListener('mousedown', handleModalClickOutside);
            document.addEventListener('mousedown', handlePhoneClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleModalClickOutside);
            document.removeEventListener('mousedown', handlePhoneClickOutside);
        };
    }, [isOpen, onClose]);

    // --- API Fetching & Cascading Auto-Select ---
    useEffect(() => {
        if (!isOpen) return;
        const fetchInitialData = async () => {
            try {
                const [machinesRes, countriesRes] = await Promise.all([
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/coffee-machine', getAuthConfig()),
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/address-management/country', getAuthConfig())
                ]);
                
                const fetchedMachines = machinesRes.data?.data?.data || [];
                const fetchedCountries = countriesRes.data?.data?.data || [];
                setMachines(fetchedMachines);
                setCountries(fetchedCountries);

                if (initialData && isInitializing) {
                    const mMatch = fetchedMachines.find(m => m.name === initialData.machineName);
                    if (mMatch) setSelectedMachine(mMatch);
                    const cMatch = fetchedCountries.find(c => c.name === initialData.country);
                    if (cMatch) setSelectedCountry(cMatch); 
                }
            } catch (error) { toast.error("Failed to load initial form data."); }
        };
        fetchInitialData();
    }, [isOpen, initialData, isInitializing]);

    useEffect(() => {
        if (!selectedCountry) { setStates([]); setSelectedState(null); return; }
        const fetchStates = async () => {
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/state?countryInSystemId=${selectedCountry.id}`, getAuthConfig());
                const fetchedStates = res.data?.data?.data || [];
                setStates(fetchedStates);

                if (initialData && isInitializing) {
                    const sMatch = fetchedStates.find(s => s.name === initialData.state);
                    if (sMatch) setSelectedState(sMatch); 
                }
            } catch (error) { toast.error("Failed to load states."); }
        };
        fetchStates();
    }, [selectedCountry, initialData, isInitializing]);

    useEffect(() => {
        if (!selectedState) { setCities([]); setSelectedCity(null); return; }
        const fetchCities = async () => {
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/city?stateInSystemId=${selectedState.id}`, getAuthConfig());
                const fetchedCities = res.data?.data?.data || [];
                setCities(fetchedCities);

                if (initialData && isInitializing) {
                    const cityMatch = fetchedCities.find(c => c.name === initialData.city);
                    if (cityMatch) {
                        setSelectedCity(cityMatch);
                    } else if (initialData.city) {
                        setIsCustomCityMode(true);
                        setCustomCity(initialData.city);
                    }
                    setIsInitializing(false); 
                }
            } catch (error) { toast.error("Failed to load cities."); }
        };
        fetchCities();
    }, [selectedState, initialData, isInitializing]);

    // --- Interaction Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.contactName || !formData.company || !formData.role || !formData.contactEmail || !formData.phoneNumber || !selectedMachine || !selectedCountry || !selectedState) {
            return toast.warning("Please fill in all required fields marked with *");
        }

        const finalCity = isCustomCityMode ? customCity : (selectedCity ? selectedCity.name : '');
        if (!finalCity) return toast.warning("Please enter or select a city.");

        setIsSaving(true);
        const loadingNode = toast.loading(isEditMode ? `Updating lead...` : `Creating new lead...`);

        try {
            const payload = {
                contactName: formData.contactName,
                company: formData.company,
                role: formData.role,
                contactEmail: formData.contactEmail,
                contactPhone: `${activePhoneCountry.code}${formData.phoneNumber}`,
                addressLineOne: formData.addressLineOne,
                addressLineTwo: formData.addressLineTwo,
                city: finalCity,
                state: selectedState.name,
                country: selectedCountry.name,
                zipCode: formData.zipCode,
                businessType: formData.businessType,
                leadSource: formData.leadSource,
                preferredContact: formData.preferredContact,
                snapshotType: formData.snapshotType,
                snapshotUseCase: formData.snapshotUseCase,
                snapshotVolume: formData.snapshotVolume,
                snapshotTimeline: formData.snapshotTimeline,
                estimatedValue: formData.estimatedValue,
                notes: formData.notes,
                machineId: selectedMachine.id,
                machineName: selectedMachine.name,
                status: initialData ? initialData.status : "New Enquiry" 
            };

            const endpoint = isEditMode 
                ? `https://testingbb.trimworldwide.com/api/v1/leads/${initialData.id}` 
                : `https://testingbb.trimworldwide.com/api/v1/leads`;
            
            const method = isEditMode ? 'patch' : 'post';
            const res = await axios[method](endpoint, payload, getAuthConfig());

            if (res.data?.success || res.status === 200 || res.status === 201) {
                toast.update(loadingNode, { render: `Lead ${isEditMode ? 'updated' : 'created'} successfully!`, type: "success", isLoading: false, autoClose: 3000 });
                if (onSuccess) onSuccess(); 
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { render: error.response?.data?.message || `Failed to save lead.`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full h-[42px] px-4 bg-white border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#86644c] text-[14px] text-gray-900 placeholder-gray-400 transition-colors";
    const labelClass = "text-[14px] font-medium text-[#374151] mb-2 block";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white w-full max-w-[800px] max-h-[90vh] rounded-[8px] shadow-2xl flex flex-col font-sans animate-fadeIn">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0] shrink-0">
                    <h2 className="text-[20px] font-bold text-[#1f2937] tracking-wide">{isEditMode ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body - Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar flex flex-col gap-8">
                    
                    {/* --- 1. Contact Information --- */}
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-900 mb-5">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className={labelClass}>Name *</label>
                                <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="John Doe" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Company Name *</label>
                                <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Brew Corner Café" className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <CustomSelect label="Role *" value={formData.role} options={ROLES} onChange={val => setFormData(p => ({...p, role: val}))} placeholder="Select Role" />
                            <CustomSelect label="Business Type" value={formData.businessType} options={BUSINESS_TYPES} onChange={val => setFormData(p => ({...p, businessType: val}))} placeholder="Select Business Type" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className={labelClass}>Business Email *</label>
                                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="example@company.com" className={inputClass} />
                            </div>
                            
                            {/* --- PHONE UI --- */}
                            <div className="flex flex-col gap-2 relative" ref={phoneDropdownRef}>
                                <label className="text-[14px] font-medium text-black">Phone Number *</label>
                                <div className="flex h-[42px] items-center gap-3">
                                    <div onClick={() => setIsPhoneOpen(!isPhoneOpen)} className="w-[115px] h-full border border-gray-300 rounded-[4px] bg-white flex items-center justify-between px-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <ActiveFlag className="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-gray-100" />
                                            <div className="flex items-center flex-shrink-0 text-gray-400">
                                                <svg className={`w-3.5 h-3.5 fill-current transition-transform duration-200 ${isPhoneOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg>
                                            </div>
                                        </div>
                                        <span className="w-[1px] h-5 bg-[#e2e8f0]"></span>
                                        <span className="text-[14px] font-medium text-gray-700">{activePhoneCountry.code}</span>
                                    </div>
                                    <input type="number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Enter Phone Number" className="flex-1 h-full px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-[#86644c] text-black text-[14px] bg-white transition-colors" />
                                    {isPhoneOpen && (
                                        <div className="absolute top-[72px] left-0 w-[300px] bg-[#86644c] border border-[#735541] rounded-[4px] shadow-lg z-50 max-h-[220px] overflow-y-auto custom-scrollbar">
                                            {allCountries.map((item) => {
                                                const ItemFlag = item.Flag;
                                                return (
                                                    <div key={item.iso} onClick={() => { setSelectedPhoneIso(item.iso); setIsPhoneOpen(false); }} className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 text-[14px] transition-colors ${ selectedPhoneIso === item.iso ? 'bg-[#f4f4f4] text-black' : 'text-white hover:bg-[#a68266]' }`}>
                                                        <ItemFlag className="w-5 h-[14px] object-cover rounded-[1px]" />
                                                        <span className="flex-1 truncate">{item.name}</span>
                                                        <span className={selectedPhoneIso === item.iso ? 'text-gray-500' : 'text-gray-300'}>{item.code}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <CustomSelect label="Machine *" value={selectedMachine} displayKey="name" options={machines} onChange={opt => setSelectedMachine(opt)} placeholder="Select Machine" />
                        </div>
                    </div>

                    {/* --- 2. Address Information --- */}
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-900 mb-5">Address Information</h3>
                        <div className="flex flex-col gap-5 mb-5">
                            <div>
                                <label className={labelClass}>Address Line 1 *</label>
                                <input type="text" name="addressLineOne" value={formData.addressLineOne} onChange={handleInputChange} placeholder="Street address" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Address Line 2</label>
                                <input type="text" name="addressLineTwo" value={formData.addressLineTwo} onChange={handleInputChange} placeholder="Apartment, suite, etc." className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <CustomSelect label="Country *" value={selectedCountry} displayKey="name" options={countries} onChange={opt => { setSelectedCountry(opt); setSelectedState(null); setSelectedCity(null); }} placeholder="Select Country" />
                            <CustomSelect label="State *" value={selectedState} displayKey="name" options={states} disabled={!selectedCountry} onChange={opt => { setSelectedState(opt); setSelectedCity(null); }} placeholder={selectedCountry ? "Select State" : "Select Country First"} />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2 font-sans w-full">
                                <div className="flex justify-between items-center mb-0">
                                    <label className="text-[14px] font-medium text-[#374151]">City *</label>
                                    <button onClick={() => setIsCustomCityMode(!isCustomCityMode)} className="text-[12px] font-medium text-[#2563eb] hover:underline focus:outline-none">
                                        {isCustomCityMode ? 'Select from list' : 'Enter custom'}
                                    </button>
                                </div>
                                {isCustomCityMode ? (
                                    <input type="text" value={customCity} onChange={(e) => setCustomCity(e.target.value)} placeholder="Type custom city" className={inputClass} />
                                ) : (
                                    <CustomSelect value={selectedCity} displayKey="name" options={cities} disabled={!selectedState} onChange={opt => setSelectedCity(opt)} placeholder={selectedState ? "Select City" : "Select State First"} />
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>ZIP/Postal Code</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="12345" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* --- 3. Requirement Snapshot --- */}
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-900 mb-5">Requirement Snapshot</h3>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <CustomSelect label="Order Type *" value={formData.snapshotType} options={ORDER_TYPES} onChange={val => setFormData(p => ({...p, snapshotType: val}))} placeholder="Select Order Type" />
                            <CustomSelect label="Use Case" value={formData.snapshotUseCase} options={USE_CASES} onChange={val => setFormData(p => ({...p, snapshotUseCase: val}))} placeholder="Select Use Case" />
                        </div>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <CustomSelect label="Estimated Volume" value={formData.snapshotVolume} options={VOLUMES} onChange={val => setFormData(p => ({...p, snapshotVolume: val}))} placeholder="Select Volume" />
                            <CustomSelect label="Timeline" value={formData.snapshotTimeline} options={TIMELINES} onChange={val => setFormData(p => ({...p, snapshotTimeline: val}))} placeholder="Select Timeline" />
                        </div>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className={labelClass}>Estimated Value</label>
                                <input type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleInputChange} placeholder="$0.00" className={inputClass} />
                            </div>
                            <CustomSelect label="Preferred Contact Method" value={formData.preferredContact} options={CONTACT_METHODS} onChange={val => setFormData(p => ({...p, preferredContact: val}))} placeholder="Select Method" />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Notes</label>
                                <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Additional notes..." className={inputClass} />
                            </div>
                            <CustomSelect label="Lead Source" value={formData.leadSource} options={LEAD_SOURCES} onChange={val => setFormData(p => ({...p, leadSource: val}))} placeholder="Select Source" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#e2e8f0] flex items-center justify-end gap-3 bg-[#f9fafb] rounded-b-[8px] shrink-0">
                    <button onClick={onClose} disabled={isSaving} className="h-[42px] px-6 bg-white border border-[#e2e8f0] text-[#4b5563] text-[14px] font-medium rounded-[6px] hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="h-[42px] px-8 bg-[#86644c] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50">
                        {isSaving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Lead' : 'Create Lead')}
                    </button>
                </div>

            </div>
        </div>
    );
};