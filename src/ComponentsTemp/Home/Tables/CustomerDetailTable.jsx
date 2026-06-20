import React, { useState } from 'react';
import { Table, Box } from "@chakra-ui/react"; 

const CustomerDetailTable = ({ data = [] }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0.00';
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalQuantity = data.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // Sorting Logic
    const handleSort = (key) => {
        let direction = 'desc'; // Default to Highest first / Z-A
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'none') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = 'asc';
            else direction = 'none';
        }
        setSortConfig({ key, direction });
    };

    // Apply Sorting to Data
    const sortedData = [...data].sort((a, b) => {
        if (sortConfig.direction === 'none' || !sortConfig.key) return 0;

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Format values for correct comparison
        if (sortConfig.key === 'transactionDate') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (sortConfig.key === 'quantity' || sortConfig.key === 'amount') {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
        } else {
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Helper component to render the sorting SVGs
    const SortIcon = ({ columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        const direction = isActive ? sortConfig.direction : 'none';

        if (direction === 'none') {
            return (
                // ADDED: flex-shrink-0
                <div className="flex flex-col flex-nowrap items-center justify-center  flex-shrink-0 text-gray-900 group-hover:text-[#86644C] transition-colors duration-150">
                    <div>
                        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" class="-mb-1" height="10" width="10" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="10" width="10" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                </div>
            );
        }
        if (direction === 'desc') {
            return (
                // ADDED: flex-shrink-0
                <div className="flex items-center justify-center  flex-shrink-0 text-[#86644C]">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            );
        }
        return (
            // ADDED: flex-shrink-0
            <div className="flex items-center justify-center  flex-shrink-0 text-[#86644C]">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </div>
        );
    };

    // Helper component for Sortable Header Cells with strict widths & word wrapping
    const SortableHeader = ({ label, accessor, widthClass, align = 'center' }) => (
        <Table.ColumnHeader
            className={`${widthClass} px-4 py-4 font-semibold text-gray-900 align-middle bg-white border-b-2 border-gray-300 whitespace-normal break-words ${align === 'right' ? 'text-right' : 'text-center'}`}
        >
            <button
                onClick={() => handleSort(accessor)}
                // ADDED: justify-between so the text and icon use the space nicely
                className={`flex items-center justify-center gap-2 bg-transparent border-none cursor-pointer group focus:outline-none w-full`}
            >
                <span className={`text-[16px] ${align === 'right' ? 'text-right' : 'text-center'} transition-colors duration-150 ${sortConfig.key === accessor && sortConfig.direction !== 'none' ? 'text-[#86644C]' : 'text-gray-900 group-hover:text-[#86644C]'}`}>
                    {label}
                </span>
                <SortIcon columnKey={accessor} />
            </button>
        </Table.ColumnHeader>
    );

    return (
        <div className="w-full overflow-hidden bg-white border border-gray-200 rounded-[8px] shadow-sm font-sans text-[16px]">
            <Box className="w-full overflow-x-auto custom-scrollbar px-6">
                <Table.Root size="md" variant="line" className="w-full min-w-[1000px] table-fixed">

                    <Table.Header>
                        <Table.Row className="h-[81px]">
                            <SortableHeader label="Transaction date" accessor="transactionDate" widthClass="w-[15%]" />
                            <SortableHeader label="Transaction type" accessor="transactionType" widthClass="w-[12%]" />
                            <SortableHeader label="Num" accessor="num" widthClass="w-[15%]" />
                            <SortableHeader label="Product/Service full name" accessor="productName" widthClass="w-[18%]" />

                            <Table.ColumnHeader className="w-[15%] px-2 py-4 font-semibold text-left align-middle bg-white text-gray-900 border-b-2 border-gray-300 whitespace-normal break-words text-base">
                                Memo/Category
                            </Table.ColumnHeader>

                            <SortableHeader label="Quantity" accessor="quantity" widthClass="w-[12%]" align="right" />

                            <Table.ColumnHeader className="w-[14%] px-4 py-4 font-semibold text-right text-gray-900 align-middle bg-white border-b-2 border-gray-300 whitespace-normal break-words text-base">
                                Amount
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    {/* TABLE BODY */}
                    <Table.Body>
                        {sortedData.length > 0 ? (
                            sortedData.map((row, rowIndex) => (
                                <Table.Row
                                    key={rowIndex}
                                    onClick={() => console.log("Row clicked! ID:", row.id)}
                                    // Min-height added so shorter rows look consistent, but they will expand if text wraps
                                    className="border-b border-gray-200 min-h-[72px] bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Table.Cell className="px-4 py-4 text-black align-middle whitespace-normal break-words text-base font-sans">{row.transactionDate}</Table.Cell>
                                    <Table.Cell className="px-4 py-4 text-black align-middle whitespace-normal break-words text-base">{row.transactionType}</Table.Cell>
                                    <Table.Cell className="px-4 py-4 text-black font-normal align-middle cursor-pointer  whitespace-normal break-words text-base">{row.num}</Table.Cell>
                                    <Table.Cell className="px-4 py-4 text-black font-normal align-middle whitespace-normal break-words text-base">{row.productName}</Table.Cell>
                                    <Table.Cell className="px-4 py-4 text-gray-700 align-middle whitespace-normal break-words text-base">{row.category}</Table.Cell>
                                    <Table.Cell className="px-4 py-4 text-black align-middle text-right whitespace-normal break-words text-base">{parseFloat(row.quantity || 0).toFixed(2)}</Table.Cell>
                                    <Table.Cell className="px-4 py-4 text-black font-medium align-middle text-right whitespace-normal break-words text-base">{formatCurrency(row.amount)}</Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={7} className="py-8 text-center text-gray-500">
                                    No detailed transactions found.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>

                    {/* TABLE FOOTER */}
                    <Table.Footer>
                        <Table.Row className="bg-[#f9fafb] border-t-2 border-gray-300 min-h-[57px]">
                            <Table.Cell colSpan={5} className="px-4 py-4 font-bold text-gray-900 text-base align-middle text-left whitespace-normal ">
                                TOTAL
                            </Table.Cell>
                            <Table.Cell className="px-4 py-4 font-bold text-base text-gray-900 align-middle text-right whitespace-normal">
                                {totalQuantity.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell className="px-4 py-4 font-bold text-base text-gray-900 align-middle text-right whitespace-normal">
                                {formatCurrency(totalAmount)}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Footer>

                </Table.Root>
            </Box>
        </div>
    );
};

export default CustomerDetailTable;