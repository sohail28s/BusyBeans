import React, { useState, useMemo } from 'react'; 
import { SortableHeader } from '../../Shared/Table/SortableHeader'; 
import { TablePagination } from '../../Shared/Table/TablePagination'; 
import { formatMoney } from '../../../utils/orderUtils';
import { CustomCheckbox } from '../../Shared/Table/CustomCheckbox';

export const PayoutsTable = ({ viewMode, data, isLoading, pagination, setPagination, selectedIds, setSelectedIds, onDownloadCSV }) => { 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 

    // 1. Client-Side Search 
    const filteredData = useMemo(() => { 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return (item.companyName || '').toLowerCase().includes(q); 
        }); 
    }, [data, searchQuery]); 

    // 2. Client-Side Sort (Only for SL and Invoice #) 
    const sortedData = useMemo(() => { 
        let sortableItems = [...filteredData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            sortableItems.sort((a, b) => { 
                let aVal = a[sortConfig.key]; 
                let bVal = b[sortConfig.key]; 
                if (sortConfig.key === 'id') { 
                    aVal = parseInt(aVal, 10); 
                    bVal = parseInt(bVal, 10); 
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
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; 
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default'; 
        setSortConfig({ key, direction }); 
    }; 

    // --- Dynamic Checkbox Logic (Not Transferred Only) --- 
    const displayedIds = useMemo(() => sortedData.map(item => item.id), [sortedData]); 
    const isAllSelected = displayedIds.length > 0 && displayedIds.every(id => selectedIds.includes(id)); 

    const handleSelectAll = (e) => { 
        if (isAllSelected) { 
            setSelectedIds(prev => prev.filter(id => !displayedIds.includes(id))); 
        } else { 
            setSelectedIds(prev => [...new Set([...prev, ...displayedIds])]); 
        } 
    }; 

    const handleRowSelect = (id) => { 
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]); 
    }; 

    // --- Pagination Adapter ---
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.totalItems || pagination.total || 0
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
                        placeholder="Search by company name..." 
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
                    onClick={onDownloadCSV} 
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
                <table className="w-full text-left min-w-[1500px] border-collapse"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr className="border-b border-[#e2e8f0]"> 
                            {/* Checkbox Column (Only for Not Transferred) */} 
                            {viewMode === 'Not Transferred' && ( 
                                <th className="w-12 px-4 py-5 text-center"> 
                                    <div className="flex justify-center items-center w-full h-full">
                                        <CustomCheckbox 
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </div>
                                </th> 
                            )} 
                            
                            <SortableHeader label="SL" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[50px]" align="text-left" /> 
                            <SortableHeader label="Invoice #" sortKey="invoiceNumber" currentSort={sortConfig} onSort={handleSort} width="w-[180px]" align="text-left" /> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Employee Name</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Company Name</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap text-center">Stripe Connected</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Employee Commission Amount</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Applied Commission %</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Payment Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Shipping Charges</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Order Amount</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Totals</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan={viewMode === 'Not Transferred' ? 12 : 11} className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading payouts...</td></tr> 
                        ) : sortedData.length > 0 ? ( 
                            sortedData.map((item, index) => { 
                                const isStripeConnected = Boolean(item.stripeConnectAccountId); 
                                const isPaid = item.paymentStatus === 'done' || item.paymentStatus === 'paid'; 
                                const isSelected = selectedIds.includes(item.id);
                                
                                return ( 
                                    <tr key={item.id} className={`transition-colors text-[#4b5563] text-[14px] hover:bg-gray-50 ${isSelected ? 'bg-gray-50' : ''}`}> 
                                        
                                        {/* Checkbox Column */} 
                                        {viewMode === 'Not Transferred' && ( 
                                            <td className="w-12 px-4 py-5 text-center"> 
                                                <div className="flex justify-center items-center w-full h-full">
                                                    <CustomCheckbox 
                                                        checked={isSelected}
                                                        onChange={() => handleRowSelect(item.id)}
                                                    />
                                                </div>
                                            </td> 
                                        )} 
                                        
                                        <td className="px-8 py-5 text-gray-900">{((pagination.page - 1) * pagination.limit) + (index + 1)}</td> 
                                        <td className="px-8 py-5 text-gray-900 font-medium">{item.invoiceNumber || '-'}</td> 
                                        <td className="px-8 py-5 text-gray-900">{item.employeeName || '-'}</td> 
                                        <td className="px-8 py-5 text-gray-900 max-w-[200px] truncate" title={item.companyName}>{item.companyName || '-'}</td> 
                                        
                                        <td className="px-8 py-5 text-center"> 
                                            <div className="flex justify-center">
                                                {isStripeConnected ? ( 
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-white" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                                            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                                                        </svg>
                                                    </div>
                                                ) : ( 
                                                    <span className="text-gray-400">-</span> 
                                                )} 
                                            </div>
                                        </td> 
                                        
                                        <td className="px-8 py-5 font-medium text-gray-800">{formatMoney(item.employeeCommisionAmount)}</td> 
                                        <td className="px-8 py-5 text-gray-900">{parseFloat(item.AppliedEmployeeCommisionPercentage || 0).toFixed(2)}%</td> 
                                        
                                        <td className="px-8 py-5"> 
                                            <div className="flex justify-start">
                                                <div className={`w-max font-bold px-3 py-1.5 rounded-md flex justify-center text-[13px] ${isPaid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500 capitalize'}`}>
                                                    {isPaid ? 'Paid' : item.paymentStatus}
                                                </div>
                                            </div>
                                        </td> 
                                        
                                        <td className="px-8 py-5 text-gray-900">{formatMoney(item.shippingCharges)}</td> 
                                        <td className="px-8 py-5 text-gray-900">{formatMoney(item.subTotal)}</td> 
                                        <td className="px-8 py-5 text-gray-900 font-medium">{formatMoney(item.totalBill)}</td> 
                                    </tr> 
                                ) 
                            }) 
                        ) : ( 
                            <tr><td colSpan={viewMode === 'Not Transferred' ? 12 : 11} className="text-center py-12 text-[#4b5563] text-[15px] italic">No records found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* Global Pagination */} 
            <TablePagination 
                pagination={adaptedPagination} 
                setPagination={handleSetPagination} 
                variant='simple'
            /> 
            
        </div> 
    ); 
};