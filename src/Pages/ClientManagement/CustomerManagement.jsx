import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../Hooks/useStore'; 
import { CustomerLayout } from '../../ComponentsTemp/ClientManagement/CustomerLayout'; 

const CustomerManagement = () => { 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [rawCustomersData, setRawCustomersData] = useState([]); 
    const [filteredCustomers, setFilteredCustomers] = useState([]); 
    
    // FIXED: Changed totalItems to total to match your TablePagination component
    const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 }); 
    const [activeTab, setActiveTab] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [isLoading, setIsLoading] = useState(true); 
    const [stateFilter, setStateFilter] = useState('ALL'); 
    const [selectedRows, setSelectedRows] = useState([]); 

    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    }); 

    // --- Global Header & Profile Setup --- 
    useEffect(() => { 
        setTitle('Customer Management'); 
        setShowProfile(false); 

        const customActionsNode = ( 
            <div className="flex items-center text-sm font-medium text-gray-700"> 
                <button onClick={() => navigate('/customers/add')} className="text-[#516377] hover:text-black transition-colors" > 
                    Add Customer 
                </button> 
            </div> 
        ); 
        setActions(customActionsNode); 

        return () => { 
            setTitle(''); 
            setActions(null); 
            setShowProfile(true); 
            setIsGlobalLoading(false); 
        }; 
    }, [setTitle, setActions, navigate, setShowProfile, setIsGlobalLoading]); 

    // --- Master API Fetcher --- 
    const fetchCustomersData = useCallback(async (currentPage, currentLimit, currentQuery) => { 
        setIsLoading(true); 
        setIsGlobalLoading(true); 
        setSelectedRows([]); 
        
        let baseApiUrl = ''; 
        if (activeTab === 'all') 
            baseApiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/all'; 
        else if (activeTab === 'assigned') 
            baseApiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/sale-rep/assign'; 
        else if (activeTab === 'unassigned') 
            baseApiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/sale-rep/not-assign'; 

        const params = new URLSearchParams({ page: currentPage, limit: currentLimit }); 
        if (currentQuery) params.append('search', currentQuery); 

        try { 
            const res = await axios.get(`${baseApiUrl}?${params.toString()}`, getAuthConfig()); 
            if (res.data?.status === 'success') { 
                const fetchedData = res.data.data?.data || []; 
                setRawCustomersData(fetchedData); 
                setFilteredCustomers(fetchedData); 
                setPagination(prev => ({ 
                    ...prev, 
                    total: res.data.pagination?.totalItems || 0 
                })); 
            } 
        } catch (error) { 
            toast.error("Failed to load customer list."); 
        } finally { 
            setIsLoading(false); 
            setIsGlobalLoading(false); 
        } 
    }, [activeTab, setIsGlobalLoading]); 

    useEffect(() => { 
        fetchCustomersData(pagination.page, pagination.limit, searchQuery); 
    }, [fetchCustomersData, pagination.page, pagination.limit, searchQuery]); 

    useEffect(() => { 
        let filtered = [...rawCustomersData]; 
        
        if (stateFilter !== 'ALL' && activeTab !== 'unassigned') { 
            const normalizedFilter = stateFilter.replace(/\s+/g, '').toLowerCase(); 
            
            filtered = filtered.filter(customer => { 
                if (!customer.salesRepState) return false;
                const normalizedCustomerState = customer.salesRepState.replace(/\s+/g, '').toLowerCase();
                return normalizedCustomerState === normalizedFilter; 
            }); 
        } 
        setFilteredCustomers(filtered); 
    }, [rawCustomersData, stateFilter, activeTab]); 

    const handleStatusToggle = async (userId, currentStatus, companyName) => { 
        const nextStatus = !currentStatus; 
        const payload = { info: { status: nextStatus } }; 

        toast.promise( 
            axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/customer-update/${userId}`, payload, getAuthConfig()), 
            { 
                pending: `Updating status for ${companyName}...`, 
                success: { 
                    render() { 
                        setRawCustomersData(prev => prev.map(c => c.id === userId ? { ...c, status: nextStatus } : c)); 
                        return `Customer ${companyName} is now ${nextStatus ? 'Active' : 'Inactive'}.`; 
                    } 
                }, 
                error: { 
                    render({data}) { 
                        return data.response?.data?.message || `Failed to update status.`; 
                    } 
                } 
            } 
        ); 
    }; 

    // --- Selection Handlers --- 
    const handleSelectAll = (e) => { 
        if (e.target.checked) setSelectedRows(filteredCustomers.map(c => c.id)); 
        else setSelectedRows([]); 
    }; 
    
    const handleSelectOne = (customerId) => { 
        setSelectedRows(prev => prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]); 
    }; 

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans flex flex-col gap-6"> 
            <CustomerLayout 
                data={filteredCustomers} 
                activeTab={activeTab} 
                onTabChange={(tab) => { 
                    setActiveTab(tab); 
                    setPagination(p => ({ ...p, page: 1 })); 
                    setStateFilter('ALL'); 
                }} 
                totalCount={pagination.total} 
                searchQuery={searchQuery} 
                onSearchChange={(query) => { 
                    setSearchQuery(query); 
                    setPagination(p => ({ ...p, page: 1 })); 
                }} 
                stateFilter={stateFilter} 
                onStateFilterChange={(e) => setStateFilter(e.target.value)} 
                showAssignButton={activeTab === 'unassigned'} 
                isLoading={isLoading} 
                selectedRows={selectedRows} 
                onSelectAll={handleSelectAll} 
                onSelectOne={handleSelectOne} 
                onStatusToggle={handleStatusToggle} 
                pagination={pagination} 
                setPagination={setPagination} 
                refreshData={() => fetchCustomersData(pagination.page, pagination.limit, searchQuery)}
            /> 
        </div> 
    ); 
}; 

export default CustomerManagement;