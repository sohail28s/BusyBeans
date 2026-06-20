import React, { useState, useEffect } from 'react';
import { Table, Box } from "@chakra-ui/react"; // Using Chakra UI

const ProductCategoryTable = ({ data, grandTotalAmount }) => {
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        if (data && data.length === 1) {
            setExpandedCategories({ [data[0].categoryId]: true });
        } else {
            setExpandedCategories({});
        }
    }, [data]);

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const formatCurrency = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatPercent = (val) => `${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

    return (
        <Box className="w-full overflow-hidden border border-gray-200 rounded-lg">
            {/* Box wrapper handles horizontal scrolling for small screens */}
            <Box className="w-full overflow-x-auto custom-scrollbar">
                
                {/* ADDED: table-fixed and min-w-[1200px] to enforce strict column widths and force scrolling on smaller screens */}
                <Table.Root className="w-full min-w-[1200px] table-fixed text-sm text-left text-gray-700 font-sans">
                    
                    {/* Explicitly forced bg-white and text-gray-900 */}
                    <Table.Header className="bg-white border-b-2 border-gray-300 text-gray-900 text-[16px]">
                        <Table.Row className="bg-white">
                            <Table.ColumnHeader className="w-[15%] px-2 py-4 font-semibold text-gray-900 bg-white whitespace-normal break-words">Product/Category Name</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">QUANTITY</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">AMOUNT</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">% OF SALES</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">AVG PRICE</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">COGS</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">GROSS MARGIN</Table.ColumnHeader>
                            <Table.ColumnHeader className="w-[10%] px-2 py-4 font-semibold text-gray-900 bg-white text-left whitespace-normal break-words">GROSS MARGIN %</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {data.map((category) => {
                            const isExpanded = expandedCategories[category.categoryId];
                            return (
                                <React.Fragment key={category.categoryId}>
                                    {/* Category Header Row */}
                                    <Table.Row className="border-b border-gray-200 bg-gray-50">
                                        <Table.Cell colSpan={8} className="px-1 py-3">
                                            <div
                                                className="flex items-center gap-2 font-semibold text-[16px] text-gray-900 cursor-pointer w-max"
                                                onClick={() => toggleCategory(category.categoryId)}
                                            >
                                           
                                                <svg
                                                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>{category.categoryName}</span>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>

                                    {/* Individual Items (Visible only when expanded) */}
                                    {isExpanded && category.items.map(item => (
                                        <Table.Row key={item.id} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                                          
                                            <Table.Cell className="p-4 pl-10 text-gray-600 whitespace-normal break-words">{item.productName}</Table.Cell>
                                            <Table.Cell className="px-2 py-4 text-left text-gray-600 whitespace-normal break-words">{formatNumber(item.quantity)}</Table.Cell>
                                            <Table.Cell className="px-2 py-4 text-left text-gray-600 whitespace-normal break-words">{formatCurrency(item.amount)}</Table.Cell>
                                            <Table.Cell className="px-2 py-4 text-left text-gray-600 whitespace-normal break-words">{formatPercent((item.amount / grandTotalAmount) * 100)}</Table.Cell>
                                            <Table.Cell className="p-4 text-left text-gray-600 whitespace-normal break-words">{formatCurrency(item.amount / (item.quantity || 1))}</Table.Cell>
                                            <Table.Cell className="px-2 py-4 text-left text-gray-600 whitespace-normal break-words">{formatCurrency(item.costOfGoodsSold)}</Table.Cell>
                                            <Table.Cell className="px-2 py-4 text-left text-gray-600 whitespace-normal break-words">{formatCurrency(item.amount - item.costOfGoodsSold)}</Table.Cell>
                                            <Table.Cell className="px-2 py-4 text-left text-gray-600 whitespace-normal break-words">{formatPercent(((item.amount - item.costOfGoodsSold) / (item.amount || 1)) * 100)}</Table.Cell>
                                        </Table.Row>
                                    ))}

                                    {/* Category Totals Row (Always visible) */}
                                    <Table.Row className="border-b-2 border-gray-300 bg-gray-100 font-semibold text-gray-900">
                                        <Table.Cell className="p-4 whitespace-normal break-words">Total {category.categoryName}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatNumber(category.totals.quantity)}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatCurrency(category.totals.amount)}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatPercent(category.totals.percentOfSales)}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatCurrency(category.totals.avgPrice)}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatCurrency(category.totals.cogs)}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatCurrency(category.totals.grossMargin)}</Table.Cell>
                                        <Table.Cell className="p-4 text-left whitespace-normal break-words">{formatPercent(category.totals.grossMarginPercent)}</Table.Cell>
                                    </Table.Row>

                                </React.Fragment>
                            );
                        })}
                    </Table.Body>

                    {/* Grand Totals Footer */}
                    {data.length > 0 && (
                        /* Explicitly forced bg-white and text-gray-900 */
                        <Table.Footer className="bg-white border-t-2 border-gray-300 font-bold text-gray-900 text-[16px]">
                            <Table.Row className="bg-white">
                                <Table.Cell className="p-4 text-gray-900 bg-white whitespace-normal break-words">TOTAL</Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">
                                    {formatNumber(data.reduce((sum, cat) => sum + cat.totals.quantity, 0))}
                                </Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">
                                    {formatCurrency(grandTotalAmount)}
                                </Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">100.00%</Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">
                                    {formatCurrency(grandTotalAmount / (data.reduce((sum, cat) => sum + cat.totals.quantity, 0) || 1))}
                                </Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">
                                    {formatCurrency(data.reduce((sum, cat) => sum + cat.totals.cogs, 0))}
                                </Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">
                                    {formatCurrency(data.reduce((sum, cat) => sum + cat.totals.grossMargin, 0))}
                                </Table.Cell>
                                <Table.Cell className="p-4 text-left text-gray-900 bg-white whitespace-normal break-words">
                                    {formatPercent((data.reduce((sum, cat) => sum + cat.totals.grossMargin, 0) / grandTotalAmount) * 100)}
                                </Table.Cell>
                            </Table.Row>
                        </Table.Footer>
                    )}
                </Table.Root>
            </Box>
        </Box>
    );
};

export default ProductCategoryTable;