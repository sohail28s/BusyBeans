import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { getCountries, getCountryCallingCode } from 'react-phone-number-input'; 
import en from 'react-phone-number-input/locale/en.json'; 
import Flags from 'react-phone-number-input/flags'; 

// --- CUSTOM SELECT COMPONENT FOR COUNTRY & STATE --- 
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
            <div 
                className={`flex items-center justify-between h-[45px] px-4 border rounded-[4px] bg-white transition-colors cursor-text ${ disabled ? 'opacity-60 cursor-not-allowed border-gray-200' : 'border-[#e2e8f0] focus-within:border-black' }`} 
                onClick={() => !disabled && setIsOpen(true)} 
            > 
                <input 
                    type="text" 
                    value={displayValue} 
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }} 
                    placeholder={placeholder} 
                    disabled={disabled} 
                    className="w-full h-full bg-white outline-none text-[14px] text-gray-900 placeholder-gray-400" 
                /> 
                <div className="flex items-center flex-shrink-0 cursor-pointer bg-white" onClick={() => !disabled && setIsOpen(!isOpen)}> 
                    <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
                    <div className={`p-1 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}> 
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg> 
                    </div> 
                </div> 
            </div> 
            
            {isOpen && ( 
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-brand-brown rounded-[4px] shadow-lg z-50 max-h-[220px] overflow-y-auto"> 
                    {filteredOptions.length > 0 ? ( 
                        filteredOptions.map((opt) => ( 
                            <div 
                                key={opt.id} 
                                onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }} 
                                className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors text-white hover:bg-input-hover ${String(value) === String(opt.id) ? 'bg-brand-brown-hover font-semibold' : ''}`} 
                            > 
                                {opt.name} 
                            </div> 
                        )) 
                    ) : ( 
                        <div className="px-4 py-3 text-[14px] text-white/80 italic bg-brand-brown">No results found</div> 
                    )} 
                </div> 
            )} 
        </div> 
    ); 
}; 

