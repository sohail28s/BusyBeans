

import React, { useState, useMemo } from 'react'; 
import { formatMoney, formatDate } from '../../utils/orderUtils'; 
import { TablePagination } from '../../Components/Shared/Table/TablePagination'; 
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader'; 
import { exportToCSV } from '../../utils/csvHelper'; 

const PulloutIntentTable = ({ data, isLoading, pagination, setPagination, selectedRows, setSelectedRows, isSyncTab }) => { 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 

    // --- Search Logic --- 
    const filteredData = useMemo(() => { 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.invoiceNumber || '').toLowerCase().includes(q) || 
                (item.companyName || '').toLowerCase().includes(q) || 
                (item.salesRepName || '').toLowerCase().includes(q) || 
                (item.id || '').toString().toLowerCase().includes(q) || 
                (item.pulloutIntentId || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    // --- Sorting Logic --- 
    const sortedData = useMemo(() => { 
        let sortableItems = [...filteredData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            sortableItems.sort((a, b) => { 
                let aVal = a[sortConfig.key]; 
                let bVal = b[sortConfig.key]; 
                if (sortConfig.key === 'totalBill' || sortConfig.key === 'adminReceivableAmount' || sortConfig.key === 'localPatnerCommission') { 
                    aVal = parseFloat(aVal || 0); 
                    bVal = parseFloat(bVal || 0); 
                } else if (sortConfig.key === 'on' || sortConfig.key === 'pulloutDate') { 
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
        if (['pulloutIntentId', 'quickBooksInvoiceId', 'pulloutIntentIdSynced', 'pendingReason'].includes(key)) { 
            return; 
        } 
        let direction = 'asc'; 
        if (sortConfig.key === key) { 
            if (sortConfig.direction === 'asc') direction = 'desc'; 
            else if (sortConfig.direction === 'desc') direction = 'default'; 
        } 
        setSortConfig({ key, direction }); 
    }; 

    // --- Checkbox Logic --- 
    const handleSelectAll = (e) => { 
        if (e.target.checked) { 
            setSelectedRows(sortedData.map(item => item.id)); 
        } else { 
            setSelectedRows([]); 
        } 
    }; 
    
    const handleSelectRow = (id) => { 
        if (selectedRows.includes(id)) { 
            setSelectedRows(selectedRows.filter(rowId => rowId !== id)); 
        } else { 
            setSelectedRows([...selectedRows, id]); 
        } 
    }; 

    // --- CSV Export --- 
    const handleDownloadCSV = () => { 
        if (!sortedData.length) return; 
        const csvData = sortedData.map(item => ({ 
            'Invoice #': item.invoiceNumber || '-', 
            'Order Date': formatDate(item.on), 
            'Company': item.companyName || '-', 
            'Sales Rep': item.salesRepName || '-', 
            'Partner Type': item.partnerType || '-', 
            'Status': item.paymentStatus || '-', 
            'Total Bill': `$${item.totalBill}`, 
            'Admin Recv (Status)': item.adminReceivableStatus === 1 ? 'Yes' : 'No', 
            'Admin Recv ($)': `$${item.adminReceivableAmount}`, 
            'Partner Comm ($)': `$${item.localPatnerCommission}`, 
            'Pullout Intent ID': item.pulloutIntentId || '-', 
            'Pullout Date': item.pulloutDate ? formatDate(item.pulloutDate) : '-', 
            'QBO Invoice ID': item.quickBooksInvoiceId || '-', 
            'Sync State': item.pulloutIntentIdSynced || '-', 
            'Pending Reason': item.pendingReason || '-' 
        })); 
        exportToCSV(csvData, 'Pullout_Intent_Sync_Data.csv'); 
    }; 

    return ( 
        <div data-testid="pullout-intent-qbo-sync-table-wrapper"> 
            <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6"> 
                
                {/* Search & Download Header */} 
                <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                    <div className="relative"> 
                        <input placeholder="Search table…" className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-gray-100 rounded-lg pl-10 pr-5 outline-none placeholder:font-inter placeholder:font-medium focus:bg-gray-200 text-sm" data-testid="search-input" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> 
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" color="#111827" className="absolute top-3.5 left-3 text-gray-900" height="20" width="20" xmlns="http://www.w3.org/2000/svg"> 
                            <circle cx="11" cy="11" r="8"></circle> 
                            <path d="m21 21-4.3-4.3"></path> 
                        </svg> 
                    </div> 
                    <button onClick={handleDownloadCSV} className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white duration-200 group" data-testid="download-csv" > 
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"> 
                            <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path> 
                        </svg> 
                        <span className="group-hover:text-black text-white font-inter font-medium text-sm transition-colors">Download CSV</span> 
                    </button> 
                </div> 
                
                {/* Table Container */} 
                <div className="w-full overflow-x-auto custom-scrollbar pb-4"> 
                    <table className="w-full text-left whitespace-nowrap min-w-[2000px]"> 
                        
                        {/* ⬇️ MAGIC CSS OVERRIDES: Force text-left and justify-start on all SortableHeaders ⬇️ */}
                        <thead className="bg-[#f9fafb] [&_th]:!text-left [&_th_div]:!justify-start"> 
                            <tr className="border-b border-gray-100"> 
                                {/* Checkbox Header - explicitly revert the left align to keep it centered */} 
                                {!isSyncTab && ( 
                                    <th className="px-4 py-4 w-[60px] !text-center [&_div]:!justify-center"> 
                                        <div className="relative inline-flex items-center justify-center"> 
                                            <input type="checkbox" className="peer absolute inset-0 w-5 h-5 cursor-pointer opacity-0 z-[1]" checked={selectedRows.length > 0 && selectedRows.length === sortedData.length} onChange={handleSelectAll} /> 
                                            <span className="pointer-events-none w-5 h-5 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center transition-colors duration-150 ease-out peer-hover:border-gray-400 peer-focus:ring-2 peer-focus:ring-gray-400/40 peer-checked:bg-gray-800 peer-checked:border-gray-800 peer-checked:[&>svg.check-icon]:opacity-100"> 
                                                <svg className="check-icon w-3.5 h-3.5 text-white shrink-0 opacity-0 transition-opacity duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> 
                                                    <path d="M5 13l4 4L19 7"></path> 
                                                </svg> 
                                            </span> 
                                        </div> 
                                    </th> 
                                )} 
                                
                                <SortableHeader label="SL" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="min-w-[80px]" align="text-left" /> 
                                <SortableHeader label="Invoice #" sortKey="invoiceNumber" currentSort={sortConfig} onSort={handleSort} width="min-w-[140px]" align="text-left" /> 
                                <SortableHeader label="Order date" sortKey="on" currentSort={sortConfig} onSort={handleSort} width="min-w-[140px]" align="text-left" /> 
                                <SortableHeader label="Company" sortKey="companyName" currentSort={sortConfig} onSort={handleSort} width="min-w-[180px]" align="text-left" /> 
                                <SortableHeader label="Sales rep" sortKey="salesRepName" currentSort={sortConfig} onSort={handleSort} width="min-w-[160px]" align="text-left" /> 
                                <SortableHeader label="Partner type" sortKey="partnerType" currentSort={sortConfig} onSort={handleSort} width="min-w-[160px]" align="text-left" /> 
                                <SortableHeader label="Payment status" sortKey="paymentStatus" currentSort={sortConfig} onSort={handleSort} width="min-w-[140px]" align="text-left" /> 
                                <SortableHeader label="Total bill $" sortKey="totalBill" currentSort={sortConfig} onSort={handleSort} width="min-w-[120px]" align="text-left" /> 
                                <SortableHeader label="Admin receivable" sortKey="adminReceivableStatus" currentSort={sortConfig} onSort={handleSort} width="min-w-[160px]" align="text-left" /> 
                                <SortableHeader label="Admin receivable $" sortKey="adminReceivableAmount" currentSort={sortConfig} onSort={handleSort} width="min-w-[160px]" align="text-left" /> 
                                <SortableHeader label="Partner commission $" sortKey="localPatnerCommission" currentSort={sortConfig} onSort={handleSort} width="min-w-[180px]" align="text-left" /> 
                                
                                <th className="px-4 py-4 font-bold text-[#374151] text-sm min-w-[240px] !text-left">Pullout intent ID</th> 
                                <SortableHeader label="Pullout date" sortKey="pulloutDate" currentSort={sortConfig} onSort={handleSort} width="min-w-[140px]" align="text-left" /> 
                                <th className="px-4 py-4 font-bold text-[#374151] text-sm min-w-[160px] !text-left">QBO invoice ID</th> 
                                <th className="px-4 py-4 font-bold text-[#374151] text-sm min-w-[140px] !text-left">Sync state</th> 
                                <th className="px-4 py-4 font-bold text-[#374151] text-sm min-w-[200px] !text-left">Pending reason</th> 
                            </tr> 
                        </thead> 
                        
                        <tbody> 
                            {isLoading ? ( 
                                <tr><td colSpan="17" className="text-center py-12 text-gray-500">Loading...</td></tr> 
                            ) : sortedData.length > 0 ? ( 
                                sortedData.map((item, index) => { 
                                    const slNumber = ((pagination.page - 1) * pagination.limit) + index + 1; 
                                    return ( 
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 text-[14px] text-gray-600 transition-colors"> 
                                            {!isSyncTab && ( 
                                                <td className="px-4 py-5 text-center"> 
                                                    <div className="relative inline-flex items-center justify-center"> 
                                                        <input type="checkbox" className="peer absolute inset-0 w-5 h-5 cursor-pointer opacity-0 z-[1]" checked={selectedRows.includes(item.id)} onChange={() => handleSelectRow(item.id)} /> 
                                                        <span className="pointer-events-none w-5 h-5 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center transition-colors duration-150 ease-out peer-hover:border-gray-400 peer-focus:ring-2 peer-focus:ring-gray-400/40 peer-checked:bg-gray-800 peer-checked:border-gray-800 peer-checked:[&>svg]:opacity-100"> 
                                                            <svg className="check-icon w-3.5 h-3.5 text-white shrink-0 opacity-0 transition-opacity duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> 
                                                                <path d="M5 13l4 4L19 7"></path> 
                                                            </svg> 
                                                        </span> 
                                                    </div> 
                                                </td> 
                                            )} 
                                            <td className="pl-8 py-5 text-left">{slNumber}</td> 
                                            <td className="pl-8 py-5 text-left">{item.invoiceNumber || '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.on ? formatDate(item.on) : '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.companyName || '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.salesRepName || '-'}</td> 
                                            <td className="pl-8 py-5 capitalize text-left">{item.partnerType ? item.partnerType.replace('-', ' ') : '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.paymentStatus || '-'}</td> 
                                            <td className="pl-8 py-5 text-left">${formatMoney(item.totalBill)}</td> 
                                            <td className="pl-8 py-5 text-left">{item.adminReceivableStatus === 1 ? 'Yes' : 'No'}</td> 
                                            <td className="pl-8 py-5 text-left">${formatMoney(item.adminReceivableAmount)}</td> 
                                            <td className="pl-8 py-5 text-left">${formatMoney(item.localPatnerCommission)}</td> 
                                            <td className="pl-4 py-5 text-left">{item.pulloutIntentId || '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.pulloutDate ? formatDate(item.pulloutDate) : '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.quickBooksInvoiceId || '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.pulloutIntentIdSynced || '-'}</td> 
                                            <td className="pl-8 py-5 text-left">{item.pendingReason || '-'}</td> 
                                        </tr> 
                                    ); 
                                }) 
                            ) : ( 
                                <tr><td colSpan="17" className="text-center py-12 text-gray-500">No data found.</td></tr> 
                            )} 
                        </tbody> 
                    </table> 
                </div> 
                <TablePagination pagination={{ page: pagination.page, limit: pagination.limit, total: pagination.totalItems }} setPagination={setPagination} /> 
            </div> 
        </div> 
    ); 
}; 

export default PulloutIntentTable;