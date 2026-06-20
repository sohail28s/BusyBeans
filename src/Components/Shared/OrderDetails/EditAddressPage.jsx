import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../../Hooks/useStore';
import { getAuthConfig } from '../../../utils/orderUtils';

const AddressInput = ({ label, name, value, onChange, isSelect = false, options = [], placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optValue) => {
        // Simulate a normal event object to keep the onChange handlers working seamlessly
        onChange({ target: { name, value: optValue } });
        setIsOpen(false);
    };

    if (isSelect) {
        const selectedLabel = options.find(o => o.value === value)?.label || placeholder || `Select ${label}`;
        
        return (
            <div className="w-full space-y-2 relative" ref={dropdownRef}>
                <p className="text-base text-black">{label}</p>
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    // Forced brand-brown text and border as requested
                    className="w-full h-12 bg-transparent outline-none border-2 text-black focus:border-[#86644C] focus:text-[#86644C] px-4 rounded-lg text-base flex items-center justify-between cursor-pointer"
                >
                    <span className="truncate">{selectedLabel}</span>
                    
                    {/* Your exact requested SVG & separator snippet */}
                    <div className="flex items-center">
                        <span className="w-[1px] h-5 bg-gray-300 mr-2 block"></span>
                        <div aria-hidden="true" focusable="false" className="flex items-center justify-center text-gray-400">
                            <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                                <path fill="currentColor" d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* The Custom Dropdown Options */}
                {isOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#86644C] rounded-b-md shadow-lg overflow-hidden">
                        {/* max-h-[200px] guarantees it scrolls after exactly 5 items (~40px each) */}
                        <ul className="w-full max-h-[200px] overflow-y-auto custom-scrollbar">
                            {options.length > 0 ? options.map((opt, idx) => (
                                <li 
                                    key={idx}
                                    onClick={() => handleSelect(opt.value)}
                                    className="px-4 py-2.5 text-white text-base cursor-pointer hover:bg-[#6c4f3b] transition-colors"
                                >
                                    {opt.label}
                                </li>
                            )) : (
                                <li className="px-4 py-2.5 text-white/70 text-base">No options available</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Standard Text Input Render
    return (
        <div className="w-full space-y-2">
            <p className="text-[14px] text-gray-800">{label}</p>
            <input 
                type="text" 
                name={name} 
                value={value || ''} 
                onChange={onChange} 
                placeholder={placeholder}
                // No border changes on focus!
                className="w-full h-12 bg-transparent outline-none border-2 px-4 border-gray-100 rounded-lg text-base text-black focus:outline-none focus:ring-0"
            />
        </div>
    );
};

export const EditOrderAddressesPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    // Global Store Actions
    const setTitle = useStore((state) => state.setTitle);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const setShowProfile = useStore((state) => state.setShowProfile);

    // Form States
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingShipping, setIsSavingShipping] = useState(false);
    const [isSavingBilling, setIsSavingBilling] = useState(false);

    // Dropdown Data States
    const [countries, setCountries] = useState([]);
    const [shippingStates, setShippingStates] = useState([]);
    const [billingStates, setBillingStates] = useState([]);

    const [shipping, setShipping] = useState({
        id: '', addressLineOne: '', addressLineTwo: '', country: '', state: '', town: '', zipCode: ''
    });

    const [billing, setBilling] = useState({
        id: '', addressLineOne: '', addressLineTwo: '', country: '', state: '', town: '', zipCode: ''
    });

    // Handle Profile Visibility
    useEffect(() => {
        setShowProfile(false);
        // Cleanup: Show profile again when navigating away from this page
        return () => setShowProfile(true); 
    }, [setShowProfile]);

    // --- Fetch initial Order Data ---
    const fetchAddressData = useCallback(async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/order-details/${id}`, getAuthConfig());
            
            if (res.data?.status === 'success' && res.data.data?.order) {
                const order = res.data.data.order;
                
                if (order.address) {
                    setShipping({
                        id: order.address.id || '',
                        addressLineOne: order.address.addressLineOne || '',
                        addressLineTwo: order.address.addressLineTwo || '',
                        country: order.address.country || '',
                        state: order.address.state || '',
                        town: order.address.town || '',
                        zipCode: order.address.zipCode || ''
                    });
                }

                const bAddr = order.user?.billingAddresses?.[0];
                if (bAddr) {
                    setBilling({
                        id: bAddr.id || '',
                        addressLineOne: bAddr.addressLineOne || '',
                        addressLineTwo: bAddr.addressLineTwo || '',
                        country: bAddr.country || '',
                        state: bAddr.state || '',
                        town: bAddr.town || '',
                        zipCode: bAddr.zipCode || ''
                    });
                }
            } else {
                toast.error("Failed to load address data.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching order details.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    }, [id, setIsGlobalLoading]);

    // Set Header Title
    useEffect(() => {
        setTitle(
            <div className="flex items-center gap-2">
                <span className="cursor-pointer hover:underline" onClick={() => navigate('/orders')}>Orders</span>
                <span>/</span>
                <span className="cursor-pointer hover:underline" onClick={() => navigate(`/orders/details/${id}`)}>{id}</span>
                <span>/</span>
                <span className="text-black font-semibold">Addresses</span>
            </div>
        );
        return () => setTitle('');
    }, [id, setTitle, navigate]);

    useEffect(() => {
        fetchAddressData();
    }, [fetchAddressData]);

    // --- Fetch Countries API ---
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/address-management/country', getAuthConfig());
                if (res.data?.status === 'success') {
                    setCountries(res.data.data?.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch countries", error);
            }
        };
        fetchCountries();
    }, []);

    // --- Helper to fetch states based on selected country name ---
    const loadStatesForCountry = useCallback(async (countryName, setStatesFunction) => {
        if (!countryName) {
            setStatesFunction([]);
            return;
        }
        const selectedCountry = countries.find(c => c.name === countryName);
        if (selectedCountry) {
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/state?countryInSystemId=${selectedCountry.id}`, getAuthConfig());
                if (res.data?.status === 'success') {
                    setStatesFunction(res.data.data?.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch states", error);
                setStatesFunction([]);
            }
        } else {
            setStatesFunction([]);
        }
    }, [countries]);

    // --- Watchers to update States array when Country changes ---
    useEffect(() => {
        loadStatesForCountry(shipping.country, setShippingStates);
    }, [shipping.country, loadStatesForCountry]);

    useEffect(() => {
        loadStatesForCountry(billing.country, setBillingStates);
    }, [billing.country, loadStatesForCountry]);

    // --- Input Change Handlers ---
    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShipping(prev => ({ 
            ...prev, [name]: value, ...(name === 'country' && { state: '' }) 
        }));
    };

    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBilling(prev => ({ 
            ...prev, [name]: value, ...(name === 'country' && { state: '' }) 
        }));
    };

    // --- Save Handlers ---
    const handleSaveShipping = async () => {
        if (!shipping.id) return toast.error("Shipping Address ID is missing.");
        setIsSavingShipping(true);
        const loadingId = toast.loading("Updating Shipping Address...");
        
        try {
            const payload = {
                companyaddress: "",
                addressLineOne: shipping.addressLineOne,
                addressLineTwo: shipping.addressLineTwo,
                town: shipping.town,
                country: shipping.country,
                state: shipping.state,
                zipCode: shipping.zipCode,
                status: true
            };
            
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/update-address/${shipping.id}`, payload, getAuthConfig());
            
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Shipping Address Updated Successfully!", type: "success", isLoading: false, autoClose: 2000 });
            } else {
                throw new Error("Failed to update.");
            }
        } catch (error) {
            toast.update(loadingId, { render: "Failed to update Shipping Address.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSavingShipping(false);
        }
    };

    const handleSaveBilling = async () => {
        if (!billing.id) return toast.error("Billing Address ID is missing.");
        setIsSavingBilling(true);
        const loadingId = toast.loading("Updating Billing Address...");
        
        try {
            const payload = {
                companyaddress: "",
                addressLineOne: billing.addressLineOne,
                addressLineTwo: billing.addressLineTwo,
                town: billing.town,
                country: billing.country,
                state: billing.state,
                zipCode: billing.zipCode,
                status: true
            };
            
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/address-management/update-billing-address/${billing.id}`, payload, getAuthConfig());
            
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Billing Address Updated Successfully!", type: "success", isLoading: false, autoClose: 2000 });
            } else {
                throw new Error("Failed to update.");
            }
        } catch (error) {
            toast.update(loadingId, { render: "Failed to update Billing Address.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSavingBilling(false);
        }
    };

    if (isLoading) return null; 

    const countryOptions = countries.map(c => ({ value: c.name, label: c.name }));
    const shippingStateOptions = shippingStates.map(s => ({ value: s.name, label: s.name }));
    const billingStateOptions = billingStates.map(s => ({ value: s.name, label: s.name }));

    return (
        <div className="w-full p-6 2xl:p-12 font-sans bg-white">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 py-8 px-8 border border-gray-200 bg-white shadow-sm rounded-sm">
                
                {/* --- Shipping Address Column --- */}
                <div className="w-full space-y-4">
                    <h4 className="font-semibold text-[16px] text-black">Shipping Address</h4>
                    
                    <div className="w-full space-y-4 pt-4">
                        <AddressInput label="Address Line 1" name="addressLineOne" value={shipping.addressLineOne} onChange={handleShippingChange} />
                        <AddressInput label="Address Line 2" name="addressLineTwo" value={shipping.addressLineTwo} onChange={handleShippingChange} />
                        
                        <div className="w-full grid grid-cols-2 gap-5">
                            <AddressInput label="Country" name="country" value={shipping.country} onChange={handleShippingChange} isSelect={true} options={countryOptions} />
                            <AddressInput label="State" name="state" value={shipping.state} onChange={handleShippingChange} isSelect={true} options={shippingStateOptions} />
                        </div>
                        
                        <div className="w-full grid grid-cols-2 gap-5">
                            <AddressInput label="Town / City" name="town" value={shipping.town} onChange={handleShippingChange} placeholder="Enter City" />
                            <AddressInput label="ZIP Code" name="zipCode" value={shipping.zipCode} onChange={handleShippingChange} />
                        </div>

                        <div className="pt-2">
                            <button 
                                onClick={handleSaveShipping} 
                                disabled={isSavingShipping}
                                className={`h-12 px-4 bg-[#86644C] text-white rounded-lg transition-colors ${isSavingShipping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6c4f3b]'}`}
                            >
                                {isSavingShipping ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Billing Address Column --- */}
                <div className="w-full space-y-4">
                    <h4 className="font-semibold text-[16px] text-black">Billing Address</h4>
                    
                    <div className="w-full space-y-4 pt-4">
                        <AddressInput label="Address Line 1" name="addressLineOne" value={billing.addressLineOne} onChange={handleBillingChange} />
                        <AddressInput label="Address Line 2" name="addressLineTwo" value={billing.addressLineTwo} onChange={handleBillingChange} />
                        
                        <div className="w-full grid grid-cols-2 gap-5">
                            <AddressInput label="Country" name="country" value={billing.country} onChange={handleBillingChange} isSelect={true} options={countryOptions} />
                            <AddressInput label="State" name="state" value={billing.state} onChange={handleBillingChange} isSelect={true} options={billingStateOptions} />
                        </div>
                        
                        <div className="w-full grid grid-cols-2 gap-5">
                            <AddressInput label="Town / City" name="town" value={billing.town} onChange={handleBillingChange} placeholder="Enter Billing City" />
                            <AddressInput label="ZIP Code" name="zipCode" value={billing.zipCode} onChange={handleBillingChange} />
                        </div>

                        <div className="pt-2">
                            <button 
                                onClick={handleSaveBilling} 
                                disabled={isSavingBilling}
                                className={`h-12 px-4 bg-[#86644C] text-white rounded-lg transition-colors ${isSavingBilling ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6c4f3b]'}`}
                            >
                                {isSavingBilling ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EditOrderAddressesPage;