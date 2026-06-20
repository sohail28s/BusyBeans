import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { InvoiceFilterBar } from '../../Components/QuickbookInvoices/InvoiceFilterBar'; 
import { InvoiceTable } from '../../Components/QuickbookInvoices/InvoiceTable'; 

const PartnerInvoices = () => { 
    const setStoreTitle = useStore(state => state.setTitle); 
    const setStoreShowProfile = useStore(state => state.setShowProfile); 
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);  
    useEffect(() => { 
        setStoreTitle('Quickbook Partner Invoices'); 
        setStoreShowProfile(false); 
        return () => { 
            setStoreTitle(''); 
            setStoreShowProfile(true); 
        }; 
    }, [setStoreTitle, setStoreShowProfile]); 

    const [invoices, setInvoices] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 }); 
    const [currentFilters, setCurrentFilters] = useState({ syncStatus: 'synced', search: '' }); 
    const [isSyncing, setIsSyncing] = useState(false); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [selectedIds, setSelectedIds] = useState([]); 
    
    const showSync = currentFilters.syncStatus === 'not-synced' || currentFilters.syncStatus === 'unsynced-paid'; 
    const syncLabel = currentFilters.syncStatus === 'not-synced' ? 'Sync Invoices' : 'Sync Payment'; 

    useEffect(() => { 
        const fetchInvoices = async () => { 
            setIsLoading(true); 
            setIsGlobalLoading(true); 
            try { 
                const baseUrl = `https://testingbb.trimworldwide.com/api/v1/admin/quickbooks-partner-order-management/${currentFilters.syncStatus}`; 
                const url = `${baseUrl}?page=${pagination.page}&limit=${pagination.limit}`; 
                const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                
                if (res.data.status === 'success') { 
                    setInvoices(res.data.data?.data || []); 
                    const exactTotal = res.data.pagination?.totalItems || 0; 
                    setPagination(p => ({ ...p, total: exactTotal })); 
                } 
            } catch (error) { 
                console.error("Failed to fetch partner invoices:", error); 
            } finally { 
                setIsLoading(false); 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchInvoices(); 
    }, [pagination.page, pagination.limit, currentFilters.syncStatus, refreshTrigger, setIsGlobalLoading]); 

    const handleSync = async (selectedIdsToSync) => { 
        setIsSyncing(true); 
        try { 
            const payload = { orderType: 'local-partner', orderIds: selectedIdsToSync }; 
            const endpoint = currentFilters.syncStatus === 'unsynced-paid' 
                ? 'https://testingbb.trimworldwide.com/qbo/order-payment/sync-multiple' 
                : 'https://testingbb.trimworldwide.com/qbo/order-invoice/create-multiple'; 
                
            const res = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
            
            if (res.data.status === 'success') { 
                toast.success(res.data.message || "Bulk sync completed successfully."); 
                setRefreshTrigger(prev => prev + 1); 
            } else { 
                toast.error(res.data.message || "Sync failed."); 
            } 
        } catch (error) { 
            toast.error(error.response?.data?.message || "An error occurred during sync."); 
        } finally { 
            setIsSyncing(false); 
        } 
    }; 

    return ( 
        // Changed background to bg-white
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans"> 
            <InvoiceFilterBar 
                activeTab={currentFilters.syncStatus} 
                onTabChange={(val) => { 
                    setPagination(p => ({ ...p, page: 1 })); 
                    setCurrentFilters({ syncStatus: val }); 
                    setSelectedIds([]); 
                }} 
                onBack={() => window.history.back()} 
                showSyncButton={showSync} 
                syncButtonLabel={syncLabel} 
                selectedCount={selectedIds.length} 
                onSync={() => handleSync(selectedIds)} 
                isSyncing={isSyncing} 
            /> 
            <InvoiceTable 
                data={invoices} 
                isLoading={isLoading} 
                pagination={pagination} 
                setPagination={setPagination} 
                showCheckboxes={showSync} 
                selectedIds={selectedIds} 
                setSelectedIds={setSelectedIds} 
            /> 
        </div> 
    ); 
}; 

export default PartnerInvoices;