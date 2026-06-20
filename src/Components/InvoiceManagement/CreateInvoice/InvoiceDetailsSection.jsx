import React, { useState, useRef, useEffect } from 'react'; 

// --- Custom Dropdown Component ---
const CustomSelect = ({ options, value, onChange, placeholder, disabled, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = isLoading ? "Loading options..." : (selectedOption ? selectedOption.label : placeholder);

    return (
        <div className="relative w-full font-sans" ref={dropdownRef}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full h-[42px] px-3 bg-white border ${
                    disabled 
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-300 hover:border-[#86644c] cursor-pointer text-gray-900 focus-within:border-[#86644c] focus-within:ring-1 focus-within:ring-[#86644c]'
                } rounded-[6px] text-[14px] flex items-center justify-between outline-none transition-all`}
            >
                <span className="truncate pr-2">{displayLabel}</span>
                <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#86644c]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-brand-brown rounded-md shadow-lg z-50 max-h-[250px] overflow-y-auto custom-scrollbar py-1">
                    {options.length > 0 ? (
                        options.map((opt) => (
                            <div 
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`px-3 py-2.5 text-[14px] cursor-pointer text-white hover:bg-input-hover transition-colors ${
                                    String(opt.value) === String(value) ? 'bg-brand-brown-hover font-semibold' : ''
                                }`}
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-3 text-[14px] text-white/70 italic text-center">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- Main Component ---
export const InvoiceDetailsSection = ({ 
    viewProductsToggle, 
    invoiceTypeToggle, 
    setInvoiceTypeToggle, 
    customersList, 
    partnersList, 
    partnerLinkedCustomers, 
    selectedCompanyId, 
    handleCompanySelection, 
    selectedCompanyData, 
    formData, 
    setFormData, 
    handleTopPOChange, 
    handleSupplierNoteChange, 
    isLoading 
}) => { 

    // 1. Prepare Company Options
    let companyOptions = [];
    if (!isLoading) {
        if (viewProductsToggle === 'partner') { 
            companyOptions = (partnerLinkedCustomers || []).map(item => ({
                value: item.id,
                label: `${item.companyName || 'No Company'} (${item.name || 'Unknown'})`
            }));
        } else {
            const list = invoiceTypeToggle === 'Customers' ? customersList : partnersList; 
            companyOptions = (list || []).map(item => ({
                value: item.id,
                label: invoiceTypeToggle === 'Customers'
                    ? `${item.companyName || 'No Company'} (${item.name || 'Unknown'})`
                    : `${item.srName || 'No Name'} (${item.territoryName || 'No Territory'})`
            }));
        }
    }

    // 2. Prepare Address Options
    const availableAddresses = selectedCompanyData?.addresses || []; 
    const addressOptions = availableAddresses.map(addr => ({
        value: addr.id,
        label: `${addr.addressLineOne}, ${addr.town}, ${addr.state} ${addr.zipCode}`
    }));

    // 3. Prepare Payment Options
    const paymentOptions = [
        { value: 'Bank Check', label: 'Bank Check' },
        { value: 'Card', label: 'Card' }
    ];

    const dropdownLabel = (viewProductsToggle === 'partner' || invoiceTypeToggle === 'Customers') ? 'Company Name' : 'Partner Name'; 

    return ( 
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-6 md:p-8 font-sans w-full"> 
            
            {/* --- Header --- */}
            <div className="flex justify-between items-center mb-4"> 
                <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2> 
            </div> 

            {/* --- Toggle Switch (Admin Only) --- */}
            {viewProductsToggle === 'admin' && ( 
                <div className="flex items-center gap-x-3 justify-end mb-4"> 
                    <label className={`font-medium text-[15px] transition-colors ${invoiceTypeToggle === 'Customers' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Customers
                    </label> 
                    <div 
                        onClick={() => setInvoiceTypeToggle(prev => prev === 'Customers' ? 'Partners' : 'Customers')} 
                        className="relative inline-block text-left w-14 h-7 rounded-full cursor-pointer transition-colors duration-250 ease-in-out"
                        style={{ backgroundColor: invoiceTypeToggle === 'Partners' ? '#86644c' : '#888888' }}
                    > 
                        <div 
                            className={`absolute top-[1px] left-[1px] w-[26px] h-[26px] bg-white rounded-full shadow-sm transform transition-transform duration-250 ease-in-out ${invoiceTypeToggle === 'Partners' ? 'translate-x-[28px]' : 'translate-x-0'}`}
                        ></div> 
                    </div> 
                    <label className={`font-medium text-[15px] transition-colors ${invoiceTypeToggle === 'Partners' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Partners
                    </label> 
                </div> 
            )} 

            {/* --- Form Body --- */}
            <div className="space-y-6 border-t border-gray-200 pt-6 mt-6"> 
                
                {/* Dynamic Dropdown (CustomSelect) */}
                <div className="flex flex-col gap-y-2"> 
                    <label className="text-gray-700 font-medium text-[14px]">{dropdownLabel}</label> 
                    <CustomSelect 
                        options={companyOptions}
                        value={selectedCompanyId}
                        onChange={handleCompanySelection}
                        placeholder={`Select ${dropdownLabel}`}
                        isLoading={isLoading}
                    />
                </div> 

                {/* Email Input */}
                <div className="flex flex-col gap-y-2"> 
                    <label className="text-gray-700 font-medium text-[14px]">Email</label> 
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={formData.email} 
                        onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-[6px] px-3 py-3 outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] text-[14px] transition-all" 
                    /> 
                </div> 

                {/* Address Dropdown (CustomSelect) */}
                <div className="flex flex-col gap-y-2"> 
                    <label className="text-gray-700 font-medium text-[14px]">Address</label> 
                    <CustomSelect 
                        options={addressOptions}
                        value={formData.addressId}
                        onChange={(val) => setFormData(p => ({...p, addressId: val}))}
                        placeholder="Select Address"
                        disabled={!selectedCompanyData || availableAddresses.length === 0}
                    />
                </div> 

                {/* Payment Method Dropdown (CustomSelect) */}
                <div className="flex flex-col gap-y-2"> 
                    <label className="text-gray-700 font-medium text-[14px]">Payment Method</label> 
                    <CustomSelect 
                        options={paymentOptions}
                        value={formData.paymentMethod}
                        onChange={(val) => setFormData(p => ({...p, paymentMethod: val}))}
                        placeholder="Select Payment Method"
                    />
                </div> 

                {/* --- Floating Label Inputs (Stacked) --- */}
                <div className="mt-8 flex flex-col"> 
                    
                    {/* Note for Supplier */}
                    <div className="w-full text-base text-gray-800 flex items-center gap-3 px-5 py-[5px] transition-colors duration-300 border-2 border-gray-300 hover:border-[#86644c] focus-within:border-[#86644c] rounded-t-lg bg-white relative z-10"> 
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" className="text-gray-500 shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path>
                        </svg> 
                        <div className="relative w-full"> 
                            <input 
                                id="supplierNote" 
                                type="text" 
                                placeholder=" " 
                                value={formData.supplierNote} 
                                onChange={(e) => handleSupplierNoteChange(e.target.value)} 
                                className="w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer text-[15px] text-gray-900" 
                            /> 
                            <label 
                                htmlFor="supplierNote" 
                                className="absolute left-0 top-4 text-gray-400 transition-all cursor-text peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-gray-400 peer-focus:top-[4px] peer-focus:text-[12px] peer-focus:text-[#86644c]"
                                style={formData.supplierNote ? { top: '4px', fontSize: '12px', color: '#86644c' } : {}}
                            >
                                Add note for the supplier (optional)
                            </label> 
                        </div> 
                    </div> 

                    {/* PO Number */}
                    <div className="w-full text-base text-gray-800 flex items-center gap-3 px-5 py-[5px] transition-colors duration-300 border-2 border-gray-300 hover:border-[#86644c] focus-within:border-[#86644c] rounded-b-lg border-t-0 bg-white relative z-0 hover:z-20 focus-within:z-20"> 
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" className="text-gray-500 shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M22 10V6a2 2 0 0 0-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"></path>
                        </svg> 
                        <div className="relative w-full"> 
                            <input 
                                id="poNumber" 
                                type="text" 
                                placeholder=" " 
                                value={formData.purchaseOrderNumber} 
                                onChange={(e) => handleTopPOChange(e.target.value)} 
                                className="w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer text-[15px] text-gray-900" 
                            /> 
                            <label 
                                htmlFor="poNumber" 
                                className="absolute left-0 top-4 text-gray-400 transition-all cursor-text peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-gray-400 peer-focus:top-[4px] peer-focus:text-[12px] peer-focus:text-[#86644c]"
                                style={formData.purchaseOrderNumber ? { top: '4px', fontSize: '12px', color: '#86644c' } : {}}
                            >
                                Add Purchase Order Number (optional)
                            </label> 
                        </div> 
                    </div> 

                </div> 
            </div> 
        </div> 
    ); 
};