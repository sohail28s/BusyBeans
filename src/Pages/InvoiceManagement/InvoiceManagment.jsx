import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader';
import { InvoiceManagementTable } from '../../ComponentsTemp/InvoiceManagement/Allinvoices/InvoiceManagementTable';
import { getAuthConfig } from '../../utils/orderUtils';
export const InvoiceManagementPage = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
      const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setTitle('Invoices Management'); 
        setActions(null);
        setShowProfile(false);
        return () => setTitle('');
        setShowProfile(true);
    }, [setTitle, setActions , setShowProfile]);

    // --- Fetch Data ---
    const fetchInvoiceManagement = async () => {
        setIsGlobalLoading(true);
        setIsLoading(true);
        const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/customer-management/invoice-customers-balance`;

        try {
            const res = await axios.get(apiUrl, getAuthConfig());
            if (res.data?.status === 'success') {
                setInvoices(res.data.data.data || []);
            } else {
                toast.error("Failed to fetch invoice management data.");
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
        fetchInvoiceManagement();
    }, []);

    // --- Handlers ---
    const handleDownloadCSV = (filteredData) => {
        if (!filteredData || !filteredData.length) return toast.info("No records to export.");
        
        const csvFormatted = filteredData.map(item => {
            return {
                "Customer": item.companyName || "-",
                "Invoice Email": item.emailToSendInvoices || "-",
                "Total Balance": item.totalBalance ? `$${item.totalBalance}` : "$0.00",
                "Overdue Orders": item.overDueOrders > 0 ? item.overDueOrders : 'No overdue'
            };
        });
        
        exportToCSV(csvFormatted, `Invoices_Management_${new Date().toLocaleDateString('en-US')}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6">
            
            <div className="w-[300px]">
                <PageStatsHeader 
                    cardTitle="Total Invoices" 
                    totalValue={isLoading ? '...' : invoices.length} 
                />
            </div>

            <div className="flex-1 w-full relative">
                <InvoiceManagementTable 
                    data={invoices}
                    isLoading={isLoading}
                    onDownloadCSV={handleDownloadCSV}
                />
            </div>
            
        </div>
    );
};

export default InvoiceManagementPage;





