import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en.json';
import Flags from 'react-phone-number-input/flags';

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

    const filteredOptions = options.filter(o => 
        o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full font-sans" ref={wrapperRef}>
            <div 
                className={`flex items-center justify-between h-[45px] px-4 border rounded-[4px] bg-white transition-colors cursor-text ${
                    disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'border-[#e2e8f0] focus-within:border-black'
                }`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full h-full bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-400"
                />
                <div className="flex items-center flex-shrink-0 cursor-pointer" onClick={() => !disabled && setIsOpen(!isOpen)}>
                    <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span>
                    <div className={`p-1 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" />
                        </svg>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[4px] shadow-lg z-50 max-h-[220px] overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.id}
                                onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
                                className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${
                                    String(value) === String(opt.id) ? 'bg-[#614530] text-white' : 'text-gray-800 hover:bg-[#86644c] hover:text-white'
                                }`}
                            >
                                {opt.name}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-[14px] text-gray-500 italic">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- SIMPLE INPUT COMPONENT ---
const InputField = ({ label, name, type = "text", value, onChange, placeholder, required }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="h-[45px] px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] bg-white transition-colors w-full"
        />
    </div>
);

// ==============================================
// MAIN REUSABLE FORM COMPONENT
// ==============================================
export const SupplierForm = ({ mode = 'add', initialData = {}, onSubmitForm, isSubmitting }) => {
    
    const [formData, setFormData] = useState({
        supplierName: initialData.supplierName || '',
        businessWeb: initialData.businessWeb || '',
        supplierType: initialData.supplierType || 'Wholesale',
        status: initialData.status !== undefined ? String(initialData.status) : 'false',
        registerDate: initialData.registerDate || '',
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        zipCode: initialData.zipCode || '',
        addressOne: initialData.addressOne || '',
        addressTwo: initialData.addressTwo || '',
        phoneNum: initialData.phoneNum || '',
        bankAccount: initialData.bankAccount || '',
        email: initialData.email || '',
        password: '', 
        countryCode: initialData.countryCode || '+1'
    });

    // --- Dynamic Countries List ---
    const allCountries = getCountries().map(iso => ({
        iso,
        name: en[iso],
        code: `+${getCountryCallingCode(iso)}`,
        Flag: Flags[iso]
    }));

    // --- FIX 2: Resolving Country Code Collisions ---
    // Forces +1 to be US, +44 to be UK, etc. instead of the first alphabetical match.
    const priorityCountryDefaults = {
        '+1': 'US',
        '+44': 'GB',
        '+61': 'AU',
        '+7': 'RU',
        '+33': 'FR'
    };
    
    let initialIso = priorityCountryDefaults[formData.countryCode];
    if (!initialIso) {
        initialIso = allCountries.find(c => c.code === formData.countryCode)?.iso || 'US';
    }

    // --- UI/UX States ---
    const [imagePreview, setImagePreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isCustomCity, setIsCustomCity] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Phone Dropdown State
    const [isPhoneOpen, setIsPhoneOpen] = useState(false);
    const [selectedPhoneIso, setSelectedPhoneIso] = useState(initialIso);
    const phoneDropdownRef = useRef(null);

    const activePhoneCountry = allCountries.find(c => c.iso === selectedPhoneIso) || allCountries[0];
    const ActiveFlag = activePhoneCountry.Flag;

    // --- API States ---
    const [locationIds, setLocationIds] = useState({ countryId: '', stateId: '', cityId: '' });
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState({ countries: false, states: false, cities: false });

    useEffect(() => {
        const handleClickOutsidePhone = (event) => {
            if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) setIsPhoneOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutsidePhone);
        return () => document.removeEventListener('mousedown', handleClickOutsidePhone);
    }, []);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // --- Fetch Location Data ---
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingLocation(prev => ({ ...prev, countries: true }));
            try {
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/address-management/country', getAuthConfig());
                const fetchedCountries = res.data?.data?.data || [];
                setCountries(fetchedCountries);

                if (mode === 'edit' && formData.country) {
                    const match = fetchedCountries.find(c => c.name.toLowerCase() === formData.country.toLowerCase());
                    if (match) setLocationIds(prev => ({ ...prev, countryId: match.id }));
                }
            } catch (error) { toast.error("Failed to load countries."); } 
            finally { setLoadingLocation(prev => ({ ...prev, countries: false })); }
        };
        fetchCountries();
    }, [mode, formData.country]);

    useEffect(() => {
        if (!locationIds.countryId) { setStates([]); setCities([]); return; }
        const fetchStates = async () => {
            setLoadingLocation(prev => ({ ...prev, states: true }));
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/state?countryInSystemId=${locationIds.countryId}`, getAuthConfig());
                const fetchedStates = res.data?.data?.data || [];
                setStates(fetchedStates);

                if (mode === 'edit' && formData.state) {
                    const match = fetchedStates.find(s => s.name.toLowerCase() === formData.state.toLowerCase());
                    if (match) setLocationIds(prev => ({ ...prev, stateId: match.id }));
                }
            } catch (error) { toast.error("Failed to load states."); } 
            finally { setLoadingLocation(prev => ({ ...prev, states: false })); }
        };
        fetchStates();
    }, [locationIds.countryId, mode, formData.state]);

    useEffect(() => {
        if (!locationIds.stateId || isCustomCity) { setCities([]); return; }
        const fetchCities = async () => {
            setLoadingLocation(prev => ({ ...prev, cities: true }));
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/city?stateInSystemId=${locationIds.stateId}`, getAuthConfig());
                const fetchedCities = res.data?.data?.data || [];
                setCities(fetchedCities);

                // --- FIX 1: Custom City Auto-Match Fix ---
                // Removed the `fetchedCities.length > 0` condition so this triggers even if the DB has zero cities!
                if (mode === 'edit' && formData.city) {
                    const match = fetchedCities.find(c => c.name.toLowerCase() === formData.city.toLowerCase());
                    if (match) {
                        setLocationIds(prev => ({ ...prev, cityId: match.id }));
                    } else {
                        // Automatically flip to text input if it's not in the dropdown list
                        setIsCustomCity(true);
                    }
                }
            } catch (error) { toast.error("Failed to load cities."); } 
            finally { setLoadingLocation(prev => ({ ...prev, cities: false })); }
        };
        fetchCities();
    }, [locationIds.stateId, mode, formData.city]); // isCustomCity safely removed from dependency array

    // --- Handlers ---
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleImageChange = (e) => { const file = e.target.files[0]; if (file) setImagePreview(URL.createObjectURL(file)); };

    const handleInternalSubmit = (e) => {
        e.preventDefault();
        onSubmitForm({
            ...formData,
            countryCode: activePhoneCountry.code,
            isUpdatingPassword 
        });
    };

    return (
        <form onSubmit={handleInternalSubmit} className="w-full max-w-[1152px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                
                {/* LEFT COLUMN: Section 1 & 3 */}
                <div className="flex flex-col gap-8">
                    
                    {/* SECTION 1: BASIC INFORMATION */}
                    <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-8 shadow-sm">
                        <h3 className="text-[18px] font-semibold text-black mb-6">1. Basic Information</h3>
                        <div className="mb-6 relative w-[80px] h-[80px] border border-gray-300 rounded-[12px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden">
                            <input type="file" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {imagePreview ? ( <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" /> ) : ( <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" /><path d="M14 19.5L17 16.5L20 19.5" /><path d="M17 22V16.5" /><circle cx="9" cy="9" r="2" /></svg> )}
                        </div>
                        <div className="flex flex-col gap-5">
                            <InputField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleInputChange} placeholder="Enter Supplier Name" required />
                            <InputField label="Business website" name="businessWeb" value={formData.businessWeb} onChange={handleInputChange} placeholder="Enter Business name" />
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-medium text-black">Supplier type</label>
                                <div className="relative">
                                    <select name="supplierType" value={formData.supplierType} onChange={handleInputChange} className="w-full h-[45px] px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] bg-white appearance-none cursor-pointer"><option value="Wholesale">Wholesale</option></select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500"><span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg></div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-medium text-black">Status</label>
                                <div className="relative">
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-[45px] px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] bg-white appearance-none cursor-pointer"><option value="true">Active</option><option value="false">Inactive</option></select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500"><span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg></div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[14px] font-medium text-black">Register Date</label>
                                <input type="date" name="registerDate" value={formData.registerDate} onChange={handleInputChange} className="h-[45px] px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] bg-white w-full uppercase" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: BANK & LOGIN DETAILS */}
                    <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-8 shadow-sm">
                        <h3 className="text-[18px] font-semibold text-black mb-6">3. Bank & Login Details</h3>
                        <div className="flex flex-col gap-5">
                            <InputField label="Bank Account Detail" name="bankAccount" value={formData.bankAccount} onChange={handleInputChange} placeholder="Enter Valid IBAN Number" />
                            <InputField label="Login Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter Email" required />
                            
                            {/* --- CONDITIONAL PASSWORD LOGIC --- */}
                            {mode === 'edit' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" id="updatePassword" checked={isUpdatingPassword} onChange={() => setIsUpdatingPassword(!isUpdatingPassword)} className="w-4 h-4 cursor-pointer" />
                                    <label htmlFor="updatePassword" className="text-[14px] font-medium text-gray-700 cursor-pointer">Update Password</label>
                                </div>
                            )}

                            {(mode === 'add' || isUpdatingPassword) && (
                                <div className="flex flex-col gap-2 relative animate-fade-in-up">
                                    <label className="text-[14px] font-medium text-black">Password <span className="text-red-500">*</span></label>
                                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter new password" required className="h-[45px] pl-4 pr-12 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] w-full" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[35px] text-gray-500 hover:text-black focus:outline-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{showPassword ? ( <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> ) : ( <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> )}</svg>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Section 2 */}
                <div className="flex flex-col gap-8">
                    <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-8 shadow-sm h-max ">
                        <h3 className="text-[18px] font-semibold text-black mb-6">2. Contact Information</h3>
                        <div className="grid grid-cols-2 gap-6 mb-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-medium text-black">Country</label>
                                <CustomSelect options={countries} value={locationIds.countryId} onChange={(opt) => { setLocationIds(prev => ({ ...prev, countryId: opt.id, stateId: '', cityId: '' })); setFormData(prev => ({ ...prev, country: opt.name, state: '', city: '' })); }} placeholder={loadingLocation.countries ? "Loading..." : "Select Country"} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-medium text-black">State</label>
                                <CustomSelect options={states} value={locationIds.stateId} disabled={!locationIds.countryId || loadingLocation.states} onChange={(opt) => { setLocationIds(prev => ({ ...prev, stateId: opt.id, cityId: '' })); setFormData(prev => ({ ...prev, state: opt.name, city: '' })); }} placeholder={!locationIds.countryId ? "Select Country First" : "Select State"} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[14px] font-medium text-black">City</label>
                                {isCustomCity ? (
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter Custom City" className="h-[45px] px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] bg-white w-full" />
                                ) : (
                                    <CustomSelect options={cities} value={locationIds.cityId} disabled={!locationIds.stateId || loadingLocation.cities} onChange={(opt) => { setLocationIds(prev => ({ ...prev, cityId: opt.id })); setFormData(prev => ({ ...prev, city: opt.name })); }} placeholder={!locationIds.stateId ? "Select State First" : "Select City"} />
                                )}
                                <div className="absolute -bottom-8 right-0">
                                    <button type="button" onClick={() => { setIsCustomCity(!isCustomCity); setFormData(prev => ({ ...prev, city: '' })); }} className="text-[13px] font-medium text-[#86644c] bg-white border border-[#86644c] px-3 py-1 rounded-[4px] hover:bg-[#86644c] hover:text-white transition-colors shadow-sm" >
                                        {isCustomCity ? "Back to Select" : "Enter Custom City Name"}
                                    </button>
                                </div>
                            </div>
                            <InputField label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter Zip code" />
                        </div>

                        <div className="flex flex-col gap-5 mt-6">
                            <InputField label="Address 1" name="addressOne" value={formData.addressOne} onChange={handleInputChange} placeholder="Enter Address 1" />
                            <InputField label="Address 2" name="addressTwo" value={formData.addressTwo} onChange={handleInputChange} placeholder="Enter Address 2" />
                            
                            <div className="flex flex-col gap-2 relative" ref={phoneDropdownRef}>
                                <label className="text-[14px] font-medium text-black">Phone number</label>
                                <div className="flex h-[45px] items-center gap-3">
                                    
                                    <div onClick={() => setIsPhoneOpen(!isPhoneOpen)} className="w-[115px] h-full border border-gray-300 rounded-[4px] bg-white flex items-center justify-between px-3 cursor-pointer hover:bg-gray-50 transition-colors" >
                                        <div className="flex items-center gap-1.5">
                                            <ActiveFlag className="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-gray-100" />
                                            <div className="flex items-center flex-shrink-0 text-gray-400">
                                                <svg className={`w-3.5 h-3.5 fill-current transition-transform duration-200 ${isPhoneOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 Z" /></svg>
                                            </div>
                                        </div>
                                        <span className="w-[1px] h-5 bg-[#e2e8f0]"></span>
                                        <span className="text-[14px] font-medium text-gray-700">{activePhoneCountry.code}</span>
                                    </div>

                                    <input type="number" name="phoneNum" value={formData.phoneNum} onChange={handleInputChange} placeholder="Enter Phone Number" className="flex-1 h-full px-4 border border-[#e2e8f0] rounded-[4px] focus:outline-none focus:border-black text-black text-[14px] bg-white transition-colors" />

                                    {isPhoneOpen && (
                                        <div className="absolute top-[75px] left-0 w-[300px] bg-[#86644c] border border-[#735541] rounded-[4px] shadow-lg z-50 max-h-[220px] overflow-y-auto">
                                            {allCountries.map((item) => {
                                                const ItemFlag = item.Flag;
                                                return (
                                                    <div key={item.iso} onClick={() => { setSelectedPhoneIso(item.iso); setIsPhoneOpen(false); }} className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 text-[14px] transition-colors ${ selectedPhoneIso === item.iso ? 'bg-[#f4f4f4] text-black' : 'text-white hover:bg-[#a68266]' }`} >
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
                    </div>
                </div>

            </div>

            <button type="submit" disabled={isSubmitting} className="w-full h-[48px] bg-[#86644c] text-white text-[16px] font-medium rounded-[4px] hover:bg-[#735541] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" >
                {isSubmitting ? 'Processing...' : mode === 'edit' ? 'Update Supplier' : 'Add Supplier'}
            </button>
        </form>
    );
};