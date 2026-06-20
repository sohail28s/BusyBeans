import React, { useState, useMemo, useEffect } from 'react';
import useStore from '../../Hooks/useStore';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
import { formatMoney } from '../../utils/orderUtils'; // Adjust path if needed

export const InventoryTable = ({
    data,
    isLoading,
    inventoryView, // 'admin' or 'partner'
    onDownloadCSV,
    onEditAdminProduct,
    onDeleteAdminProduct,
    onPartnerChangePrice,
    onStatusChange
}) => {
    // Global Loading State
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    useEffect(() => {
        setIsGlobalLoading(isLoading);
    }, [isLoading, setIsGlobalLoading]);

    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: data?.length || 0 });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

    // 1. Client-Side Search
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                (item.name || '').toLowerCase().includes(q) ||
                (item.productCode || '').toLowerCase().includes(q) ||
                (item.sku || '').toLowerCase().includes(q)
            );
        });
    }, [data, searchQuery]);

    // 2. Attach True SL & Update Pagination Total
    useEffect(() => {
        setPagination(p => ({ ...p, total: filteredData.length }));
    }, [filteredData.length]);

    const baseData = useMemo(() => {
        return filteredData.map((item, index) => ({
            ...item,
            calculatedSL: index + 1
        }));
    }, [filteredData]);

    // 3. Client-Side Sort Logic
    const sortedData = useMemo(() => {
        let displayData = [...baseData];
        if (sortConfig.key && sortConfig.direction !== 'default') {
            displayData.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'calculatedSL' || sortConfig.key === 'price') {
                    aVal = parseFloat(aVal || 0);
                    bVal = parseFloat(bVal || 0);
                }
                if (sortConfig.key === 'weight') {
                    aVal = parseFloat(String(aVal).replace(/[^\d.]/g, '') || 0);
                    bVal = parseFloat(String(bVal).replace(/[^\d.]/g, '') || 0);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return displayData;
    }, [baseData, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default';
        setSortConfig({ key, direction });
    };

    // 4. Slice for Pagination
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return sortedData.slice(start, start + pagination.limit);
    }, [sortedData, pagination.page, pagination.limit]);

    return (
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans mt-8">

            {/* --- Controls Section --- */}
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3">
                {/* Search */}
                <div className="relative">
                    <input
                        placeholder="Search by Name, Product Code, SKU..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPagination(p => ({ ...p, page: 1 }));
                        }}
                        className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg pl-10 pr-5 outline-none placeholder:font-sans placeholder:font-medium focus:bg-gray-200 transition-colors text-[15px] text-gray-700"
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
                            <SortableHeader label="SL" sortKey="calculatedSL" currentSort={sortConfig} onSort={handleSort} width="min-w-[4rem]" />
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Image</th>
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Name</th>
                            <SortableHeader label="Weight" sortKey="weight" currentSort={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Price ($)" sortKey="price" currentSort={sortConfig} onSort={handleSort} />
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Whole Sale Price ($)</th>
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Product Code</th>
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">SKU</th>
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Grind</th>
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Change Status</th>
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] text-center min-w-[8rem]">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="11" className="text-center py-12 text-gray-500 italic">Loading inventory...</td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors text-gray-600 text-[14px]">
                                    <td className="px-4 py-5 font-medium text-gray-900">{product.calculatedSL}</td>
                                    <td className="px-4 py-5">
                                        <div className="w-20 h-20 p-1 bg-gray-200 rounded flex justify-center items-center shrink-0">
                                            {product.image ? (
                                                <img
                                                    src={`https://testingbb.trimworldwide.com/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80"; }}
                                                />
                                            ) : (
                                                <div className="text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 font-medium text-gray-900  whitespace-normal break-words">
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-5">{product.weight} {product.unit}</td>
                                    <td className="px-4 py-5">${formatMoney(product.price)}</td>
                                    <td className="px-4 py-5">${formatMoney(product.wholesalePrice)}</td>
                                    <td className="px-4 py-5">{product.productCode}</td>
                                    <td className="px-4 py-5">{product.sku}</td>
                                    <td className="px-4 py-5">{product.grind || '-'}</td>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                {product.status ? (
                                                    <div className="w-max text-xs bg-[#86644c] text-white font-semibold p-2 rounded-md flex justify-center">Active</div>
                                                ) : (
                                                    <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">Inactive</div>
                                                )}
                                            </div>
                                            {inventoryView === 'admin' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onStatusChange(product)}
                                                    className="relative inline-flex items-center justify-start w-14 h-7  rounded-full transition-colors duration-300 ease-in-out outline-none"
                                                    style={{ backgroundColor: product.status ? '#86644c' : '#888888' }}
                                                >
                                                    <span className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${product.status ? 'translate-x-[30px]' : 'translate-x-[2px]'}`} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    {/* Action Column */}
                                    <td className="px-4 py-5 text-center">
                                        {inventoryView === 'admin' ? (
                                            <div className="flex items-center justify-center gap-x-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => onEditAdminProduct(product)}
                                                    className="border border-[#86644c] rounded-md p-2 text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors outline-none"
                                                    title="Edit Product"
                                                >
                                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
                                                    </svg>
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => onDeleteAdminProduct(product)}
                                                    className="border border-red-400 rounded-md p-2 text-red-400 hover:bg-red-400 hover:text-white transition-colors outline-none"
                                                    title="Delete Product"
                                                >
                                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onPartnerChangePrice(product)}
                                                className="text-[13px] font-medium text-blue-600 hover:underline whitespace-nowrap outline-none"
                                            >
                                                Change Prices
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center py-12 text-gray-500 italic">No products found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Shared Pagination Component --- */}
            <TablePagination pagination={pagination} setPagination={setPagination} />

        </div>
    );
};