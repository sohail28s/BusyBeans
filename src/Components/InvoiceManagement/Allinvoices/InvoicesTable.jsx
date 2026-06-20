import React, { useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { formatMoney, formatDate } from '../../../utils/orderUtils'; 
import { SortableHeader } from '../../Shared/Table/SortableHeader'; 
import { TablePagination } from '../../Shared/Table/TablePagination'; 

export const InvoiceTable = ({ 
    invoiceType, 
    data, 
    isLoading, 
    pagination, 
    setCurrentPage, 
    entriesPerPage, 
    setEntriesPerPage, 
    sortConfig, 
    setSortConfig, 
    handleDownloadCSV, 
    searchQuery, 
    setSearchQuery, 
    onDeleteClick, 
    activeStatusToggle 
}) => { 
    const navigate = useNavigate(); 

    // 1. Frontend Search & Status Filtering 
    const filteredData = useMemo(() => { 
        return data.filter(item => { 
            // Search filter 
            const q = searchQuery.toLowerCase(); 
            const matchesSearch = !searchQuery || ( 
                (item.invoiceNumber || '').toLowerCase().includes(q) || 
                (item.companyName || '').toLowerCase().includes(q) || 
                (item.salesRepName || '').toLowerCase().includes(q) || 
                (item.id || '').toString().toLowerCase().includes(q) 
            ); 
            
            // Paid/Unpaid filter 
            const isPaid = item.paymentStatus === 'done' || item.paymentStatus === 'paid'; 
            let matchesStatus = true; 
            if (activeStatusToggle === 'Paid Invoices') matchesStatus = isPaid; 
            if (activeStatusToggle === 'Unpaid Invoices') matchesStatus = !isPaid; 
            
            return matchesSearch && matchesStatus; 
        }); 
    }, [data, searchQuery, activeStatusToggle]); 

    // 2. Frontend Sorting 
    const sortedData = useMemo(() => { 
        let sortableItems = [...filteredData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            sortableItems.sort((a, b) => { 
                let aVal = a[sortConfig.key]; 
                let bVal = b[sortConfig.key]; 
                
                if (sortConfig.key === 'id') { 
                    aVal = parseInt(aVal, 10); 
                    bVal = parseInt(bVal, 10); 
                } else if (sortConfig.key === 'totalBill') { 
                    aVal = parseFloat(aVal || 0); 
                    bVal = parseFloat(bVal || 0); 
                } else if (sortConfig.key === 'invoiceDate' || sortConfig.key === 'deliveryDate') { 
                    aVal = aVal ? new Date(aVal).getTime() : 0; 
                    bVal = bVal ? new Date(bVal).getTime() : 0; 
                } else { 
                    aVal = (aVal || '').toString().toLowerCase(); 
                    bVal = (bVal || '').toString().toLowerCase(); 
                } 
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1; 
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1; 
                return 0; 
            }); 
        } 
        return sortableItems; 
    }, [filteredData, sortConfig]); 

    const handleSort = (key) => { 
        let direction = 'asc'; 
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = 'default';
        }
        setSortConfig({ key, direction }); 
    }; 

    // --- Navigation Logic --- 
    const handleRowClick = (item) => { 
        const orderId = item.id; 
        let detailsUrl = ""; 
        if (invoiceType === 'Customer Invoices') { 
            if (item.type === 'direct-invoice') { 
                detailsUrl = `/direct-invoices/${orderId}`; 
            } else { 
                detailsUrl = `/orders/details/${orderId}`; 
            } 
        } else { 
            if (item.type === 'direct-invoice') { 
                detailsUrl = `/all-invoices/partner/${orderId}`; 
            } else { 
                detailsUrl = `/orders/partnerOrders/detail/${orderId}`; 
            } 
        } 
        navigate(detailsUrl, { state: { orderId: orderId, orderData: item } }); 
    }; 

    // --- Pagination Adapter ---
    const adaptedPagination = {
        page: pagination?.page || 1,
        limit: entriesPerPage || 10,
        total: pagination?.totalItems || data.length || 0
    };

    const handleSetPagination = (updater) => {
        const nextState = typeof updater === 'function' ? updater(adaptedPagination) : updater;
        if (nextState.page !== adaptedPagination.page && setCurrentPage) {
            setCurrentPage(nextState.page);
        }
        if (nextState.limit !== adaptedPagination.limit && setEntriesPerPage) {
            setEntriesPerPage(nextState.limit);
        }
    };

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border
         border-gray-200 shadow-sm space-y-6 font-sans mt-8"> 
            
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                <div className="relative"> 
                    <input 
                        placeholder="Search by Id, invoice number, company name..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg pl-10 pr-5 outline-none placeholder:font-sans placeholder:font-medium focus:bg-gray-200 transition-colors text-[14px] text-gray-700" 
                        type="search" 
                    /> 
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute top-3 md:top-3.5 left-3 text-gray-900" height="20" width="20">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </div> 

                {/* Download Button */}
                <button 
                    onClick={handleDownloadCSV} 
                    disabled={isLoading || data.length === 0} 
                    className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                > 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                        <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                    </svg>
                    <span className="group-hover:text-black text-white font-sans font-medium transition-colors">Download CSV</span> 
                </button> 
            </div> 

            <div className="w-full overflow-x-auto"> 
                {/* ⬇️ Global alignment applied here (text-center) */}
                <table className="w-full text-center whitespace-nowrap border-collapse"> 
                    <thead className="bg-gray-100"> 
                        <tr className="border-b border-gray-200"> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[80px]' to adjust the ID column width */}
                            <SortableHeader label="#" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="min-w-[140px]" align="text-center" /> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[280px]' to adjust the Company Name column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-center min-w-[320px]">
                                {invoiceType === 'Customer Invoices' ? 'Company Name' : 'Local Partner Name'}
                            </th> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[160px]' to adjust the Type column width */}
                            <SortableHeader label="Type" sortKey="type" currentSort={sortConfig} onSort={handleSort} width="min-w-[180px]" align="text-center" /> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[160px]' to adjust the Invoice Date column width */}
                            <SortableHeader label="Invoice Date" sortKey="invoiceDate" currentSort={sortConfig} onSort={handleSort} width="min-w-[180px]" align="text-center" /> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[160px]' to adjust the Deliver On column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-center min-w-[180px]">Deliver On</th>
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[160px]' to adjust the Total column width */}
                            <SortableHeader label="Total" sortKey="totalBill" currentSort={sortConfig} onSort={handleSort} width="min-w-[160px]" align="text-center" /> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[140px]' to adjust the Invoice Status column width */}
                            <SortableHeader label="Invoice" sortKey="paymentStatus" currentSort={sortConfig} onSort={handleSort} width="min-w-[140px]" align="text-center" /> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[180px]' to adjust the Status column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-center min-w-[180px]">Status</th> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[140px]' to adjust the Action column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-center min-w-[140px]">Action</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan="9" className="text-center py-12 text-[#4b5563] text-base italic">Loading invoices...</td></tr> 
                        ) : sortedData.length > 0 ? ( 
                            sortedData.map((item) => { 
                                const isPaid = item.paymentStatus === 'done' || item.paymentStatus === 'paid'; 
                                return ( 
                                    <tr 
                                        key={item.id} 
                                        // ⬇️ Font settings: text-[#4b5563], text-base, and centered content
                                        className="hover:bg-gray-50 transition-colors text-[#4b5563] text-base text-center cursor-pointer" 
                                        onClick={() => handleRowClick(item)} 
                                    > 
                                        <td className="px-4 py-5 font-medium">{item.id}</td> 
                                        <td className="px-4 py-5 max-w-[280px] truncate mx-auto" title={item.companyName || item.salesRepName}>
                                            {invoiceType === 'Customer Invoices' ? (item.companyName || '-') : (item.salesRepName || '-')}
                                        </td> 
                                        <td className="px-4 py-5 capitalize">{item.type ? item.type.replace('-', ' ') : '-'}</td> 
                                        <td className="px-4 py-5">{formatDate(item.invoiceDate)}</td> 
                                        <td className="px-4 py-5">{formatDate(item.deliveryDate) || '-'}</td> 
                                        <td className="px-4 py-5 font-medium">${formatMoney(item.totalBill)}</td> 
                                        <td className="px-4 py-5 capitalize">{isPaid ? 'Paid' : 'Unpaid'}</td> 
                                        <td className="px-4 py-5 capitalize">{item.orderCurrentStatus || '-'}</td> 
                                        
                                        <td className="px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}> 
                                            <div className="flex items-center justify-center gap-x-2"> 
                                                <button 
                                                    onClick={() => handleRowClick(item)} 
                                                    className="border border-[#86644c] rounded-md p-2 text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors outline-none" 
                                                    title="View Details" 
                                                > 
                                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
                                                    </svg>
                                                </button> 
                                                <button 
                                                    onClick={() => onDeleteClick(item)} 
                                                    className="border border-red-400 rounded-md p-2 text-red-500 hover:bg-red-50 transition-colors outline-none" 
                                                    title="Delete Invoice" 
                                                > 
                                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                    </svg>
                                                </button> 
                                            </div> 
                                        </td> 
                                    </tr> 
                                ) 
                            }) 
                        ) : ( 
                            <tr><td colSpan="9" className="text-center py-12 text-[#4b5563] text-base italic">No invoices found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            <TablePagination 
                pagination={adaptedPagination} 
                setPagination={handleSetPagination} 
            /> 
            
        </div> 
    ); 
};