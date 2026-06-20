import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { PayoutsTable } from '../../Components/EmployeeManagement/Payout/PayoutTable';
import { getAuthConfig } from '../../utils/orderUtils';

const EmployeeFilterDropdown = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = value === null ? "Select Employee" : value;

    return (
        <div className="relative w-[250px] font-sans" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[40px] px-4 bg-white border border-[#e5e7eb] rounded-[6px] flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
            >
                <span className="text-[14px] text-gray-600 truncate">{selectedLabel}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#e5e7eb] rounded-[6px] shadow-lg z-[50] py-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {options.map(empName => (
                        <div 
                            key={empName}
                            onClick={() => { onChange(empName); setIsOpen(false); }}
                            className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-gray-50 truncate ${value === empName ? 'bg-blue-50 text-[#86644c] font-medium' : 'text-gray-700'}`}
                        >
                            {empName}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Payouts = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
      const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    

    const [viewMode, setViewMode] = useState('Not Transferred');
    const [payouts, setPayouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Derived state for dropdown filtering
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState(null);

    // Selected state for Bulk Transfer POST
    const [selectedIds, setSelectedIds] = useState([]);
    const [isTransferring, setIsTransferring] = useState(false);
    
    const [pagination, setPagination] = useState({ page: 1, limit: 100, totalItems: 0, totalPages: 1 });

    // --- Top Navbar ---
    useEffect(() => {
        setTitle('Payouts');
        setShowProfile(false);
        setActions(null); 
        return () => setTitle(''); setShowProfile(true);
    }, [setTitle, setActions , setShowProfile]);

    // --- Fetch Data ---
    const fetchPayouts = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        const endpoint = viewMode === 'Not Transferred' ? 'not-transferred' : 'transferred';
        const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/employee-commission-orders/${endpoint}?page=${pagination.page}&limit=${pagination.limit}`;

        try {
            const res = await axios.get(apiUrl, getAuthConfig());
            if (res.data?.status === 'success') {
                const fetchedData = res.data.data.data || [];
                setPayouts(fetchedData);
                
                setPagination(p => ({
                    ...p,
                    totalItems: res.data.pagination.totalItems,
                    totalPages: res.data.pagination.totalPages
                }));

                if (viewMode === 'Not Transferred') {
                    const uniqueEmps = [...new Set(fetchedData.map(item => item.employeeName).filter(Boolean))];
                    setEmployeeOptions(uniqueEmps);
                }
            } else {
                toast.error("Failed to fetch payout data.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching data.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, [viewMode, pagination.page, pagination.limit]);

    // --- Handlers ---
    const handleViewChange = (mode) => {
        if (isLoading) return; 
        setViewMode(mode);
        setSelectedIds([]); 
        setSelectedEmployeeFilter(null); 
        setPagination(p => ({ ...p, page: 1 }));
    };

    // --- BULK TRANSFER LOGIC (UPDATED) ---
    const handleTransfer = async () => {
        if (selectedIds.length === 0) return toast.warning("Please select at least one order to transfer.");

        setIsTransferring(true);
        const loadingId = toast.loading(`Transferring ${selectedIds.length} order(s)...`);

        try {
            const res = await axios.post(
                'https://testingbb.trimworldwide.com/api/v1/admin/bulk-transfer-commission-to-employee',
                { orderIds: selectedIds },
                getAuthConfig()
            );

            // API responded with HTTP 200, but we need to check internal payload success/failure
            if (res.status === 200 || res.status === 201 || res.data?.status === 'success') {
                const responseData = res.data?.data;

                if (responseData) {
                    const { successful, failed, failedOrders } = responseData;

                    // If there are failures reported internally
                    if (failed > 0) {
                        // Extract the first error message to display in the toast
                        const errorMessage = failedOrders?.[0]?.message || "Destination account capabilities missing.";

                        if (successful === 0) {
                            // TOTAL FAILURE (None succeeded)
                            toast.update(loadingId, { 
                                render: `Transfer Failed: ${errorMessage}`, 
                                type: "error", 
                                isLoading: false, 
                                autoClose: 6000 
                            });
                        } else {
                            // PARTIAL SUCCESS (Some passed, some failed)
                            toast.update(loadingId, { 
                                render: `${successful} passed, ${failed} failed. Issue: ${errorMessage}`, 
                                type: "warning", 
                                isLoading: false, 
                                autoClose: 6000 
                            });
                            // Refresh list to clear out the ones that did succeed
                            setSelectedIds([]);
                            fetchPayouts(); 
                        }
                    } else {
                        // 100% FULL SUCCESS
                        toast.update(loadingId, { 
                            render: `Successfully transferred ${successful} order(s)!`, 
                            type: "success", 
                            isLoading: false, 
                            autoClose: 2000 
                        });
                        setSelectedIds([]);
                        fetchPayouts(); 
                    }
                } else {
                    // Fallback if data structure changes
                    toast.update(loadingId, { render: "Transfer processed.", type: "success", isLoading: false, autoClose: 2000 });
                    setSelectedIds([]);
                    fetchPayouts();
                }
            } else {
                throw new Error("Transfer failed");
            }
        } catch (error) {
            console.error("Transfer error:", error);
            // This catches actual HTTP failures (e.g. 500, 400)
            toast.update(loadingId, { 
                render: error.response?.data?.message || "Failed to transfer commissions.", 
                type: "error", 
                isLoading: false, 
                autoClose: 4000 
            });
        } finally {
            setIsTransferring(false);
        }
    };

    const handleDownloadCSV = () => {
        const dataToExport = selectedEmployeeFilter 
            ? payouts.filter(p => p.employeeName === selectedEmployeeFilter) 
            : payouts;

        if (!dataToExport.length) return toast.info("No records to export.");
        
        const csvFormatted = dataToExport.map(item => ({
            "Invoice #": item.invoiceNumber || "-",
            "Employee Name": item.employeeName || "-",
            "Company Name": item.companyName || "-",
            "Stripe Connected": Boolean(item.stripeConnectAccountId) ? "Yes" : "No",
            "Employee Commission Amount": item.employeeCommisionAmount ? `$${item.employeeCommisionAmount}` : "$0.00",
            "Applied Commission %": `${parseFloat(item.AppliedEmployeeCommisionPercentage || 0).toFixed(2)}%`,
            "Payment Status": item.paymentStatus === 'done' ? 'Paid' : (item.paymentStatus || 'Pending'),
            "Shipping Charges": item.shippingCharges ? `$${item.shippingCharges}` : "$0.00",
            "Order Amount": item.subTotal ? `$${item.subTotal}` : "$0.00",
            "Totals": item.totalBill ? `$${item.totalBill}` : "$0.00"
        }));
        
        exportToCSV(csvFormatted, `Payouts_${viewMode.replace(' ', '_')}_${new Date().toLocaleDateString('en-US')}.csv`);
    };

    const tableData = selectedEmployeeFilter 
        ? payouts.filter(p => p.employeeName === selectedEmployeeFilter) 
        : payouts;

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6">
            
            <div className="w-full flex items-start justify-between">
                <div className="border border-[#d1d5db] rounded-[6px] flex h-[42px] overflow-hidden bg-[#f9fafb] shadow-sm w-max">
                    <button 
                        onClick={() => handleViewChange('Not Transferred')}
                        className={`px-[24px] h-full text-[14px] font-medium transition-colors ${viewMode === 'Not Transferred' ? 'bg-[#86644c] text-white' : 'text-[#6b7280] hover:bg-gray-100'}`}
                    >
                        Not Transferred
                    </button>
                    <button 
                        onClick={() => handleViewChange('Transferred')}
                        className={`px-[24px] h-full text-[14px] font-medium transition-colors border-l border-[#d1d5db] ${viewMode === 'Transferred' ? 'bg-[#86644c] text-white border-l-0' : 'text-[#6b7280] hover:bg-gray-100'}`}
                    >
                        Transferred
                    </button>
                </div>

                {viewMode === 'Not Transferred' && (
                    <button 
                        onClick={handleTransfer}
                        disabled={isTransferring || selectedIds.length === 0}
                        className="h-[42px] px-8 bg-[#86644c] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#73543d] transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isTransferring ? 'Transferring...' : 'Transfer'}
                    </button>
                )}
            </div>

            {viewMode === 'Not Transferred' && (
                <div className="w-full flex justify-start">
                    <EmployeeFilterDropdown 
                        value={selectedEmployeeFilter} 
                        onChange={setSelectedEmployeeFilter} 
                        options={employeeOptions} 
                    />
                </div>
            )}

            <div className="flex-1 w-full relative">
                <PayoutsTable
                    viewMode={viewMode}
                    data={tableData}
                    isLoading={isLoading}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onDownloadCSV={handleDownloadCSV}
                />
            </div>
            
        </div>
    );


};


export default Payouts;