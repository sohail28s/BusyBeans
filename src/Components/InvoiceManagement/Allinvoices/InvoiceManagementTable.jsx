import React, { useState, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { formatMoney } from '../../../utils/orderUtils'; 
import { SortableHeader } from '../../Shared/Table/SortableHeader'; 
import { TablePagination } from '../../Shared/Table/TablePagination'; // Global Import

export const InvoiceManagementTable = ({ data, isLoading, onDownloadCSV }) => { 
    const navigate = useNavigate(); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'default' }); 
    
    // Pagination state 
    const [pagination, setPagination] = useState({ page: 1, limit: 10 }); // Defaulting limit to 10 for standard view

    // Client-Side Search 
    const filteredData = useMemo(() => { 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.companyName || '').toLowerCase().includes(q) || 
                (item.emailToSendInvoices || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    // Client-Side Sorting (Only for Total Balance) 
    const sortedData = useMemo(() => { 
        let sortableItems = [...filteredData]; 
        if (sortConfig.key === 'totalBalance' && sortConfig.direction !== 'default') { 
            sortableItems.sort((a, b) => { 
                let aVal = parseFloat(a.totalBalance || 0); 
                let bVal = parseFloat(b.totalBalance || 0); 
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1; 
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1; 
                return 0; 
            }); 
        } 
        return sortableItems; 
    }, [filteredData, sortConfig]); 

    // Proper Sort Cycling Logic
    const handleSort = (key) => { 
        let direction = 'asc'; 
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = 'default';
        }
        setSortConfig({ key, direction }); 
    }; 

    // Pagination Slicing
    const paginatedData = useMemo(() => { 
        const start = (pagination.page - 1) * pagination.limit; 
        return sortedData.slice(start, start + pagination.limit); 
    }, [sortedData, pagination.page, pagination.limit]); 

    // --- Pagination Adapter ---
    // Maps the local state to what TablePagination expects
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: sortedData.length
    };

    const handleSetPagination = (updater) => {
        const nextState = typeof updater === 'function' ? updater(adaptedPagination) : updater;
        setPagination({ page: nextState.page, limit: nextState.limit });
    };

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans"> 
            
            {/* Table Toolbar */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                <div className="relative"> 
                    <input 
                        placeholder="Search by company name or email..." 
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
                <button 
                    onClick={() => onDownloadCSV(filteredData)} 
                    disabled={isLoading || data.length === 0} 
                    className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                > 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                        <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                    </svg>
                    <span className="group-hover:text-black text-white font-sans font-medium transition-colors">Download CSV</span> 
                </button> 
            </div> 

            {/* Table Area */} 
            <div className="w-full overflow-x-auto"> 
                {/* ⬇️ Global alignment applied here (text-center) */}
                <table className="w-full text-left whitespace-nowrap border-collapse"> 
                    <thead className="bg-gray-100"> 
                        <tr className="border-b border-gray-200"> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[300px]' to adjust the Customer column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-left min-w-[300px]">Customer</th> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[300px]' to adjust the Invoice Email column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-left min-w-[300px]">Invoice Email</th> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[200px]' to adjust the Total Balance column width */}
                            <SortableHeader label="Total Balance" sortKey="totalBalance" currentSort={sortConfig} onSort={handleSort} width="min-w-[200px]" align="text-left" /> 
                            
                            {/* ⬇️ EDIT WIDTH HERE: Change 'min-w-[200px]' to adjust the Overdue Orders column width */}
                            <th className="px-4 py-4 font-bold text-[#374151] text-base text-left min-w-[200px]">Overdue Orders</th> 
                            
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan="4" className="text-center py-12 text-[#4b5563] text-base italic">Loading records...</td></tr> 
                        ) : paginatedData.length > 0 ? ( 
                            paginatedData.map((item) => ( 
                                <tr 
                                    key={item.id} 
                                    onClick={() => navigate(`/invoices/${item.id}`)} 
                                    // ⬇️ Font settings: text-[#4b5563], text-base, and centered content
                                    className="hover:bg-gray-50 transition-colors text-[#4b5563] text-base text-left cursor-pointer" 
                                > 
                                    <td className="px-4 py-5 max-w-[300px] truncate mx-auto" title={item.companyName}>{item.companyName || '-'}</td> 
                                    <td className="px-4 py-5 max-w-[300px] truncate mx-auto" title={item.emailToSendInvoices}>{item.emailToSendInvoices || '-'}</td> 
                                    <td className="px-4 py-5">{formatMoney(item.totalBalance)}</td> 
                                    <td className="px-4 py-5"> 
                                        {item.overDueOrders > 0 ? item.overDueOrders : 'No overdue'} 
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan="4" className="text-center py-12 text-[#4b5563] text-base italic">No records found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* Shared Pagination Component */}
            <TablePagination 
                pagination={adaptedPagination} 
                setPagination={handleSetPagination} 
                 variant = 'simple'
            /> 

        </div> 
    ); 
};