import React, { useState, useMemo } from 'react';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';
import { formatMoney } from '../../utils/orderUtils';

export const UnpaidPartnerBalanceTable = ({ data, isLoading, onDownloadCSV, partnerType }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'default' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    const isDirect = partnerType === 'direct-partner';

    // --- Data Enhancer ---
    const enhancedData = useMemo(() => {
        return data.map(item => {
            const outBal = parseFloat(item.outstandingBalance || 0);
            const selfOutBal = parseFloat(item.selfOrdersOutstandingBalance || 0);
            const ordCred = parseInt(item.ordersOnCredit || 0, 10);
            const selfOrdCred = parseInt(item.selfOrdersOnCredit || 0, 10);

            return {
                ...item,
                totalOutstanding: outBal + selfOutBal,
                totalOrdersOnCredit: ordCred + selfOrdCred,
                parsedOutBal: outBal,
                parsedSelfOutBal: selfOutBal,
                parsedOrdCred: ordCred,
                parsedSelfOrdCred: selfOrdCred
            };
        });
    }, [data]);

    // --- Search Logic ---
    const filteredData = useMemo(() => {
        return enhancedData.filter(item => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (item.srName || '').toLowerCase().includes(q);
        });
    }, [enhancedData, searchQuery]);

    // --- Sorting Logic ---
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key && sortConfig.direction !== 'default') {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                aVal = parseFloat(aVal || 0);
                bVal = parseFloat(bVal || 0);

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

    // --- Pagination Logic ---
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: sortedData.length
    };

    const handleSetPagination = (updater) => {
        const nextState = typeof updater === 'function' ? updater(adaptedPagination) : updater;
        setPagination({ page: nextState.page, limit: nextState.limit });
    };

    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return sortedData.slice(start, start + pagination.limit);
    }, [sortedData, pagination.page, pagination.limit]);

    return (
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans">
            
            {/* Toolbar */}
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3">
                <div className="relative">
                    <input
                        placeholder="Search local partner..."
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

            {/* Table Area: Increased min-w to ensure percentage widths have enough pixel space for SVG arrows */}
            <div className="w-full overflow-x-auto">
                <table className={`w-full text-left whitespace-nowrap border-collapse table-fixed ${isDirect ? 'min-w-[1800px]' : 'min-w-[1200px]'}`}>
                    <thead className="bg-[#f9fafb]">
                        <tr className="border-b border-[#e2e8f0]">
                            
                            {/* Adjusted Percentages to fit text and arrows perfectly */}
                            <SortableHeader label="SL" sortKey="id" currentSort={sortConfig} onSort={handleSort} width={isDirect ? "w-[10%]" : "w-[10%]"} />
                            
                            {!isDirect && (
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[18%]">Type</th>
                            )}
                            
                            <th className={`px-8 py-5 font-bold text-[#374151] text-[14px] ${isDirect ? "w-[11%]" : "w-[24%]"}`}>Local Partner</th>
                            
                            <SortableHeader 
                                label="Outstanding Balance" 
                                sortKey={isDirect ? "totalOutstanding" : "parsedOutBal"} 
                                currentSort={sortConfig} 
                                onSort={handleSort} 
                                width={isDirect ? "w-[13%]" : "w-[25%]"} 
                            />
                            
                            <SortableHeader 
                                label="Orders on credit" 
                                sortKey={isDirect ? "totalOrdersOnCredit" : "parsedOrdCred"} 
                                currentSort={sortConfig} 
                                onSort={handleSort} 
                                width={isDirect ? "w-[12%]" : "w-[25%]"} 
                            />

                            {/* Direct Mode Exclusive Columns */}
                            {isDirect && (
                                <>
                                    <SortableHeader label="Partner Orders" sortKey="parsedSelfOrdCred" currentSort={sortConfig} onSort={handleSort} width="w-[11%]" />
                                    <SortableHeader label="Customer Order" sortKey="parsedOrdCred" currentSort={sortConfig} onSort={handleSort} width="w-[12%]" />
                                    <SortableHeader label="Credit on Partner Orders" sortKey="parsedSelfOutBal" currentSort={sortConfig} onSort={handleSort} width="w-[18%]" />
                                    <SortableHeader label="Credit on Customer Orders" sortKey="parsedOutBal" currentSort={sortConfig} onSort={handleSort} width="w-[18%]" />
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={isDirect ? 9 : 5} className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading data...</td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[15px] cursor-default"
                                >
                                    <td className="px-8 py-5 font-medium">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                    
                                    {!isDirect && (
                                        <td className="px-8 py-5">{item.partnerType || '-'}</td>
                                    )}
                                    
                                    <td className="px-8 py-5 text-gray-900 truncate" title={item.srName}>{item.srName || '-'}</td>
                                    
                                    <td className="px-8 py-5">{formatMoney(isDirect ? item.totalOutstanding : item.parsedOutBal)}</td>
                                    <td className="px-8 py-5">{isDirect ? item.totalOrdersOnCredit : item.parsedOrdCred}</td>

                                    {isDirect && (
                                        <>
                                            <td className="px-8 py-5">{item.parsedSelfOrdCred}</td>
                                            <td className="px-8 py-5">{item.parsedOrdCred}</td>
                                            <td className="px-8 py-5">{formatMoney(item.parsedSelfOutBal)}</td>
                                            <td className="px-8 py-5">{formatMoney(item.parsedOutBal)}</td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={isDirect ? 9 : 5} className="text-center py-12 text-[#4b5563] text-[15px] italic">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <TablePagination
                pagination={adaptedPagination}
                setPagination={handleSetPagination}
                variant="simple"
            />
        </div>
    );
};