export const CustomerForm = ({ mode = 'add', initialData = {}, onSubmitForm, isSubmitting }) => { 
    // Auto-fill safely checking nested addresses array 
    const primaryAddress = initialData.addresses?.[0] || {}; 
    const [formData, setFormData] = useState({ 
        // Shipping Address 
        addressLineOne: primaryAddress.addressLineOne || '', 
        addressLineTwo: primaryAddress.addressLineTwo || '', 
        country: primaryAddress.country || '', 
        state: primaryAddress.state || '', 
        town: primaryAddress.town || '', 
        zipCode: primaryAddress.zipCode || '', 
        billingSameAsShipping: true, 
        // Company Details 
        companyName: initialData.companyName || '', 
        saleTaxNumber: initialData.saleTaxNumber || '', 
        dispatchEmail: initialData.dispatchEmail || '', 
        emailToSendInvoices: initialData.emailToSendInvoices || '', 
        phoneNumber: initialData.phoneNumber || '', 
        countryCode: initialData.countryCode || '+1', 
        // User Details 
        name: initialData.name || '', 
        email: initialData.email || '', 
        // Passwords explicitly empty 
        password: '', 
        confirmPassword: '' 
    }); 
    
    const [showPassword, setShowPassword] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    
    // --- API Driven Location States --- 
    const [locationIds, setLocationIds] = useState({ countryId: '', stateId: '' }); 
    const [countries, setCountries] = useState([]); 
    const [states, setStates] = useState([]); 
    const [isLoadingLocation, setIsLoadingLocation] = useState({ countries: false, states: false }); 
    
    // --- Custom Phone Dropdown Logic --- 
    const allCountries = getCountries().map(iso => ({ iso, name: en[iso], code: `+${getCountryCallingCode(iso)}`, Flag: Flags[iso] })); 
    const priorityCountryDefaults = { '+1': 'US', '+44': 'GB', '+61': 'AU' }; 
    let initialIso = priorityCountryDefaults[formData.countryCode] || 'US'; 
    const [isPhoneOpen, setIsPhoneOpen] = useState(false); 
    const [selectedPhoneIso, setSelectedPhoneIso] = useState(initialIso); 
    const phoneDropdownRef = useRef(null); 
    const activePhoneCountry = allCountries.find(c => c.iso === selectedPhoneIso) || allCountries[0]; 
    const ActiveFlag = activePhoneCountry.Flag; 
    
    useEffect(() => { 
        const handleClickOutsidePhone = (event) => { 
            if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) setIsPhoneOpen(false); 
        }; 
        document.addEventListener('mousedown', handleClickOutsidePhone); 
        return () => document.removeEventListener('mousedown', handleClickOutsidePhone); 
    }, []); 
    
    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    }); 

    // --- Fetch Location Data --- 
    useEffect(() => { 
        const fetchCountries = async () => { 
            setIsLoadingLocation(prev => ({ ...prev, countries: true })); 
            try { 
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/address-management/country', getAuthConfig()); 
                const fetchedCountries = res.data?.data?.data || []; 
                setCountries(fetchedCountries); 
                if (mode === 'edit' && formData.country) { 
                    const match = fetchedCountries.find(c => c.name.toLowerCase() === formData.country.toLowerCase()); 
                    if (match) setLocationIds(prev => ({ ...prev, countryId: match.id })); 
                } 
            } catch (error) { 
                toast.error("Failed to load countries."); 
            } finally { 
                setIsLoadingLocation(prev => ({ ...prev, countries: false })); 
            } 
        }; 
        fetchCountries(); 
    }, [mode, formData.country]); 

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
                if (mode === 'edit' && formData.state) { 
                    const match = fetchedStates.find(s => s.name.toLowerCase() === formData.state.toLowerCase()); 
                    if (match) setLocationIds(prev => ({ ...prev, stateId: match.id })); 
                } 
            } catch (error) { 
                toast.error("Failed to load states."); 
            } finally { 
                setIsLoadingLocation(prev => ({ ...prev, states: false })); 
            } 
        }; 
        fetchStates(); 
    }, [locationIds.countryId, mode, formData.state]); 

    // --- Handlers --- 
    const handleInputChange = (e) => { 
        const { name, value, type, checked } = e.target; 
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); 
    }; 
    
    const validatePassword = (password) => { 
        if (!password) return null; 
        if (password.length < 6) return "Password must be at least 6 characters long."; 
        if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter."; 
        if (!/\d/.test(password)) return "Password must contain at least one number."; 
        if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character."; 
        return null; 
    }; 
    
    const handleInternalSubmit = (e) => { 
        e.preventDefault(); 
        if (mode === 'add' || formData.password) { 
            const passwordError = validatePassword(formData.password); 
            if (passwordError) return toast.error(passwordError); 
            if (formData.password !== formData.confirmPassword) { 
                return toast.error("Passwords do not match!"); 
            } 
        } 
        onSubmitForm({ ...formData, countryCode: activePhoneCountry.code }); 
    }; 

    // --- UPDATED INPUT STYLE ---
    const inputStyle = "h-[45px] px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black bg-white text-gray-900 text-[14px] w-full transition-colors"; 
    
    return ( 
        <form onSubmit={handleInternalSubmit} className="w-full max-w-[1200px] bg-white border border-[#e2e8f0] rounded-[8px] p-8 shadow-sm"> 
            {/* SECTION 1: SHIPPING ADDRESS */} 
            <div className="mb-10"> 
                <h3 className="text-[20px] font-bold text-[#86644c] mb-6">1. Shipping Address</h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5"> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Address Line 1</label> 
                        <input type="text" name="addressLineOne" value={formData.addressLineOne} onChange={handleInputChange} placeholder="Enter address line 1" required className={inputStyle} /> 
                    </div> 
                    <div className="grid grid-cols-2 gap-4"> 
                        <div className="flex flex-col gap-2"> 
                            <label className="text-[14px] font-medium text-gray-900">Country</label> 
                            <CustomSelect options={countries} value={locationIds.countryId} onChange={(opt) => { setLocationIds(prev => ({ ...prev, countryId: opt.id, stateId: '' })); setFormData(prev => ({ ...prev, country: opt.name, state: '' })); }} placeholder={isLoadingLocation.countries ? "Loading..." : "Select Country"} /> 
                        </div> 
                        <div className="flex flex-col gap-2"> 
                            <label className="text-[14px] font-medium text-gray-900">State</label> 
                            <CustomSelect options={states} value={locationIds.stateId} disabled={!locationIds.countryId || isLoadingLocation.states} onChange={(opt) => { setLocationIds(prev => ({ ...prev, stateId: opt.id })); setFormData(prev => ({ ...prev, state: opt.name })); }} placeholder={!locationIds.countryId ? "Select Country" : "Select State"} /> 
                        </div> 
                    </div> 
                </div> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Address Line 2</label> 
                        <input type="text" name="addressLineTwo" value={formData.addressLineTwo} onChange={handleInputChange} placeholder="Enter address line 2" className={inputStyle} /> 
                    </div> 
                    <div className="grid grid-cols-2 gap-4"> 
                        <div className="flex flex-col gap-2"> 
                            <label className="text-[14px] font-medium text-gray-900">Town / City</label> 
                            <input type="text" name="town" value={formData.town} onChange={handleInputChange} placeholder="Enter town" required className={inputStyle} /> 
                        </div> 
                        <div className="flex flex-col gap-2"> 
                            <label className="text-[14px] font-medium text-gray-900">Zip Code</label> 
                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter Zip Code" required className={inputStyle} /> 
                        </div> 
                    </div> 
                </div> 
                {mode === 'add' && ( 
                    <div className="flex items-center gap-2"> 
                        <input type="checkbox" id="billingSame" name="billingSameAsShipping" checked={formData.billingSameAsShipping} onChange={handleInputChange} className="w-[18px] h-[18px] cursor-pointer accent-[#86644c] bg-white border-gray-300 rounded" /> 
                        <label htmlFor="billingSame" className="text-[14px] font-medium text-gray-900 cursor-pointer">Billing Address same as Shipping Address</label> 
                    </div> 
                )} 
            </div> 
            
            {/* SECTION 2: COMPANY DETAILS */} 
            <div className="mb-10"> 
                <h3 className="text-[20px] font-bold text-[#86644c] mb-6">2. Company Details</h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5"> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Company Name</label> 
                        <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Enter Company Name" required className={inputStyle} /> 
                    </div> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Sale Tax Number (if applicable)</label> 
                        <input type="text" name="saleTaxNumber" value={formData.saleTaxNumber} onChange={handleInputChange} placeholder="Enter sale tax number" className={inputStyle} /> 
                    </div> 
                </div> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Dispatch Email</label> 
                        <input type="email" name="dispatchEmail" value={formData.dispatchEmail} onChange={handleInputChange} placeholder="xyz@gmail.com" required className={inputStyle} /> 
                    </div> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Invoice Email</label> 
                        <input type="email" name="emailToSendInvoices" value={formData.emailToSendInvoices} onChange={handleInputChange} placeholder="abc@gmail.com" required className={inputStyle} /> 
                    </div> 
                </div> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                    <div className="flex flex-col gap-2 relative" ref={phoneDropdownRef}> 
                        <label className="text-[14px] font-medium text-gray-900">Phone number</label> 
                        <div className="flex h-[45px] items-center gap-3"> 
                            <div onClick={() => setIsPhoneOpen(!isPhoneOpen)} className="w-[115px] h-full bg-white border border-[#e2e8f0] rounded-[4px] flex items-center justify-between px-3 cursor-pointer hover:bg-gray-50 focus-within:border-black transition-colors" > 
                                <div className="flex items-center gap-1.5"> 
                                    <ActiveFlag className="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-gray-100" /> 
                                    <div className="flex items-center flex-shrink-0 text-gray-400"> 
                                        <svg className={`w-3.5 h-3.5 fill-current transition-transform duration-200 ${isPhoneOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg> 
                                    </div> 
                                </div> 
                                <span className="w-[1px] h-5 bg-[#e2e8f0]"></span> 
                                <span className="text-[14px] font-medium text-gray-900">{activePhoneCountry.code}</span> 
                            </div> 
                            <input type="number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Enter Phone Number" required className={`flex-1 ${inputStyle}`} /> 
                            {isPhoneOpen && ( 
                                <div className="absolute top-[75px] left-0 w-[300px] bg-brand-brown rounded-[4px] shadow-xl z-50 max-h-[220px] overflow-y-auto"> 
                                    {allCountries.map((item) => { 
                                        const ItemFlag = item.Flag; 
                                        return ( 
                                            <div 
                                                key={item.iso} 
                                                onClick={() => { setSelectedPhoneIso(item.iso); setIsPhoneOpen(false); }} 
                                                className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 text-[14px] transition-colors text-white hover:bg-input-hover ${ selectedPhoneIso === item.iso ? 'bg-brand-brown-hover font-semibold' : '' }`} 
                                            > 
                                                <ItemFlag className="w-5 h-[14px] object-cover rounded-[1px] shadow-sm" /> 
                                                <span className="flex-1 truncate">{item.name}</span> 
                                                <span className="text-white/80">{item.code}</span> 
                                            </div> 
                                        ) 
                                    })} 
                                </div> 
                            )} 
                        </div> 
                    </div> 
                </div> 
            </div> 
            
            {/* SECTION 3: USER DETAILS */} 
            <div className="mb-10"> 
                <h3 className="text-[20px] font-bold text-[#86644c] mb-6">3. User Details</h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5"> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Full Name / Contact Name</label> 
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Name" required className={inputStyle} /> 
                    </div> 
                    <div className="flex flex-col gap-2 relative"> 
                        <label className="text-[14px] font-medium text-gray-900"> Password {mode === 'edit' && <span className="text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>} </label> 
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter Password" required={mode === 'add'} className={inputStyle} /> 
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[40px] text-gray-500 hover:text-black focus:outline-none"> 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{showPassword ? ( <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> ) : ( <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> )}</svg> 
                        </button> 
                    </div> 
                </div> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                    <div className="flex flex-col gap-2"> 
                        <label className="text-[14px] font-medium text-gray-900">Login Email / Contact Email</label> 
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" required className={inputStyle} /> 
                    </div> 
                    <div className="flex flex-col gap-2 relative"> 
                        <label className="text-[14px] font-medium text-gray-900">Confirm Password</label> 
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Enter password again" required={mode === 'add' || formData.password.length > 0} className={inputStyle} /> 
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[40px] text-gray-500 hover:text-black focus:outline-none"> 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{showConfirmPassword ? ( <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> ) : ( <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> )}</svg> 
                        </button> 
                    </div> 
                </div> 
            </div> 
            
            <div className="pt-4 pb-2"> 
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-[200px] h-[48px] bg-[#86644c] text-white text-[16px] font-medium rounded-[4px] hover:bg-[#735541] disabled:opacity-50 transition-colors" 
                > 
                    {isSubmitting ? 'Submitting...' : mode === 'edit' ? 'Update Customer' : 'Submit'} 
                </button> 
            </div> 
        </form> 
    ); 
};