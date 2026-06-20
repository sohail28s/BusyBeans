import React, { useState, useMemo, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../../Hooks/useStore';
import { TablePagination } from '../../Shared/Table/TablePagination'; 
import { SortableHeader } from '../../Shared/Table/SortableHeader'; 
import { formatMoney, formatDate } from '../../../utils/orderUtils';

export const PurchasedSubscriptionsTable = ({ data, isLoading, searchQuery, setSearchQuery, onDownloadCSV, onDelete }) => { 
    const navigate = useNavigate(); 
    
    // Global Loading State
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    // Sync local loading with global loading
    useEffect(() => {
        setIsGlobalLoading(isLoading);
    }, [isLoading, setIsGlobalLoading]);

    // --- Pagination State --- 
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: data?.length || 0 }); 
    
    // --- Sorting State (Only for 'serial' as requested) --- 
    const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'asc' | 'desc' 
    
    // 1. Client-Side Search Logic 
    const filteredData = useMemo(() => { 
        if (!data) return []; 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.customerEmail || '').toLowerCase().includes(q) || 
                (item.userName || '').toLowerCase().includes(q) || 
                (item.machine?.name || '').toLowerCase().includes(q) || 
                (item.status || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    // 2. Attach True SL Value 
    const baseData = useMemo(() => { 
        return filteredData.map((item, index) => ({ 
            ...item, 
            calculatedSL: index + 1 
        })); 
    }, [filteredData]); 

    // 3. Update Pagination Total 
    useEffect(() => { 
        setPagination(p => ({ ...p, total: baseData.length })); 
    }, [baseData.length]); 

    // 4. Client-Side Sort Logic (Only for SL) 
    const sortedData = useMemo(() => { 
        let displayData = [...baseData]; 
        if (sortOrder === 'asc') { 
            displayData.sort((a, b) => a.calculatedSL - b.calculatedSL); 
        } else if (sortOrder === 'desc') { 
            displayData.sort((a, b) => b.calculatedSL - a.calculatedSL); 
        } 
        return displayData; 
    }, [baseData, sortOrder]); 

    const toggleSort = () => { 
        if (sortOrder === 'default') setSortOrder('asc'); 
        else if (sortOrder === 'asc') setSortOrder('desc'); 
        else setSortOrder('default'); 
    }; 

    // 5. Slice for Pagination 
    const paginatedData = useMemo(() => { 
        const start = (pagination.page - 1) * pagination.limit; 
        return sortedData.slice(start, start + pagination.limit); 
    }, [sortedData, pagination.page, pagination.limit]); 

    // --- View Details Navigation --- 
    const handleViewDetails = (id) => { 
        navigate(`/purchased/${id}`); 
    }; 

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans mt-8"> 
            
            {/* --- Controls Section --- */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                {/* Search */}
                <div className="relative"> 
                    <input 
                        placeholder="Search ..." 
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

                {/* Download */}
                <button 
                    onClick={onDownloadCSV} 
                    disabled={isLoading || data.length === 0} 
                    className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                > 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                        <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                    </svg>
                    <span className="group-hover:text-black text-white font-sans font-medium transition-colors">Download CSV</span> 
                </button> 
            </div> 

            {/* --- Table Section --- */} 
            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left whitespace-nowrap border-collapse"> 
                    <thead className="border-b border-gray-200"> 
                        <tr> 
                            <SortableHeader label="#" sortKey="serial" currentSort={{ key: 'serial', direction: sortOrder }} onSort={toggleSort} width="min-w-[4rem]" /> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Customer</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Customer Name</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Machine</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Machine Price</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Products Total</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Add-ons Total</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Total Price/Mo</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Days</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Status</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Period Start</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Period End</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Created At</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] text-center min-w-[8rem]">Action</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr> 
                                <td colSpan="14" className="text-center py-12 text-gray-500 italic">Loading subscriptions...</td> 
                            </tr> 
                        ) : paginatedData.length > 0 ? ( 
                            paginatedData.map((sub) => { 
                                const isActive = sub.status?.toLowerCase() === 'active'; 
                                const isPending = sub.status?.toLowerCase() === 'pending_payment';
                                
                                const statusClass = isActive 
                                    ? "bg-green-100 text-green-700" 
                                    : isPending 
                                        ? "bg-yellow-100 text-yellow-700" 
                                        : "bg-gray-100 text-gray-700"; 
                                
                                return ( 
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors text-gray-600 text-[14px]"> 
                                        <td className="px-4 py-5 font-medium text-gray-900">{sub.calculatedSL}</td> 
                                        <td className="px-4 py-5">{sub.customerEmail}</td> 
                                        <td className="px-4 py-5">{sub.userName}</td> 
                                        <td className="px-4 py-5">{sub.machine?.name || '-'}</td> 
                                        <td className="px-4 py-5">${formatMoney(sub.machinePrice)}</td> 
                                        <td className="px-4 py-5">${formatMoney(sub.productsTotal)}</td> 
                                        <td className="px-4 py-5">${formatMoney(sub.addonsTotal)}</td> 
                                        <td className="px-4 py-5 font-bold text-[#86644c]">${formatMoney(sub.totalPrice)}</td> 
                                        <td className="px-4 py-5">{sub.subscriptionDays} days</td> 
                                        <td className="px-4 py-5"> 
                                            <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full tracking-wide ${statusClass}`}> 
                                                {sub.status || 'UNKNOWN'} 
                                            </span> 
                                        </td> 
                                        <td className="px-4 py-5">{formatDate(sub.currentPeriodStart)}</td> 
                                        <td className="px-4 py-5">{formatDate(sub.currentPeriodEnd)}</td> 
                                        <td className="px-4 py-5">{formatDate(sub.createdAt)}</td> 
                                        
                                        {/* Actions */} 
                                        <td className="px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}> 
                                            <div className="flex items-center justify-center gap-x-2"> 
                                                {/* View Button */} 
                                                <button 
                                                    onClick={() => handleViewDetails(sub.id)} 
                                                    className="border border-[#86644c] rounded-md p-2 text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors outline-none" 
                                                    title="View Details" 
                                                > 
                                                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> 
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> 
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> 
                                                    </svg> 
                                                </button> 
                                                
                                                {/* Delete Button (Only if Active) */} 
                                                {isActive && ( 
                                                    <button 
                                                        onClick={() => onDelete(sub)} 
                                                        className="border border-red-400 rounded-md p-2 text-red-400 hover:bg-red-400 hover:text-white transition-colors outline-none" 
                                                        title="Delete" 
                                                    > 
                                                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> 
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> 
                                                        </svg> 
                                                    </button> 
                                                )} 
                                            </div> 
                                        </td> 
                                    </tr> 
                                ); 
                            }) 
                        ) : ( 
                            <tr> 
                                <td colSpan="14" className="text-center py-12 text-gray-500 italic">No subscriptions found.</td> 
                            </tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* --- Shared Pagination Component --- */} 
            <TablePagination pagination={pagination} setPagination={setPagination} variant='simple' />

        </div> 
    ); 
};