import React, { useState, useMemo, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../Hooks/useStore'; 
import { TablePagination } from '../../Components/Shared/Table/TablePagination'; 
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader'; 
import { formatDate, formatMoney } from '../../utils/orderUtils'; 

export const PaymentPulloutTable = ({ viewMode, data, isLoading, pagination, setPagination, onDownloadCSV }) => { 
    const navigate = useNavigate(); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 

    useEffect(() => { 
        setIsGlobalLoading(isLoading); 
    }, [isLoading, setIsGlobalLoading]); 

    const [searchQuery, setSearchQuery] = useState(''); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 

    const filteredData = useMemo(() => { 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.invoiceNumber || '').toLowerCase().includes(q) || 
                (item.companyName || '').toLowerCase().includes(q) || 
                (item.pulloutIntentId || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    const sortedData = useMemo(() => { 
        let sortableItems = [...filteredData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            sortableItems.sort((a, b) => { 
                let aVal = a[sortConfig.key]; 
                let bVal = b[sortConfig.key]; 
                
                if (sortConfig.key.includes('Date') || sortConfig.key === 'deliveredOn') { 
                    aVal = aVal ? new Date(aVal).getTime() : 0; 
                    bVal = bVal ? new Date(bVal).getTime() : 0; 
                } else if (['totalBill', 'localPatnerCommission', 'adminEarnings', 'overdueInvoice'].includes(sortConfig.key)) { 
                    aVal = parseFloat(aVal || 0); 
                    bVal = parseFloat(bVal || 0); 
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

    // Ensure we are passing exactly { page, limit, total } to TablePagination
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total // Using total here
    };

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans mt-8"> 
            {/* --- Controls Section --- */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
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
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">INV#</th> 
                            {viewMode === 'Pending Pullouts' && ( 
                                <SortableHeader label="Overdue Invoice" sortKey="overdueInvoice" currentSort={sortConfig} onSort={handleSort} /> 
                            )} 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] min-w-[200px]">Company</th> 
                            <SortableHeader label="Invoice Date" sortKey="invoiceDate" currentSort={sortConfig} onSort={handleSort} /> 
                            <SortableHeader label="Total" sortKey="totalBill" currentSort={sortConfig} onSort={handleSort} /> 
                            <SortableHeader label="Partner Profit" sortKey="localPatnerCommission" currentSort={sortConfig} onSort={handleSort} /> 
                            <SortableHeader label="Admin Receivable" sortKey="adminEarnings" currentSort={sortConfig} onSort={handleSort} /> 
                            {viewMode === 'Confirm Pullouts' && ( 
                                <> 
                                    <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Pullout Transfer Id</th> 
                                    <SortableHeader label="Pullout Date" sortKey="pulloutDate" currentSort={sortConfig} onSort={handleSort} /> 
                                </> 
                            )} 
                            <SortableHeader label="Invoice" sortKey="paymentStatus" currentSort={sortConfig} onSort={handleSort} /> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Status</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        {isLoading ? ( 
                            <tr> 
                                <td colSpan={viewMode === 'Pending Pullouts' ? 9 : 10} className="text-center py-12 text-gray-500 italic">Loading pullouts...</td> 
                            </tr> 
                        ) : sortedData.length > 0 ? ( 
                            sortedData.map((order) => ( 
                                <tr 
                                    key={order.id} 
                                    onClick={() => navigate(`/orders/details/${order.id}`)} 
                                    className="hover:bg-gray-50 transition-colors text-gray-600 text-[14px] cursor-pointer" 
                                > 
                                    <td className="px-4 py-5 font-medium text-gray-900">{order.invoiceNumber || '-'}</td> 
                                    {viewMode === 'Pending Pullouts' && ( 
                                        <td className={`px-4 py-5 text-center font-medium ${order.overdueInvoice > 0 ? 'text-red-500' : ''}`}> 
                                            {order.overdueInvoice > 0 ? 'Yes' : 'No'} 
                                        </td> 
                                    )} 
                                    <td className="px-4 py-5 truncate max-w-[200px]" title={order.companyName}>{order.companyName || '-'}</td> 
                                    <td className="px-4 py-5">{formatDate(order.invoiceDate)}</td> 
                                    <td className="px-4 py-5">${formatMoney(order.totalBill)}</td> 
                                    <td className="px-4 py-5">${formatMoney(order.localPatnerCommission)}</td> 
                                    <td className="px-4 py-5">${formatMoney(order.adminEarnings)}</td> 
                                    {viewMode === 'Confirm Pullouts' && ( 
                                        <> 
                                            <td className="px-4 py-5 truncate max-w-[150px]">{order.pulloutIntentId || '-'}</td> 
                                            <td className="px-4 py-5">{formatDate(order.pulloutDate)}</td> 
                                        </> 
                                    )} 
                                    <td className="px-4 py-5 capitalize">{order.paymentStatus === 'done' ? 'Paid' : order.paymentStatus === 'pending' ? 'Unpaid' : '-'}</td> 
                                    <td className="px-4 py-5">{order.orderCurrentStatus || '-'}</td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr> 
                                <td colSpan={viewMode === 'Pending Pullouts' ? 9 : 10} className="text-center py-12 text-gray-500 italic">No records found.</td> 
                            </tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* --- Shared Pagination Component --- */} 
            <TablePagination pagination={adaptedPagination} setPagination={setPagination} /> 
        </div> 
    ); 
};