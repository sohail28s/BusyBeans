import React, { useState, useEffect, useMemo } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../Hooks/useStore'; 
import { exportToCSV } from '../../utils/csvHelper'; 
import { PageStatsHeader } from '../../Components/Shared/PageStatsHeader'; 
import { InvoiceTable } from '../../Components/InvoiceManagement/Allinvoices/InvoicesTable'; 
import { getAuthConfig } from '../../utils/orderUtils'; 
import DeleteInvoiceModal from '../../Components/InvoiceManagement/Allinvoices/DeleteInvoiceModal'; 

const getDatesForPreset = (preset) => { 
    const today = new Date(); 
    const year = today.getFullYear(); 
    const month = today.getMonth(); 
    const date = today.getDate(); 
    const day = today.getDay(); 
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
    let start, end; 
    switch (preset) { 
        case 'All Time': start = new Date(2025, 0, 1); end = today; break; 
        case 'Current year': start = new Date(year, 0, 1); end = new Date(year, 11, 31); break; 
        case 'Current Month': start = new Date(year, month, 1); end = new Date(year, month + 1, 0); break; 
        case 'Current Week': start = new Date(today); start.setDate(date - day); end = new Date(today); end.setDate(date - day + 6); break; 
        case 'Last Year': start = new Date(year - 1, 0, 1); end = new Date(year - 1, 11, 31); break; 
        case 'Last 90 days': start = new Date(today); start.setDate(date - 90); end = today; break; 
        case 'Last Month': start = new Date(year, month - 1, 1); end = new Date(year, month, 0); break; 
        case 'Month to date': start = new Date(year, month, 1); end = today; break; 
        case 'Last week': start = new Date(today); start.setDate(date - day - 7); end = new Date(today); end.setDate(date - day - 1); break; 
        default: return { start: null, end: null }; 
    } 
    return { start: format(start), end: format(end) }; 
}; 

