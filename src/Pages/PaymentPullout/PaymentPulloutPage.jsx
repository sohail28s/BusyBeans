import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { exportToCSV } from '../../utils/csvHelper'; 
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader'; 
import { PaymentPulloutTable } from '../../ComponentsTemp/PaymentPullouts/PaymentPulloutsTable'; 
import { getAuthConfig } from '../../utils/orderUtils'; 

export const PaymentPullouts = () => { 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    
    const [viewMode, setViewMode] = useState('Pending Pullouts'); 
    const [orders, setOrders] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 

    // Default limit is 100. Note the change: 'totalItems' is mapped to 'total'
    const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 }); 

    useEffect(() => { 
        setTitle('Orders'); 
        setActions(null); 
        setShowProfile(false); 
        
        return () => {
            setTitle(''); 
            setShowProfile(true);
        }
    }, [setTitle, setActions , setShowProfile]); 

    // --- Fetch Data (Server-Side Pagination) --- 
    useEffect(() => { 
        const fetchOrders = async () => { 
            setIsLoading(true); 
            setIsGlobalLoading(true); 
            
            const adminReceivableStatus = viewMode === 'Pending Pullouts' ? 0 : 1; 
            
            // Pass the page and limit to the API directly 
            const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/orders?adminReceivableStatus=${adminReceivableStatus}&page=${pagination.page}&limit=${pagination.limit}`; 
            
            try { 
                const res = await axios.get(apiUrl, getAuthConfig()); 
                if (res.data?.status === 'success') { 
                    setOrders(res.data.data.data || []); 
                    
                    // --- 10,000 MAX CAP LOGIC --- 
                    // Map API's 'totalItems' directly to 'total' in state so TablePagination works
                    const actualTotal = res.data.pagination.totalItems; 
                    const cappedTotal = Math.min(actualTotal, 10000); 
                    setPagination(p => ({ ...p, total: cappedTotal })); 
                } else { 
                    toast.error("Failed to fetch pullout data."); 
                } 
            } catch (error) { 
                console.error("Fetch error:", error); 
                toast.error("An error occurred while fetching data."); 
            } finally { 
                setIsLoading(false); 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchOrders(); 
    }, [viewMode, pagination.page, pagination.limit]); 

    const handleViewChange = (mode) => { 
        if (isLoading) return; 
        setViewMode(mode); 
        // Reset to page 1 when switching tabs 
        setPagination(p => ({ ...p, page: 1 })); 
    }; 

    const handleDownloadCSV = () => { 
        if (!orders.length) return toast.info("No records to export."); 
        
        const csvFormatted = orders.map(order => { 
            const baseData = { 
                "INV#": order.invoiceNumber || "-", 
                "Company": order.companyName || "-", 
                "Invoice Date": order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : "-", 
                "Total": order.totalBill ? `$${order.totalBill}` : "$0.00", 
                "Partner Profit": order.localPatnerCommission ? `$${order.localPatnerCommission}` : "$0.00", 
                "Admin Receivable": order.adminEarnings ? `$${order.adminEarnings}` : "$0.00", 
            }; 
            if (viewMode === 'Pending Pullouts') { 
                return { 
                    ...baseData, 
                    "Overdue Invoice": order.overdueInvoice || '1', 
                    "Invoice": order.paymentStatus === 'done' ? 'Paid' : (order.paymentStatus || 'Pending'), 
                    "Status": order.orderCurrentStatus || '-' 
                }; 
            } else { 
                return { 
                    ...baseData, 
                    "Pullout Transfer Id": order.pulloutIntentId || "-", 
                    "Pullout Date": order.pulloutDate ? new Date(order.pulloutDate).toLocaleDateString() : "-", 
                    "Invoice": order.paymentStatus === 'done' ? 'Paid' : (order.paymentStatus || 'Pending'), 
                    "Status": order.orderCurrentStatus || '-' 
                }; 
            } 
        }); 
        exportToCSV(csvFormatted, `Payment_${viewMode.replace(' ', '_')}_${new Date().toLocaleDateString('en-US')}.csv`); 
    }; 

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6"> 
            
            <div className="w-full flex items-start"> 
                <div className="border border-black flex h-[42px] overflow-hidden bg-white shadow-sm w-max"> 
                    <button 
                        onClick={() => handleViewChange('Pending Pullouts')} 
                        className={`px-[24px] h-full text-[14px] font-bold transition-colors ${viewMode === 'Pending Pullouts' ? 'bg-black text-white' : 'text-[#4b5563] hover:bg-gray-50'}`} 
                    > 
                        Pending Pullouts 
                    </button> 
                    <button 
                        onClick={() => handleViewChange('Confirm Pullouts')} 
                        className={`px-[24px] h-full text-[14px] font-bold transition-colors ${viewMode === 'Confirm Pullouts' ? 'bg-black text-white' : 'text-[#4b5563] hover:bg-gray-50'}`} 
                    > 
                        Confirm Pullouts 
                    </button> 
                </div> 
            </div> 

            <div className="w-[300px]"> 
                <PageStatsHeader cardTitle="Total Orders" totalValue={isLoading ? '...' : pagination.total} /> 
            </div> 

            <div className="flex-1 w-full mt-2 relative"> 
                <PaymentPulloutTable 
                    viewMode={viewMode} 
                    data={orders} 
                    isLoading={isLoading} 
                    pagination={pagination} 
                    setPagination={setPagination} 
                    onDownloadCSV={handleDownloadCSV} 
                /> 
            </div> 
            
        </div> 
    ); 
}; 

export default PaymentPullouts;