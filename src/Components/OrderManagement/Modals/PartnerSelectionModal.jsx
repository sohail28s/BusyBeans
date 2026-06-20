import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const PartnerSelectionModal = ({ isOpen, onClose, onConfirm }) => {
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedPartner, setTempSelectedPartner] = useState(null);
    
    const dropdownRef = useRef(null);

    // Fetch Partners when Modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchPartners = async () => {
                setIsLoading(true);
                try {
                    const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                    });
                    if (res.data.status === 'success') {
                        setPartners(res.data.data.data || []);
                    }
                } catch (error) {
                    console.error("Error fetching partners:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPartners();
            setTempSelectedPartner(null); // Reset selection on open
            setSearchTerm('');
        }
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const filteredPartners = partners.filter(p => {
        const fullName = `${p.srName} (${p.territoryName?.trim() || 'N/A'})`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const handleConfirm = () => {
        if (tempSelectedPartner) {
            // Pass the formatted name AND the raw object back up
            const formattedName = `${tempSelectedPartner.srName} (${tempSelectedPartner.territoryName?.trim() || 'N/A'})`;
            onConfirm({ ...tempSelectedPartner, formattedName });
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm font-sans">
            {/* Modal Container */}
            <div className="w-full max-w-[500px] bg-white rounded-lg shadow-xl flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-[20px] font-bold text-gray-700">Select Local Partner</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 min-h-[200px]">
                    <p className="text-[14px] text-gray-600 mb-4">
                        Please select a local partner to view their products:
                    </p>

                    {/* Custom Searchable Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            onClick={() => setDropdownOpen(true)}
                            className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-text hover:border-gray-400 transition-colors bg-white"
                        >
                            <input 
                                type="text"
                                placeholder="Select a partner..."
                                value={dropdownOpen ? searchTerm : (tempSelectedPartner ? `${tempSelectedPartner.srName} (${tempSelectedPartner.territoryName?.trim()})` : '')}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setDropdownOpen(true);
                                }}
                                className="w-full outline-none text-[16px] text-gray-700 bg-transparent placeholder-gray-400"
                            />
                            <div className="flex-shrink-0 ml-2 text-gray-400">
                                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* Dropdown Options */}
                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto z-10 custom-scrollbar">
                                {isLoading ? (
                                    <div className="p-3 text-sm text-gray-500 text-center">Loading...</div>
                                ) : filteredPartners.length > 0 ? (
                                    filteredPartners.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => {
                                                setTempSelectedPartner(p);
                                                setSearchTerm('');
                                                setDropdownOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-[#eaf2fd] cursor-pointer text-[14px] text-gray-700 border-b border-gray-50 last:border-0"
                                        >
                                            {p.srName} ({p.territoryName?.trim() || 'N/A'})
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-sm text-gray-500 text-center">No partners found.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-[14px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!tempSelectedPartner}
                        className="px-4 py-2 text-[14px] font-medium text-white bg-[#86644C] rounded-md hover:bg-[#6c4f3b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PartnerSelectionModal;