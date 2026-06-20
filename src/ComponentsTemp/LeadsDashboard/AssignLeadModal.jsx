import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- Custom Reusable Select Component ---
const CustomSelect = ({ label, value, options, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    const displayValue = value ? value.displayName : '';
    
    const filteredOptions = options.filter(opt => 
        opt.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    disabled ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50' : 'border-[#e2e8f0] focus-within:border-[#86644c]'
                }`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                <input
                    type="text" 
                    value={isOpen ? searchTerm : displayValue}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                    placeholder={placeholder} 
                    disabled={disabled}
                    className={`w-full h-full outline-none text-[14px] placeholder-gray-400 cursor-pointer ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'}`}
                />
                <div className="flex items-center flex-shrink-0 cursor-pointer text-gray-400" onClick={() => !disabled && setIsOpen(!isOpen)}>
                    <span className="w-[1px] h-5 bg-[#e2e8f0] mx-2"></span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 max-h-[220px] overflow-y-auto custom-scrollbar mt-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.id} 
                                onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
                                className="px-4 py-2.5 text-[14px] cursor-pointer transition-colors hover:bg-gray-50 text-gray-900"
                            >
                                {opt.displayName}
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
export const AssignLeadModal = ({ isOpen, onClose, lead, onSuccess }) => {
    const modalRef = useRef(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // --- State ---
    const [assignType, setAssignType] = useState('local-partner'); // 'local-partner' | 'employee'
    const [selectedPerson, setSelectedPerson] = useState(null);

    // --- API Data ---
    const [employees, setEmployees] = useState([]);
    const [localPartners, setLocalPartners] = useState([]);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setAssignType('local-partner');
            setSelectedPerson(null);
        }
    }, [isOpen, lead]);

    // Fetch Employees & Local Partners
    useEffect(() => {
        if (!isOpen) return;

        const fetchAssignees = async () => {
            setIsLoadingData(true);
            try {
                const [empRes, repRes] = await Promise.all([
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/employees?limit=10000', getAuthConfig()),
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner', getAuthConfig())
                ]);

                // Format Employee Data
                if (empRes.data?.status === 'success') {
                    const emps = empRes.data.data?.data || [];
                    setEmployees(emps.map(e => ({ id: e.id, displayName: e.name })));
                }

                // Format Local Partner Data: Name (territory)
                if (repRes.data?.status === 'success') {
                    const reps = repRes.data.data || [];
                    setLocalPartners(reps.map(r => ({ 
                        id: r.id, 
                        displayName: `${r.srName} (${r.territoryName || 'No Territory'})` 
                    })));
                }
            } catch (error) {
                toast.error("Failed to load assignees.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAssignees();
    }, [isOpen]);

    // Handle Radio Change
    const handleTypeChange = (e) => {
        setAssignType(e.target.value);
        setSelectedPerson(null); // Clear selection when switching lists
    };

    // Handle Assignment Submit
    const handleAssign = async () => {
        if (!selectedPerson) {
            return toast.warning(`Please select an ${assignType === 'employee' ? 'Employee' : 'Local Partner'}.`);
        }

        setIsSaving(true);
        const loadingNode = toast.loading("Assigning lead...");

        try {
            // Build Payload
            const payload = {
                employeeId: assignType === 'employee' ? selectedPerson.id : null,
                salesRepId: assignType === 'local-partner' ? selectedPerson.id : null
            };

            const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/leads/${lead.id}/assign`, payload, getAuthConfig());

            if (res.data?.success || res.status === 200 || res.status === 201) {
                toast.update(loadingNode, { render: "Lead assigned successfully!", type: "success", isLoading: false, autoClose: 3000 });
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error) {
            toast.update(loadingNode, { render: error.response?.data?.message || "Failed to assign lead.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !lead) return null;

    // Determine current assignment text
    let currentAssignee = 'Not assigned';
    if (lead.assignedEmployee) currentAssignee = lead.assignedEmployee.name || lead.assignedEmployee.srName;
    else if (lead.assignedSalesRep) currentAssignee = lead.assignedSalesRep.srName || lead.assignedSalesRep.name;

    const activeOptions = assignType === 'employee' ? employees : localPartners;
    const dropdownLabel = assignType === 'employee' ? 'Select Employee' : 'Select Local Partner';

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white w-full max-w-[450px] rounded-[6px] shadow-2xl flex flex-col font-sans animate-fadeIn">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0]">
                    <h2 className="text-[20px] font-bold text-[#1f2937] tracking-wide">Assign Lead</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 flex flex-col gap-6">
                    
                    {/* Lead Info */}
                    <div className="text-[16px] text-gray-600">
                        Assigning <strong className="text-black font-semibold">{lead.machineName} - {lead.company}</strong>
                    </div>

                    {/* Current Assignment */}
                    <div className="flex flex-col gap-1 p-3 bg-gray-50 border border-gray-200 rounded-[6px]">
                        <span className="text-[13px] font-medium text-gray-500">Current Assignment:</span>
                        <span className="text-[15px] font-semibold text-gray-800">{currentAssignee}</span>
                    </div>

                    {/* Radio Group */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[14px] font-medium text-[#374151]">Assign To:</label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-[15px] text-gray-700 hover:text-black transition-colors">
                                <input 
                                    type="radio" 
                                    name="assignType" 
                                    value="local-partner" 
                                    checked={assignType === 'local-partner'} 
                                    onChange={handleTypeChange}
                                    className="w-4 h-4 text-[#86644c] focus:ring-[#86644c] cursor-pointer"
                                />
                                Local Partner
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-[15px] text-gray-700 hover:text-black transition-colors">
                                <input 
                                    type="radio" 
                                    name="assignType" 
                                    value="employee" 
                                    checked={assignType === 'employee'} 
                                    onChange={handleTypeChange}
                                    className="w-4 h-4 text-[#86644c] focus:ring-[#86644c] cursor-pointer"
                                />
                                Employee
                            </label>
                        </div>
                    </div>

                    {/* Dropdown Selection */}
                    <div className="mt-2">
                        <CustomSelect 
                            label={dropdownLabel} 
                            value={selectedPerson} 
                            options={activeOptions} 
                            onChange={(opt) => setSelectedPerson(opt)} 
                            placeholder={isLoadingData ? "Loading..." : "Search..."}
                            disabled={isLoadingData}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#e2e8f0] flex items-center justify-end gap-3 bg-[#f9fafb] rounded-b-[6px]">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="h-[40px] px-5 bg-white border border-[#e2e8f0] text-[#4b5563] text-[14px] font-medium rounded-[6px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAssign} 
                        disabled={isSaving || isLoadingData}
                        className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? 'Assigning...' : 'Assign'}
                    </button>
                </div>

            </div>
        </div>
    );
};