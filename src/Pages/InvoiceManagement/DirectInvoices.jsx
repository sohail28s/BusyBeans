import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader';
import { DirectInvoicesTable } from '../../ComponentsTemp/InvoiceManagement/Allinvoices/DirectInvoicesTable';
import { getAuthConfig } from '../../utils/orderUtils';


export const DirectInvoicesPage = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
      const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    

    const [activeTab, setActiveTab] = useState('Customer Invoices');
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Default limit set to 50
    const [pagination, setPagination] = useState({ page: 1, limit: 50, totalItems: 0, totalPages: 1 });

    // --- Top Navbar Configuration ---
    useEffect(() => {
        setTitle('Invoices'); 
        setShowProfile(false);
        
        setActions(
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1"> 
    <button 
        onClick={() => { setActiveTab('Customer Invoices'); setPagination(p => ({ ...p, page: 1 })); }} 
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'Customer Invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} 
    > 
        Customer Invoices 
    </button> 
    <button 
        onClick={() => { setActiveTab('Partner Invoices'); setPagination(p => ({ ...p, page: 1 })); }} 
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'Partner Invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} 
    > 
        Partner Invoices 
    </button> 
</div>
        );
        
        return () => setTitle('');
        setShowProfile(true)
    }, [setTitle, setActions, activeTab , setShowProfile]);

    // --- Fetch Data ---
    const fetchDirectInvoices = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        
        const customerApi = `https://testingbb.trimworldwide.com/api/v1/admin/orders?type=direct-invoice&sort=invoiceDate&page=${pagination.page}&limit=${pagination.limit}`;
        const partnerApi = `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/orders-list?type=direct-invoice&sort=invoiceDate&page=${pagination.page}&limit=${pagination.limit}`;
        
        const apiUrl = activeTab === 'Customer Invoices' ? customerApi : partnerApi;

        try {
            const res = await axios.get(apiUrl, getAuthConfig());
            if (res.data?.status === 'success') {
                setInvoices(res.data.data.data || []);
                setPagination(p => ({
                    ...p,
                    totalItems: res.data.pagination.totalItems,
                    totalPages: res.data.pagination.totalPages
                }));
            } else {
                toast.error("Failed to fetch invoices.");
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
        fetchDirectInvoices();
    }, [activeTab, pagination.page, pagination.limit]);

    // --- Handlers ---
    const handleDownloadCSV = () => {
        if (!invoices.length) return toast.info("No records to export.");
        
        const csvFormatted = invoices.map(item => {
            const isPaid = item.paymentStatus === 'done' || item.paymentStatus === 'paid';
            const baseData = {
                "INV#": item.invoiceNumber || "-",
            };

            if (activeTab === 'Customer Invoices') {
                baseData["Company Name"] = item.companyName || "-";
            } else {
                baseData["Local Partner"] = item.salesRepName || "-";
            }

            return {
                ...baseData,
                "Order Date": item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
                "Total": item.totalBill ? `$${item.totalBill}` : "$0.00",
                "Status": isPaid ? "Paid" : "Unpaid"
            };
        });
        
        exportToCSV(csvFormatted, `Direct_Invoices_${activeTab.replace(' ', '_')}_${new Date().toLocaleDateString('en-US')}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6">
            
            <div className="w-[300px]">
                <PageStatsHeader 
                    cardTitle="Total Orders" 
                    totalValue={isLoading ? '...' : pagination.totalItems} 
                />
            </div>

            <div className="flex-1 w-full relative">
                <DirectInvoicesTable
                    activeTab={activeTab}
                    data={invoices}
                    isLoading={isLoading}
                    pagination={pagination}
                    setPagination={setPagination}
                    onDownloadCSV={handleDownloadCSV}
                />
            </div>
            
        </div>
    );
};

export default DirectInvoicesPage;