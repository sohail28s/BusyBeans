import React, { useState, useRef, useEffect } from 'react';

const CustomerSelector = ({ customerList = [], activeCustomer, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayString = activeCustomer 
        ? `${activeCustomer.companyName} (${activeCustomer.name})` 
        : "Select a customer...";

    return (
        <div className="w-full max-w-[448px] font-sans pb-10 " ref={dropdownRef}>
            
            {/* LABEL */}
            <div className="flex items-center gap-2 mb-3 text-[14px] font-semibold text-[#374151]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#86644c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Select Customer
            </div>

            {/* MAIN DROPDOWN BOX */}
            <div className="relative">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between min-h-[52px] w-full bg-white border border-[#cccccc] rounded-lg px-2 cursor-pointer hover:border-gray-400 transition-colors"
                >
                    {/* Left Side (Icon + Text) */}
                    <div className="flex items-center gap-2 flex-1 overflow-hidden px-2">
                        <svg width="18" height="18" viewBox="0 0 512 512" fill="#9ca3af" className="flex-shrink-0">
                            <path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z" />
                            <path d="M256 304c-87 0-175.3 48-191.64 138.6-1.97 10.92 4.21 21.4 15.64 21.4h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z" />
                        </svg>
                        <span className="text-[16px] text-[#3e342c] truncate">
                            {displayString}
                        </span>
                    </div>

                    {/* Right Side (Clear & Arrow) */}
                    <div className="flex items-center gap-1">
                        {activeCustomer && (
                            <div 
                                onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                                className="p-2 text-[#cccccc] transition-colors cursor-pointer"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.03c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.698L8.41 10.001 5.651 6.849c-.469-.469-.469-1.229 0-1.697s1.229-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.229-.469 1.697 0s.469 1.229 0 1.697L11.59 10.001l2.758 3.15c.469.469.469 1.229 0 1.698z" />
                                </svg>
                            </div>
                        )}
                        <span className="w-[1px] h-6 bg-[#cccccc] mx-1"></span>
                        <div className="p-2 text-[#3e342c]">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4.516 7.548c.436-.446 1.043-.481 1.576 0L10 11.295l3.908-3.747c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502-.217.223-.502.335-.787.335s-.57-.112-.789-.335c0 0-4.287-4.084-4.695-4.502s-.436-1.17 0-1.615z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* DROPDOWN MENU */}
                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-input-brown text-white rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                            {customerList.length > 0 ? (
                                customerList.map(customer => (
                                    <div 
                                        key={customer.id}
                                        onClick={() => {
                                            onSelect(customer);
                                            setIsOpen(false);
                                        }}
                                        className="px-4 py-2.5 cursor-pointer hover:bg-input-hover text-white transition-colors"
                                    >
                                        <div className="font-medium">{customer.companyName}</div>
                                        <div className="text-xs opacity-80">{customer.name}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">No customers found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* STATUS MESSAGE (Green Dot) */}
            <div className="flex items-center gap-2 mt-3 text-[14px] text-[#4b5563]">
                <div className="w-2 h-2 bg-[#22c55e] rounded-full"></div>
                <span>
                    Customer selected: <span className="font-semibold text-[#111827]">{displayString}</span>
                </span>
            </div>
            
        </div>
    );
};

export default CustomerSelector;