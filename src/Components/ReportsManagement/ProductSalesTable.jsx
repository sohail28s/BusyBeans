import React, { useState, useMemo } from 'react';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';
import { formatMoney } from '../../utils/orderUtils';

export const ProductSalesTable = ({ data, isLoading, onDownloadCSV }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'default' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    // Pre-calculate the combined fields for filtering, sorting, and rendering
    const enhancedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            totalRevenue: parseFloat(item.revenueFromCustomers || 0) + parseFloat(item.revenueFromLocalPartners || 0),
            totalUnits: parseInt(item.unitsSoldToCustomer || 0) + parseInt(item.unitsSoldToPartners || 0),
        }));
    }, [data]);

    // --- Search Logic ---
    const filteredData = useMemo(() => {
        return enhancedData.filter(item => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (item.name || '').toLowerCase().includes(q);
        });
    }, [enhancedData, searchQuery]);

    // --- Sorting Logic ---
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key && sortConfig.direction !== 'default') {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'name') {
                    aVal = (aVal || '').toString().toLowerCase();
                    bVal = (bVal || '').toString().toLowerCase();
                } else {
                    // Numerical sorting for all other columns
                    aVal = parseFloat(aVal || 0);
                    bVal = parseFloat(bVal || 0);
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

    // --- Frontend Pagination Logic ---
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
                        placeholder="Search product..."
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

            {/* Table Area with X-Axis Scrolling */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap border-collapse min-w-[1400px]">
                    <thead className="bg-[#f9fafb]">
                        <tr className="border-b border-[#e2e8f0]">
                            <SortableHeader label="SL" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="min-w-[80px]" />
                            <SortableHeader label="Product Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} width="min-w-[300px]" />
                            <SortableHeader label="Revenue" sortKey="totalRevenue" currentSort={sortConfig} onSort={handleSort} width="min-w-[150px]" />
                            <SortableHeader label="Revenue From Customer Orders" sortKey="revenueFromCustomers" currentSort={sortConfig} onSort={handleSort} width="min-w-[250px]" />
                            <SortableHeader label="Units Sold" sortKey="totalUnits" currentSort={sortConfig} onSort={handleSort} width="min-w-[150px]" />
                            <SortableHeader label="Revenue From Local Partner Self Orders" sortKey="revenueFromLocalPartners" currentSort={sortConfig} onSort={handleSort} width="min-w-[300px]" />
                            <SortableHeader label="Admin Receivable From Local Partner" sortKey="wholesalePriceTotal" currentSort={sortConfig} onSort={handleSort} width="min-w-[300px]" />
                            <SortableHeader label="Units Sold To Customers" sortKey="unitsSoldToCustomer" currentSort={sortConfig} onSort={handleSort} width="min-w-[200px]" />
                            <SortableHeader label="Units Sold To Partners" sortKey="unitsSoldToPartners" currentSort={sortConfig} onSort={handleSort} width="min-w-[200px]" />
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="9" className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading data...</td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[15px] cursor-default"
                                >
                                    <td className="px-8 py-5 font-medium">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                    <td className="px-8 py-5 text-gray-900 truncate whitespace-normal leading-snug">{item.name || '-'}</td>
                                    <td className="px-8 py-5">{formatMoney(item.totalRevenue)}</td>
                                    <td className="px-8 py-5">{formatMoney(item.revenueFromCustomers)}</td>
                                    <td className="px-8 py-5">{item.totalUnits}</td>
                                    <td className="px-8 py-5">{formatMoney(item.revenueFromLocalPartners)}</td>
                                    <td className="px-8 py-5">{formatMoney(item.wholesalePriceTotal)}</td>
                                    <td className="px-8 py-5">{item.unitsSoldToCustomer || 0}</td>
                                    <td className="px-8 py-5">{item.unitsSoldToPartners || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="9" className="text-center py-12 text-[#4b5563] text-[15px] italic">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component (Simple Variant) */}
            <TablePagination
                pagination={adaptedPagination}
                setPagination={handleSetPagination}
                variant="simple"
            />
        </div>
    );
};