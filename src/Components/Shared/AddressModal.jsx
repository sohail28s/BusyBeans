import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 

const CustomSelect = ({ options, value, onChange, placeholder, disabled }) => { 
    const [isOpen, setIsOpen] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const wrapperRef = useRef(null); 
    
    const selectedOption = options.find(o => String(o.id) === String(value)); 
    const displayValue = isOpen ? searchTerm : (selectedOption ? selectedOption.name : ''); 
    
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
    
    const filteredOptions = options.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase())); 
    
    return ( 
        <div className="relative w-full font-sans" ref={wrapperRef}> 
            <div className={`flex items-center justify-between h-[42px] px-4 border rounded-[6px] bg-white transition-colors cursor-text ${ disabled ? 'opacity-60 cursor-not-allowed border-gray-200' : 'border-[#e2e8f0] focus-within:border-[#86644c]' }`} onClick={() => !disabled && setIsOpen(true)} > 
                <input type="text" value={displayValue} onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }} placeholder={placeholder} disabled={disabled} className="w-full h-full bg-white outline-none text-[14px] text-gray-900 placeholder-gray-400" /> 
                <div className="flex items-center flex-shrink-0 cursor-pointer bg-white" onClick={() => !disabled && setIsOpen(!isOpen)}> 
                    <span className="w-[1px] h-5 bg-[#e2e8f0] mx-2"></span> 
                    <div className={`p-1 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}> 
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg> 
                    </div> 
                </div> 
            </div> 
            {isOpen && ( 
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 max-h-[220px] overflow-y-auto custom-scrollbar"> 
                    {filteredOptions.length > 0 ? ( 
                        filteredOptions.map((opt) => ( 
                            <div key={opt.id} onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }} className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${String(value) === String(opt.id) ? 'bg-[#86644c] text-white' : 'text-gray-900 hover:bg-gray-50'}`} > 
                                {opt.name} 
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