const AllInvoicesPage = () => { 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    
    const [activeInvoiceType, setActiveInvoiceType] = useState('Customer Invoices'); 
    const [activeStatusToggle, setActiveStatusToggle] = useState('All Invoices'); 
    const datePresets = ['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom Range']; 
    const [datePreset, setDatePreset] = useState('All Time'); 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    const [invoices, setInvoices] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [paginationState, setPaginationState] = useState({ page: 1, limit: 100, totalItems: 0, totalPages: 1 }); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [entriesPerPage, setEntriesPerPage] = useState(100); 
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 
    const [searchQuery, setSearchQuery] = useState(''); 
    
    // 2. Fixed duplicate state declaration here
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [invoiceToDelete, setInvoiceToDelete] = useState(null); 
    
    const derivedDateRange = useMemo(() => { 
        if (datePreset === 'Custom Range') return { start: startDate, end: endDate }; 
        return getDatesForPreset(datePreset); 
    }, [datePreset, startDate, endDate]); 
    
    // Header Actions Sync 
    useEffect(() => { 
        setTitle('All Invoices'); 
        setShowProfile(false); 
        setActions( 
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1"> 
                <button onClick={() => setActiveInvoiceType('Customer Invoices')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeInvoiceType === 'Customer Invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} > Customer Invoices </button> 
                <button onClick={() => setActiveInvoiceType('Partner Invoices')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeInvoiceType === 'Partner Invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} > Partner Invoices </button> 
            </div> 
        ); 
        return () => {
            setTitle(''); 
            setShowProfile(true); 
        };
    }, [setTitle, setActions, activeInvoiceType, setShowProfile]); 
    
    // Reset pagination ONLY when API-triggering filters change 
    useEffect(() => { 
        setCurrentPage(1); 
    }, [activeInvoiceType, datePreset, startDate, endDate]); 
    
    // --- Data Fetching (Backend calls) --- 
    const fetchInvoices = async () => { 
        setIsLoading(true); 
        setIsGlobalLoading(true); 
        
        const { start, end } = derivedDateRange; 
        const auth = getAuthConfig(); 
        
        let customerApi = `https://testingbb.trimworldwide.com/api/v1/admin/orders?statusId%5Bne%5D=6&type=all&invoiceDate%5Bne%5D=null&page=${currentPage}&limit=${entriesPerPage}`; 
        let partnerApi = `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/orders-list?statusId%5Bne%5D=6&type=all&invoiceDate%5Bne%5D=null&page=${currentPage}&limit=${entriesPerPage}`; 
        
        if (start) { 
            customerApi += `&on%5Bgte%5D=${start}`; 
            partnerApi += `&on%5Bgte%5D=${start}`; 
        } 
        if (end) { 
            customerApi += `&on%5Blte%5D=${end}`; 
            partnerApi += `&on%5Blte%5D=${end}`; 
        } 
        
        const activeApi = activeInvoiceType === 'Customer Invoices' ? customerApi : partnerApi; 
        
        try { 
            const res = await axios.get(activeApi, auth); 
            if (res.data?.status === 'success') { 
                const fetchedData = res.data.data.data || []; 
                setInvoices(fetchedData); 
                setPaginationState(res.data.pagination); 
            } else { 
                toast.error("Failed to fetch invoices."); 
            } 
        } catch (error) { 
            console.error("Fetch error:", error); 
            toast.error("An error occurred while fetching invoices."); 
        } finally { 
            setIsLoading(false); 
            setIsGlobalLoading(false); 
        } 
    }; 
    
    // Only fetch when these specific parameters change 
    useEffect(() => { 
        fetchInvoices(); 
    }, [activeInvoiceType, derivedDateRange, currentPage, entriesPerPage]); 
    
    const handleDownloadCSV = () => { 
        if (!invoices.length) return toast.info("No records to export."); 
        const fileNameSuffix = datePreset === 'Custom Range' ? `${startDate}_to_${endDate}` : datePreset; 
        const fileName = `Invoices_${activeInvoiceType.replace(' ', '_')}_${fileNameSuffix.replace(' ', '_')}.csv`; 
        
        const csvFormatted = invoices.map((item) => { 
            const commonData = { 
                'ID': item.id, 
                'Invoice Number': item.invoiceNumber || '-', 
                'Type': item.type || '-', 
                'Invoice Date': item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-', 
                'Total': item.totalBill ? `$${item.totalBill}` : '$0.00', 
                'Payment Status': (item.paymentStatus === 'done' || item.paymentStatus === 'paid') ? 'Paid' : 'Unpaid', 
                'Current Status': item.orderCurrentStatus || '-' 
            }; 
            if (activeInvoiceType === 'Customer Invoices') { 
                return { ...commonData, 'Company Name': item.companyName || '-' }; 
            } else { 
                return { ...commonData, 'Local Partner Name': item.salesRepName || '-' }; 
            } 
        }); 
        exportToCSV(csvFormatted, fileName); 
    }; 
    
    // 3. Handle Delete Click correctly triggers the modal
    const handleDeleteClick = (invoice) => { 
        setInvoiceToDelete(invoice); 
        setIsDeleteModalOpen(true); 
    }; 
    
    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6"> 
            
            {/* Top Control Bar: Status Buttons */} 
            <div> 
                {['All Invoices', 'Paid Invoices', 'Unpaid Invoices'].map(toggleLabel => ( 
                    <button 
                        key={toggleLabel} 
                        onClick={() => setActiveStatusToggle(toggleLabel)} 
                        className={`font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 max-sm:w-60 transition-colors ${activeStatusToggle === toggleLabel ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100' }`} 
                    > 
                        {toggleLabel} 
                    </button> 
                ))} 
            </div> 
            
            <div className="flex flex-wrap items-center gap-4"> 
    <div className="flex items-center gap-2"> 
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date range:</label> 
        <div className="relative w-[200px]"> 
            
            {/* Custom Dropdown Trigger */}
            <div 
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className={`w-full h-10 pl-3 pr-1 bg-white border rounded-md text-sm text-gray-800 outline-none cursor-pointer flex items-center justify-between shadow-sm transition-all ${
                    isDateDropdownOpen ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <span className="truncate">{datePreset}</span>
                <div className="flex items-center pointer-events-none">
                    <span className="w-px h-[20px] bg-gray-300 mx-1"></span>
                    <div className="flex items-center justify-center px-1.5 text-gray-400">
                        <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="currentColor">
                            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Custom Dropdown Menu */}
            {isDateDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[250px] overflow-y-auto py-1">
                    {datePresets.map(preset => (
                        <div 
                            key={preset}
                            onClick={() => {
                                setDatePreset(preset);
                                setIsDateDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                datePreset === preset 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-800 hover:bg-blue-50'
                            }`}
                        >
                            {preset}
                        </div>
                    ))}
                </div>
            )}
        </div> 
    </div> 
    
    {/* Custom Range Date Inputs */}
    {datePreset === 'Custom Range' && ( 
        <div className="flex flex-wrap gap-2 items-center text-sm font-medium text-gray-700 animate-fadeIn"> 
            <label>From:</label> 
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ colorScheme: 'light' }} className="h-10 px-3 bg-white border border-gray-300 rounded-md outline-none focus:border-black shadow-sm" /> 
            <label className="ml-2">To:</label> 
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ colorScheme: 'light' }} className="h-10 px-3 bg-white border border-gray-300 rounded-md outline-none focus:border-black shadow-sm" /> 
        </div> 
    )} 
</div>
            
            {/* Page Stats (Total Invoices) */} 
            <div className="w-[300px]"> 
                <PageStatsHeader cardTitle="Total Invoices" totalValue={isLoading ? '...' : paginationState.totalItems} /> 
            </div> 
            
            {/* Invoices Table */} 
            <div className="flex-1 w-full relative"> 
                <InvoiceTable 
                    invoiceType={activeInvoiceType} 
                    data={invoices} 
                    isLoading={isLoading} 
                    pagination={paginationState} 
                    setCurrentPage={setCurrentPage} 
                    entriesPerPage={entriesPerPage} 
                    setEntriesPerPage={setEntriesPerPage} 
                    sortConfig={sortConfig} 
                    setSortConfig={setSortConfig} 
                    handleDownloadCSV={handleDownloadCSV} 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    onDeleteClick={handleDeleteClick} 
                    activeStatusToggle={activeStatusToggle} 
                /> 
                
                <DeleteInvoiceModal 
                    isOpen={isDeleteModalOpen} 
                    onClose={() => { 
                        setIsDeleteModalOpen(false); 
                        setInvoiceToDelete(null); 
                    }} 
                    invoiceData={invoiceToDelete} 
                    activeTab={activeInvoiceType} 
                    onSuccess={fetchInvoices} 
                /> 
            </div> 
        </div> 
    ); 
};
export default AllInvoicesPage;