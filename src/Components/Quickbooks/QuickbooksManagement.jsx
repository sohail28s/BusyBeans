import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { PageStatsHeader } from '../../Components/Shared/PageStatsHeader';
import { QuickbooksTable } from './QuickbooksTable';
import { getAuthConfig } from '../../utils/orderUtils';
export const CustomerManagement = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [viewMode, setViewMode] = useState('registered');
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [pagination, setPagination] = useState({ page: 1, limit: 100, totalItems: 0, totalPages: 1 });
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        setTitle('Customer Management');
        setActions(null);
        setShowProfile(false);
        return () => { setTitle(''); setActions(null);setShowProfile(true); };
    }, [setTitle, setActions , setShowProfile]);

    // Fetch Data
    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            setIsGlobalLoading(true);


            let apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/qbo-customer-management/customer-list/qbo-registered?page=${pagination.page}&limit=${pagination.limit}`;
            if (viewMode === 'unregistered') {
                apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/qbo-customer-management/customer-list/qbo-not-registered?page=${pagination.page}&limit=${pagination.limit}`;
            }

            try {
                const res = await axios.get(apiUrl, getAuthConfig());
                if (res.data?.status === 'success') {
                    setCustomers(res.data.data.data || []);
                    setPagination(p => ({
                        ...p,
                        totalItems: res.data.pagination.totalItems,
                        totalPages: res.data.pagination.totalPages
                    }));
                    toast.dismiss(loadingToastId);
                } else {
                    throw new Error("Failed");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                toast.update(loadingToastId, { render: "Failed to fetch customer data.", type: "error", isLoading: false, autoClose: 3000 });
            } finally {
                setIsLoading(false);
                setIsGlobalLoading(false);
            }
        };

        fetchCustomers();
    }, [viewMode, pagination.page, pagination.limit]);

    const handleViewChange = (mode) => {
        if (isLoading) return;
        setViewMode(mode);
        setPagination({ page: 1, limit: 100, totalItems: 0, totalPages: 1 });
        setSelectedIds([]);
    };

    const handleExportSelected = async () => {
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one customer to export.");
            return;
        }

        setIsExporting(true);
        const loadingToastId = toast.loading(`Exporting ${selectedIds.length} customer(s) to QBO...`);

        try {
            const payload = { ids: selectedIds };
            const res = await axios.post(
                'https://testingbb.trimworldwide.com/qbo/customers/import',
                payload,
                getAuthConfig()
            );

            if (res.status === 200 || res.data?.status === 'success') {
                toast.update(loadingToastId, {
                    render: "Customers successfully exported to QBO.",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
                setSelectedIds([]);
                setViewMode('registered');
                setPagination(p => ({ ...p, page: 1, limit: 100 }));
            } else {
                throw new Error("Export failed");
            }
        } catch (error) {
            console.error("Export POST error:", error);
            toast.update(loadingToastId, { render: error.response?.data?.message || "Failed to export customers.", type: "error", isLoading: false, autoClose: 4000 });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadCSV = () => {
        if (!customers.length) return toast.info("No customers to export in current view.");

        const csvFormatted = customers.map(cust => ({
            "Company Name": cust.companyName || cust.name,
            "Main Contact": cust.name,
            "Employee": cust.employee || "Not Assigned",
            "Status": cust.status ? "Active" : "Inactive",
            "Last Order": "Last order"
        }));

        exportToCSV(csvFormatted, `Customers_${viewMode}_${new Date().toLocaleDateString('en-US')}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-[#fafafa] font-sans p-6 md:p-8 flex flex-col gap-6">

            {/* Top Controls Layout */}
            <div className="flex flex-col gap-6 w-full">
    {/* Top Row: Tabs and Export Button */}
    <div className="flex justify-between items-start mt-6">
        
        {/* EXACT REF TABS */}
        <div className="flex">
            <button 
                onClick={() => handleViewChange('registered')} 
                className={`font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 ${viewMode === 'registered' ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
                Qbo Registered
            </button>
            <button 
                onClick={() => handleViewChange('unregistered')} 
                className={`font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 border-l-0 ${viewMode === 'unregistered' ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
                Qbo Unregistered
            </button>
        </div>

        {/* EXACT REF EXPORT BUTTON */}
        {viewMode === 'unregistered' && (
            <button 
                onClick={handleExportSelected} 
                disabled={isExporting || selectedIds.length === 0} 
                className="inline-flex items-center justify-center gap-2 bg-[#86644c] text-white px-4 py-2 rounded-lg border border-[#86644c] hover:bg-white hover:text-[#86644c] transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#86644c] disabled:hover:text-white" 
            >
                {isExporting ? 'Exporting...' : `Export Customers ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''}`}
            </button>
        )}
        
    </div>

    {/* Single Stats Card */}
    <div className="w-[300px]">
        <PageStatsHeader 
            cardTitle="Total Customers" 
            totalValue={isLoading ? '...' : pagination.totalItems} 
        />
    </div>
</div>

            {/* Table Area */}
            <div className="flex-1 w-full mt-2 relative">
                <QuickbooksTable
                    viewMode={viewMode}
                    data={customers}
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

export default CustomerManagement;