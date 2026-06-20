import React, { useState } from 'react';
import { Table, Box } from "@chakra-ui/react"; 

const ReportTable = ({ 
    columns = [], 
    data = [], 
    totalValueKey = "value", 
    onRowClick 
}) => {
    // 3-State Sort: 'none' -> 'desc' -> 'asc'
    const [sortDirection, setSortDirection] = useState('none');

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0.00';
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Sorting Logic
    const handleSortClick = () => {
        if (sortDirection === 'none') {
            setSortDirection('desc'); // Highest to Lowest
        } else if (sortDirection === 'desc') {
            setSortDirection('asc');  // Lowest to Highest
        } else {
            setSortDirection('none'); // Back to DB default
        }
    };

    // Apply sorting to the data (Parent already handled searching/filtering!)
    const sortedData = [...data].sort((a, b) => {
        if (sortDirection === 'none') return 0;
        
        const valA = parseFloat(a[totalValueKey]) || 0;
        const valB = parseFloat(b[totalValueKey]) || 0;
        
        if (sortDirection === 'desc') return valB - valA;
        if (sortDirection === 'asc') return valA - valB;
        return 0;
    });

    // Calculate Grand Total
    const grandTotal = data.reduce((sum, item) => {
        return sum + (parseFloat(item[totalValueKey]) || 0);
    }, 0);

    return (
        <Box className="w-full overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[8px] font-sans text-[16px]">
            <Box className="overflow-x-auto custom-scrollbar">
                
                {/* Replaced HTML table with Chakra UI */}
                <Table.Root size="md" variant="line" className="w-full text-left whitespace-nowrap min-w-[600px]">
                    
                    {/* TABLE HEADER */}
                    <Table.Header>
                        <Table.Row className="border-b-2 border-gray-300 h-[57px]">
                            {columns.map((col, index) => (
                                <Table.ColumnHeader 
                                    key={index} 
                                    className="px-4 py-3 font-semibold text-gray-900 text-base align-middle bg-white"
                                >
                                    {col.isNumeric ? (
                                        // SORTABLE HEADER FOR NUMBERS
                                        <button 
                                            onClick={handleSortClick}
                                            className="flex items-center justify-end w-full gap-2 bg-transparent border-none cursor-pointer group focus:outline-none"
                                        >
                                            <span className="text-gray-900 group-hover:text-[#86644C] transition-colors duration-150">
                                                {col.header}
                                            </span>
                                            
                                            {/* ADDED flex-shrink-0 so the SVGs NEVER get squished! */}
                                            <span className="flex-shrink-0 text-gray-900 group-hover:text-[#86644C] transition-colors duration-150 flex items-center justify-center">
                                                
                                                {/* SVG 1: DEFAULT (Double Arrows) */}
                                                {sortDirection === 'none' && (
                                                    <div className="flex flex-col flex-nowrap items-center justify-center w-[10px] h-[16px]">
                                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" className="-mb-[4px]" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                                        </svg>
                                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                                
                                                {/* SVG 2: DESCENDING (Highest to Lowest - Down Arrow) */}
                                                {sortDirection === 'desc' && (
                                                    <div className="flex items-center justify-center w-[13px] h-[18px]">
                                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* SVG 3: ASCENDING (Lowest to Highest - Up Arrow) */}
                                                {sortDirection === 'asc' && (
                                                    <div className="flex items-center justify-center w-[13px] h-[18px]">
                                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </span>
                                        </button>
                                    ) : (
                                        // STANDARD HEADER FOR TEXT
                                        <span>{col.header}</span>
                                    )}
                                </Table.ColumnHeader>
                            ))}
                        </Table.Row>
                    </Table.Header>

                    {/* TABLE BODY */}
                    <Table.Body>
                        {sortedData.length > 0 ? (
                            sortedData.map((row, rowIndex) => (
                                <Table.Row 
                                    key={rowIndex} 
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className="border-b border-gray-200 h-[49px] bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    {columns.map((col, colIndex) => (
                                        <Table.Cell 
                                            key={colIndex} 
                                            className={`px-4 py-3 text-black text-base align-middle ${col.isNumeric ? 'text-right' : 'text-left'}`}
                                        >
                                            {col.isNumeric ? formatCurrency(row[col.accessor]) : row[col.accessor]}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={columns.length} className="py-8 text-center text-gray-500 bg-white">
                                    No data available.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>

                    {/* TABLE FOOTER */}
                    <Table.Footer>
                        <Table.Row className="bg-[#f9fafb] border-t-2 border-gray-300 h-[57px]">
                            <Table.Cell className="px-4 py-3 font-bold text-gray-900 align-middle bg-white">
                                TOTAL
                            </Table.Cell>
                            {columns.slice(1).map((col, idx) => (
                                <Table.Cell key={idx} className={`px-4 py-3 font-bold text-black text-base align-middle bg-white ${col.isNumeric ? 'text-right' : 'text-left'}`}>
                                    {col.accessor === totalValueKey ? formatCurrency(grandTotal) : ''}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    </Table.Footer>

                </Table.Root>
            </Box>
        </Box>
    );
};

export default ReportTable;