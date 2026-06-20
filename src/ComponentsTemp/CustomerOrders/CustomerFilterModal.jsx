import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 

// --- Helper Dropdown Component ---
const FilterDropdown = ({ value, onChange, options, placeholder = "Select", disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label || placeholder;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full h-[46px] px-4 bg-white border ${isOpen ? 'border-[#3b82f6]' : 'border-gray-300'} rounded-[8px] transition-colors cursor-pointer ${disabled ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'hover:border-[#3b82f6]'}`}
            >
                <span className="text-[14px] text-gray-800 truncate select-none">{selectedLabel}</span>
                <div className="flex items-center flex-shrink-0">
                    <span className="w-[1px] h-5 bg-gray-200 mx-2"></span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? '' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Menu (Drops downwards, z-index ensures it sits on top) */}
            {isOpen && !disabled && (
                <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white border border-gray-200 shadow-lg rounded-[8px] py-1 z-[99999] max-h-[250px] overflow-y-auto">
                    <div 
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value === '' ? 'bg-[#3b82f6] text-white' : 'text-gray-800 hover:bg-[#eff6ff]'}`}
                    >
                        Select
                    </div>
                    {options.map((opt) => (
                        <div 
                            key={opt.value} 
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${String(value) === String(opt.value) ? 'bg-[#3b82f6] text-white' : 'text-gray-800 hover:bg-[#eff6ff]'}`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const CustomerFilterModal = ({ isOpen, onClose, onApply }) => { 
    // --- Local Filter States --- 
    const [invoice, setInvoice] = useState(''); 
    const [partnerId, setPartnerId] = useState(''); 
    
    // Employee specifically needs a 2-step state based on your requirements 
    const [employeeType, setEmployeeType] = useState(''); 
    const [specificEmployeeId, setSpecificEmployeeId] = useState(''); 
    
    // --- API Data States --- 
    const [employeesList, setEmployeesList] = useState([]); 
    const [partnersList, setPartnersList] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(false); 
    
    useEffect(() => { 
        if (!isOpen) return; 
        const fetchDropdownData = async () => { 
            setIsLoadingData(true); 
            try { 
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }; 
                const [empRes, partRes] = await Promise.all([ 
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/employees', config).catch(() => ({ data: { data: { data: [] } } })), 
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep', config).catch(() => ({ data: { data: { data: [] } } })) 
                ]); 
                setEmployeesList(empRes.data?.data?.data || []); 
                setPartnersList(partRes.data?.data?.data || []); 
            } catch (error) { 
                console.error("Failed to load dropdown data", error); 
            } finally { 
                setIsLoadingData(false); 
            } 
        }; 
        fetchDropdownData(); 
    }, [isOpen]); 
    
    const handleApply = () => { 
        let finalEmployee = ''; 
        let finalEmployeeName = ''; 
        
        if (employeeType === 'assigned') { 
            finalEmployee = 'assigned'; 
            finalEmployeeName = 'Assigned'; 
        } else if (employeeType === 'not-assigned') { 
            finalEmployee = 'not-assigned'; 
            finalEmployeeName = 'Not Assigned'; 
        } else if (employeeType === 'specific') { 
            finalEmployee = specificEmployeeId; 
            const emp = employeesList.find(e => String(e.id) === String(specificEmployeeId)); 
            finalEmployeeName = emp ? emp.name : specificEmployeeId; 
        } 
        
        const part = partnersList.find(p => String(p.id) === String(partnerId)); 
        const finalPartnerName = part ? part.srName : partnerId; 
        
        onApply({ 
            invoice: invoice, 
            employee: finalEmployee, 
            employeeName: finalEmployeeName, 
            partnerId: partnerId, 
            partnerName: finalPartnerName 
        }); 
        onClose(); 
    }; 
    
    if (!isOpen) return null; 

    return ( 
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center transition-all font-sans" onClick={onClose}> 
            {/* Removed overflow-hidden so dropdowns can break out of the modal boundaries */}
            <div 
                className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            > 
                {/* Header */} 
                <div className="flex items-center justify-between p-6 shrink-0"> 
                    <div className="text-xl font-bold text-gray-900">Filters</div> 
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none"> 
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                            <path d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z" fill="currentColor" /> 
                        </svg> 
                    </button> 
                </div> 

                {/* Body - Removed overflow-y-auto so the absolute dropdowns are not clipped inside */} 
                <div className="px-6 pb-8 flex flex-col gap-6"> 
                    
                    {/* Invoice Filter */} 
                    <div className="space-y-2 relative"> 
                        <label className="block text-sm font-medium text-gray-600">Invoice</label> 
                        <FilterDropdown 
                            value={invoice}
                            onChange={setInvoice}
                            options={[
                                { value: 'sent', label: 'Sent' },
                                { value: 'not-sent', label: 'Not Sent' }
                            ]}
                        />
                    </div> 

                    {/* Employee Filter */} 
                    <div className="space-y-2 relative"> 
                        <label className="block text-sm font-medium text-gray-600">Employee</label> 
                        <FilterDropdown 
                            value={employeeType}
                            onChange={(val) => {
                                setEmployeeType(val);
                                if (val !== 'specific') setSpecificEmployeeId('');
                            }}
                            options={[
                                { value: 'assigned', label: 'Assigned' },
                                { value: 'not-assigned', label: 'Not Assigned' },
                                { value: 'specific', label: 'Select Employee' }
                            ]}
                        />
                        
                        {employeeType === 'specific' && ( 
                            <div className="pt-2 animate-fade-in-up relative">
                                <FilterDropdown 
                                    value={specificEmployeeId}
                                    onChange={setSpecificEmployeeId}
                                    disabled={isLoadingData}
                                    placeholder="Select Employee"
                                    options={employeesList.map(emp => ({ value: emp.id, label: emp.name }))}
                                />
                            </div>
                        )} 
                    </div> 

                    {/* Partner Filter */} 
                    <div className="space-y-2 relative"> 
                        <label className="block text-sm font-medium text-gray-600">Select a partner</label> 
                        <FilterDropdown 
                            value={partnerId}
                            onChange={setPartnerId}
                            disabled={isLoadingData}
                            options={partnersList.map(p => ({ value: p.id, label: p.srName }))}
                        />
                    </div> 
                </div> 

                {/* Footer */} 
                <div className="p-6 shrink-0 flex items-center justify-end border-t border-gray-100 bg-white rounded-b-2xl z-0"> 
                    <div className="flex gap-3"> 
                        <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 rounded-[8px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button> 
                        <button onClick={handleApply} className="px-8 py-2.5 bg-[#86644c] border border-[#86644c] rounded-[8px] text-sm font-medium text-white hover:bg-[#735541] transition-colors shadow-sm">
                            Done
                        </button> 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
};