// --- Main Address Modal ---
export const AddressModal = ({ 
    isOpen, 
    onClose, 
    customerId, 
    initialData, 
    onSuccess, 
    userType = 'customer', 
    addressType = 'shipping' 
}) => { 
    // Fix: Strictly check if an ID exists to determine if we are Editing or Adding
    const isEditMode = initialData && initialData.id ? true : false; 
    const modalRef = useRef(null); 
    const [isSaving, setIsSaving] = useState(false); 
    
    const [formData, setFormData] = useState({ 
        addressLineOne: initialData?.addressLineOne || '', 
        addressLineTwo: initialData?.addressLineTwo || '', 
        country: initialData?.country || '', 
        state: initialData?.state || '', 
        town: initialData?.town || '', 
        zipCode: initialData?.zipCode || '', 
        status: initialData?.status !== undefined ? initialData.status : true 
    }); 
    
    const [locationIds, setLocationIds] = useState({ countryId: '', stateId: '' }); 
    const [countries, setCountries] = useState([]); 
    const [states, setStates] = useState([]); 
    const [isLoadingLocation, setIsLoadingLocation] = useState({ countries: false, states: false }); 
    
    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    }); 

    // Close on outside click 
    useEffect(() => { 
        const handleClickOutside = (event) => { 
            if (modalRef.current && !modalRef.current.contains(event.target)) onClose(); 
        }; 
        if (isOpen) document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, [isOpen, onClose]); 

    // --- Fetch Countries --- 
    useEffect(() => { 
        if (!isOpen) return; 
        const fetchCountries = async () => { 
            setIsLoadingLocation(prev => ({ ...prev, countries: true })); 
            try { 
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/address-management/country', getAuthConfig()); 
                const fetchedCountries = res.data?.data?.data || []; 
                setCountries(fetchedCountries); 
                if (initialData?.country) { 
                    const match = fetchedCountries.find(c => c.name.toLowerCase() === initialData.country.toLowerCase()); 
                    if (match) setLocationIds(prev => ({ ...prev, countryId: match.id })); 
                } 
            } catch (error) { 
                toast.error("Failed to load countries."); 
            } finally { 
                setIsLoadingLocation(prev => ({ ...prev, countries: false })); 
            } 
        }; 
        fetchCountries(); 
    }, [isOpen, initialData?.country]); 

    // --- Fetch States --- 
    useEffect(() => { 
        if (!locationIds.countryId) { 
            setStates([]); 
            return; 
        } 
        const fetchStates = async () => { 
            setIsLoadingLocation(prev => ({ ...prev, states: true })); 
            try { 
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/state?countryInSystemId=${locationIds.countryId}`, getAuthConfig()); 
                const fetchedStates = res.data?.data?.data || []; 
                setStates(fetchedStates); 
                if (initialData?.state) { 
                    const match = fetchedStates.find(s => s.name.toLowerCase() === initialData.state.toLowerCase()); 
                    if (match) setLocationIds(prev => ({ ...prev, stateId: match.id })); 
                } 
            } catch (error) { 
                toast.error("Failed to load states."); 
            } finally { 
                setIsLoadingLocation(prev => ({ ...prev, states: false })); 
            } 
        }; 
        fetchStates(); 
    }, [locationIds.countryId, initialData?.state]); 

    const handleInputChange = (e) => { 
        const { name, value, type, checked } = e.target; 
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); 
    }; 

    const handleSave = async () => { 
        if (!formData.addressLineOne || !formData.country || !formData.state || !formData.town || !formData.zipCode) { 
            return toast.warning("Please fill in all required fields."); 
        } 
        
        setIsSaving(true); 
        const loadingNode = toast.loading(`${isEditMode ? 'Updating' : 'Adding'} address...`); 
        
        try { 
            let payload = {};
            let apiUrl = '';

            if (userType === 'sales-rep') {
                apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/address-update/${customerId}`;
                
                if (isEditMode) {
                    // EDIT MODE for Sales Rep
                    if (addressType === 'billing') {
                        payload = { billingAddresses: { salesRepId: String(customerId), id: initialData.id, ...formData } };
                    } else {
                        payload = { addresses: { salesRepId: String(customerId), id: initialData.id, ...formData } };
                    }
                } else {
                    // ADD MODE for Sales Rep
                    payload = { newAddressess: [{ salesRepId: String(customerId), ...formData }] };
                }
            } 
            else {
                apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/customer-update/${customerId}`;
                
                if (isEditMode) { 
                    payload = { address: { id: initialData.id, ...formData } }; 
                } else { 
                    payload = { 
                        newAddressess: [{ 
                            userId: customerId, 
                            addressLineOne: formData.addressLineOne, 
                            addressLineTwo: formData.addressLineTwo, 
                            town: formData.town, 
                            country: formData.country, 
                            state: formData.state, 
                            zipCode: formData.zipCode, 
                            status: formData.status 
                        }] 
                    }; 
                } 
            }

            const res = await axios.patch(apiUrl, payload, getAuthConfig()); 
            
            if (res.data?.status === 'success' || res.status === 200) { 
                toast.update(loadingNode, { render: `Address ${isEditMode ? 'updated' : 'added'} successfully!`, type: "success", isLoading: false, autoClose: 3000 }); 
                if (onSuccess) onSuccess(); 
                onClose(); 
            } 
        } catch (error) { 
            toast.update(loadingNode, { render: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} address.`, type: "error", isLoading: false, autoClose: 3000 }); 
        } finally { 
            setIsSaving(false); 
        } 
    }; 

    if (!isOpen) return null; 
    
    const inputClass = "w-full h-[42px] px-4 bg-white border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#86644c] text-[14px] text-gray-900 placeholder-gray-400 transition-colors"; 
    const labelClass = "text-[14px] font-medium text-[#374151] mb-1.5 block"; 

    return ( 
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"> 
            <div ref={modalRef} className="bg-white w-full max-w-[550px] rounded-[10px] shadow-2xl flex flex-col font-sans animate-fadeIn"> 
                {/* Modal Header */} 
                <div className="flex items-center justify-between px-6 py-5"> 
                    <h2 className="text-[18px] font-bold text-[#1f2937] tracking-wide"> 
                        {isEditMode ? 'Edit Address' : 'Add New Address'} 
                    </h2> 
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors"> 
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> 
                    </button> 
                </div> 

                {/* Modal Body */} 
                <div className="px-6 pb-6 flex flex-col gap-5"> 
                    <div> 
                        <label className={labelClass}>Address Line 1</label> 
                        <input type="text" name="addressLineOne" value={formData.addressLineOne} onChange={handleInputChange} placeholder="Address line 1" className={inputClass} /> 
                    </div> 
                    <div> 
                        <label className={labelClass}>Address Line 2</label> 
                        <input type="text" name="addressLineTwo" value={formData.addressLineTwo} onChange={handleInputChange} placeholder="Address line 2" className={inputClass} /> 
                    </div> 
                    <div className="grid grid-cols-2 gap-4"> 
                        <div> 
                            <label className={labelClass}>Country</label> 
                            <CustomSelect options={countries} value={locationIds.countryId} onChange={(opt) => { setLocationIds(prev => ({ ...prev, countryId: opt.id, stateId: '' })); setFormData(prev => ({ ...prev, country: opt.name, state: '' })); }} placeholder={isLoadingLocation.countries ? "Loading..." : "Select Country"} /> 
                        </div> 
                        <div> 
                            <label className={labelClass}>State</label> 
                            <CustomSelect options={states} value={locationIds.stateId} disabled={!locationIds.countryId || isLoadingLocation.states} onChange={(opt) => { setLocationIds(prev => ({ ...prev, stateId: opt.id })); setFormData(prev => ({ ...prev, state: opt.name })); }} placeholder={!locationIds.countryId ? "Select Country" : "Select State"} /> 
                        </div> 
                    </div> 
                    <div className="grid grid-cols-2 gap-4"> 
                        <div> 
                            <label className={labelClass}>Town / City</label> 
                            <input type="text" name="town" value={formData.town} onChange={handleInputChange} placeholder="Town / City" className={inputClass} /> 
                        </div> 
                        <div> 
                            <label className={labelClass}>Zip Code</label> 
                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Zip / Postal Code" className={inputClass} /> 
                        </div> 
                    </div> 
                    <div className="flex items-center gap-2 mt-2"> 
                        <div className="relative flex items-center justify-center w-[18px] h-[18px] cursor-pointer"> 
                            <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" /> 
                            <div className={`w-full h-full border rounded-[4px] flex items-center justify-center transition-colors ${formData.status ? 'bg-[#374151] border-[#374151]' : 'bg-white border-gray-300'}`}> 
                                <svg className={`w-3 h-3 text-white transition-opacity ${formData.status ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"> <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> </svg> 
                            </div> 
                        </div> 
                        <label className="text-[14px] text-gray-500 select-none cursor-pointer" onClick={() => setFormData(p => ({...p, status: !p.status}))}>Active</label> 
                    </div> 
                </div> 

                {/* Modal Footer */} 
                <div className="px-6 py-5 flex items-center justify-end gap-3 mt-2"> 
                    <button onClick={onClose} disabled={isSaving} className="h-[42px] px-6 bg-white border border-[#e2e8f0] text-[#4b5563] text-[14px] font-medium rounded-[6px] hover:bg-gray-50 transition-colors disabled:opacity-50" > Cancel </button> 
                    <button onClick={handleSave} disabled={isSaving} className="h-[42px] px-8 bg-[#86644c] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50" > {isSaving ? 'Saving...' : 'Save'} </button> 
                </div> 
            </div> 
        </div> 
    ); 
};