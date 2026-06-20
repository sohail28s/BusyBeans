import React, { useMemo, useState, useEffect , useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

import useStore from '../../Hooks/useStore';
import { AssignModal } from './Modals/AssignModal';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
const CustomCheckbox = ({ checked, onChange }) => (
    <div
        className="relative inline-flex items-center justify-center w-5 h-5 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
    >
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        />
        <span className={`flex items-center justify-center w-full h-full border-2 rounded-[4px] transition-colors pointer-events-none ${checked ? 'bg-black border-black' : 'bg-white border-gray-300'}`}></span>
        <svg
            className={`absolute w-3.5 h-3.5 pointer-events-none transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0'}`}
            viewBox="0 0 14 14"
            fill="none"
        >
            <path d="M3 7.5L6 10.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

export const CustomerLayout = ({
    data, activeTab, onTabChange, totalCount, onSearchChange, searchQuery,
    stateFilter, onStateFilterChange, showAssignButton, isLoading,
    selectedRows, onSelectAll, onSelectOne, onStatusToggle, pagination,
    setPagination, refreshData
}) => {
    const navigate = useNavigate();
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const statesList = [
        { label: "All", value: "ALL" },
        { label: "Texas", value: "Texas" },
        { label: "South Carolina", value: "South Carolina" },
        { label: "Florida", value: "Florida" },
        { label: "Washington", value: "Washington" },
        { label: "Wisconsin", value: "Wisconsin" },
        { label: "New Mexico", value: "New Mexico" }
    ];

    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'default' });

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return { key, direction: 'default' };
                return { key, direction: 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const displayData = useMemo(() => {
        let sorted = [...data];
        if (sortConfig.key !== 'default' && sortConfig.direction !== 'default') {
            sorted.sort((a, b) => {
                let valA = String(a.companyName || a.name || '').toLowerCase();
                let valB = String(b.companyName || b.name || '').toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [data, sortConfig]);

    const handleDownloadCSV = () => {
        if (!displayData.length) return toast.info("No data to download!");
        const csvContent = [
            ["ID", "Name/Company", "Main Contact", "Group (Sales Rep)", "Last Order", "Status"],
            ...displayData.map(o => [
                o.id,
                o.companyName || o.name,
                o.name,
                o.salesRepName || "Not Assigned",
                "last order",
                o.status ? "Active" : "Inactive"
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Customer_List.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- MODAL LOGIC --- 
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [salesReps, setSalesReps] = useState([]);
    const [isFetchingReps, setIsFetchingReps] = useState(false);

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });

    useEffect(() => {
        if (isAssignModalOpen && salesReps.length === 0) {
            const fetchReps = async () => {
                setIsFetchingReps(true);
                try {
                    const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep?page=1&limit=10000`, getAuthConfig());
                    if (res.data?.status === 'success') setSalesReps(res.data.data?.data || []);
                } catch (error) {
                    toast.error("Failed to load Local Partners.");
                } finally {
                    setIsFetchingReps(false);
                }
            };
            fetchReps();
        }
    }, [isAssignModalOpen, salesReps.length]);

    const executeAssignPartner = async (partnerId) => {
        const loadingNode = toast.loading("Assigning Local Partner...");
        setIsGlobalLoading(true);
        try {
            const payload = { id: selectedRows };
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/customer-management/assign-sale-rep/${partnerId}`, payload, getAuthConfig());

            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingNode, { render: "Local Partner assigned successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setIsAssignModalOpen(false);
                onSelectAll({ target: { checked: false } });
                if (refreshData) refreshData();
            }
        } catch (error) {
            toast.update(loadingNode, { render: error.response?.data?.message || "Failed to assign Local Partner.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsGlobalLoading(false);
        }
    };

    const handleAssignPartnerClick = () => {
        if (selectedRows.length === 0) {
            return toast.warning("Please select at least one customer to assign a local partner.");
        }
        setIsAssignModalOpen(true);
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLabel = activeTab === 'unassigned'
        ? 'All'
        : (statesList.find(st => st.value === stateFilter)?.label || 'All');





    const handleOptionSelect = (value) => {
        // Mock the event object so your existing onStateFilterChange works seamlessly
        onStateFilterChange({ target: { value } });
        setIsDropdownOpen(false);
    };

    // 1. Add a local state to hold the IMMEDIATE text the user is typing
const [localSearchQuery, setLocalSearchQuery] = useState('');

// 2. Add the Debounce Effect
useEffect(() => {
    // Set a timer to update the REAL search query (which triggers your API/filtering)
    const timeoutId = setTimeout(() => {
        onSearchChange(localSearchQuery); 
    }, 500); // 500ms delay

    // Clear the timer if the user types another letter before 500ms is up
    return () => clearTimeout(timeoutId);
}, [localSearchQuery, onSearchChange]);

    return (
        <div className="flex flex-col gap-6 relative font-sans">

            {/* --- ROW 1: DROPDOWN --- */}
      <div className="flex justify-end w-full">
        <div className="relative w-40" ref={dropdownRef}>
          {/* 1. Closed State (Trigger) */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full h-[38px] pl-3 pr-2 border border-gray-300 rounded text-[14px] font-medium text-gray-700 outline-none cursor-pointer shadow-sm select-none bg-white"
          >
            <span className="truncate">{currentLabel}</span>
            {/* Custom Arrow Container from Reference */}
            <div className="flex items-center text-gray-400 pointer-events-none shrink-0">
              <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span>
              <div className={`p-1 transition-transform duration-200 ${isDropdownOpen ? '' : ''}`}>
                <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="fill-current">
                  <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Open State (Custom Dropdown List) */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-input-brown rounded shadow-xl overflow-hidden py-1">
              {activeTab === 'unassigned' ? (
                <div
                  onClick={() => handleOptionSelect('ALL')}
                  className="px-4 py-2 text-[14px] font-medium text-white cursor-pointer bg-input-brown hover:bg-input-hover transition-colors truncate"
                >
                  All
                </div>
              ) : (
                statesList.map(st => (
                  <div
                    key={st.value}
                    onClick={() => handleOptionSelect(st.value)}
                    className="px-4 py-2 text-[14px] font-medium text-white cursor-pointer bg-input-brown hover:bg-input-hover transition-colors truncate"
                  >
                    {st.label}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ROW 2: TABS & ASSIGN BUTTON --- */}
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap">
          <button
            onClick={() => onTabChange('all')}
            className={`font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 max-sm:w-60 ${activeTab === 'all' ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            All Customers
          </button>
          {/* Note: -ml-[1px] prevents the borders from doubling up between adjacent buttons */}
          <button
            onClick={() => onTabChange('unassigned')}
            className={`font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 max-sm:w-60 -ml-[1px] ${activeTab === 'unassigned' ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            Unassigned Local Partner
          </button>
          <button
            onClick={() => onTabChange('assigned')}
            className={`font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 max-sm:w-60 -ml-[1px] ${activeTab === 'assigned' ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            Assigned Local Partner
          </button>
        </div>

        {showAssignButton && (
          <button
            onClick={handleAssignPartnerClick}
            className="h-[45px] px-8 bg-[#86644c] text-white text-[15px] font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm"
          >
            Assign Local Partner
          </button>
        )}
      </div>

      {/* --- STAT CARD --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="p-5 space-y-8 font-sans font-medium text-lg bg-themeTab border border-tabBorderColor shadow-tabShadow rounded-xl text-black ">
          <p>Total Customer</p>
          <p>{isLoading ? '...' : totalCount}</p>
        </div>
      </div>

            {/* --- MAIN TABLE AREA --- */}
            <div className="bg-white w-full border border-gray-200 rounded-[12px] shadow-sm p-6 flex flex-col">
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4"> 
    <div className="relative flex items-center w-[450px] h-[45px] bg-[#f9fafb] border border-gray-200 rounded-[8px] overflow-hidden shadow-inner"> 
        <div className="pl-4 pr-2 text-gray-400"> 
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg> 
        </div> 
        <input 
            type="search" 
            placeholder="Search by ID, Name, Email, Phone, Company N..." 
            // CHANGE 1: Use local state for the value
            value={localSearchQuery} 
            // CHANGE 2: Update local state immediately when typing
            onChange={(e) => setLocalSearchQuery(e.target.value)} 
            className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3 placeholder-gray-400" 
        /> 
    </div> 
    
    <button 
        onClick={handleDownloadCSV} 
        className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[14px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap" 
    > 
        <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg> 
        Download CSV 
    </button> 
</div>

                <div className="w-full rounded-t-[8px] overflow-hidden overflow-x-auto">
                    <table className="w-full text-left table-fixed border-collapse whitespace-nowrap min-w-[1000px]">
                        <thead className="bg-[#f9fafb]">
                            <tr>
                                {activeTab === 'unassigned' && (
                                    <th className="px-6 py-4 w-[80px] text-center">
                                        <CustomCheckbox
                                            checked={displayData.length > 0 && selectedRows.length === displayData.length}
                                            onChange={onSelectAll}
                                        />
                                    </th>
                                )}
                                <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} width="w-[220px]" />
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px] w-[180px]">Main Contact</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px] w-[200px]">Group</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px] w-[150px]">Last Order</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px] w-[180px]">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500 italic">Loading customers...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                        className={`hover:bg-gray-50 transition-colors text-[14px] cursor-pointer ${selectedRows.includes(customer.id) ? 'bg-gray-50' : ''}`}
                                    >
                                        {activeTab === 'unassigned' && (
                                            <td className="px-6 py-5 text-center">
                                                <CustomCheckbox checked={selectedRows.includes(customer.id)} onChange={() => onSelectOne(customer.id)} />
                                            </td>
                                        )}
                                        <td className="px-6 py-5 font-medium text-gray-800 truncate" title={customer.companyName || customer.name}>{customer.companyName || customer.name || "—"}</td>
                                        <td className="px-6 py-5 text-gray-600 truncate" title={customer.name}>{customer.name || "—"}</td>
                                        <td className="px-6 py-5">
                                            {customer.salesRepName ? (
                                                <span className="text-gray-700 font-medium truncate inline-block max-w-[180px]" title={customer.salesRepName}>{customer.salesRepName}</span>
                                            ) : (
                                                <span className="bg-red-50 text-red-500 border border-red-200 px-2 py-1 rounded-[4px] text-[12px] font-medium">Not Assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-gray-500">last order</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-[4px] text-[12px] font-medium w-[65px] text-center ${customer.status ? 'bg-[#86644c] text-white' : 'bg-[#fef2f2] text-red-400'}`}>
                                                    {customer.status ? 'Active' : 'Inactive'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onStatusToggle(customer.id, customer.status, customer.companyName || customer.name); }}
                                                    className={`relative inline-flex h-[22px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${customer.status ? 'bg-[#86644c]' : 'bg-gray-400'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${customer.status ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500 italic">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Shared Pagination Component (ALL MATH HAPPENS HERE NOW) --- */}
                <TablePagination
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>

            {/* --- ASSIGN MODAL --- */}
            <AssignModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign Local Partner"
                type="partner"
                variant="expanded"
                data={salesReps}
                isLoading={isFetchingReps}
                onAssign={executeAssignPartner}
            />
        </div>
    );


};