import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../utils/csvHelper';
import useStore from '../../Hooks/useStore';
import { SortableHeader } from '../Shared/Table/SortableHeader';
import {TablePagination} from '../../Components/Shared/Table/TablePagination'

const defaultCustomerColumns = [
    { label: '#', key: 'id', width: 'w-[100px]' },
    { label: 'Company Name', key: 'companyName', width: 'w-[180px]', sortable: false },
    { label: 'Order Date', key: 'createdAt', width: 'w-[140px]', format: 'date' },
    { label: 'Deliver On', key: 'deliveredOn', width: 'w-[140px]', format: 'date', sortable: false },
    { label: 'Total', key: 'totalBill', width: 'w-[120px]', format: 'currency' },
    { label: 'Invoice', key: 'paymentStatus', width: 'w-[120px]', format: 'status' },
    { label: 'Status', key: 'orderCurrentStatus', width: 'w-[140px]', format: 'status', sortable: false }
];

export const StandardCustomerLayout = ({ apiEndpoint, detailsBaseRoute, columns = defaultCustomerColumns, customFilterUI, clientFilters = {}, pageHeaderContent }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const url = `${apiEndpoint}&page=${pagination.page}&limit=${pagination.limit}`;
                const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
                if (res.data.status === 'success') {
                    setOrders(res.data.data?.data || []);
                    const exactTotal = res.data.pagination?.totalItems || 0;
                    setPagination(p => ({ ...p, total: exactTotal }));
                }
            } catch (error) {
                console.error("Failed to fetch customer orders:", error);
            } finally {
                setIsLoading(false);
                setIsGlobalLoading(false);
            }
        };
        fetchOrders();
    }, [pagination.page, pagination.limit, apiEndpoint, setIsGlobalLoading]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default';
        setSortConfig({ key: direction === 'default' ? null : key, direction });
    };

    const filteredOrders = orders.filter(item => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch = columns.some(col => String(item[col.key] || '').toLowerCase().includes(q));
            if (!matchesSearch) return false;
        }
        if (clientFilters.paymentStatus && clientFilters.paymentStatus !== 'all') {
            const status = String(item.paymentStatus || '').toLowerCase();
            const isPaid = status === 'done' || status === 'paid';
            if (clientFilters.paymentStatus === 'paid' && !isPaid) return false;
            if (clientFilters.paymentStatus === 'unpaid' && isPaid) return false;
        }
        return true;
    });

    const displayData = [...filteredOrders];
    if (sortConfig.key && sortConfig.direction !== 'default') {
        displayData.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            const columnConfig = columns.find(c => c.key === sortConfig.key);
            if (columnConfig?.format === 'currency') {
                valA = parseFloat(valA || 0);
                valB = parseFloat(valB || 0);
            } else if (columnConfig?.format === 'date') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const formatCellData = (value, format, rowData = {}) => {
        if (value === null || value === undefined) return "—";
        switch (format) {
            case 'currency': return `$${parseFloat(value).toFixed(2)}`;
            case 'date': return new Date(value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            case 'invoice': return (String(value).toLowerCase() === 'done' || String(value).toLowerCase() === 'paid') ? 'Paid' : 'Unpaid';
            case 'status': return <span className="capitalize">{String(value).replace(/-/g, ' ')}</span>;
            default: return value;
        }
    };

    const handleDownloadCSV = () => {
        if (!displayData.length) return alert("No data to download!");
        const csvFormatted = displayData.map(order => {
            let row = {};
            columns.forEach(col => {
                let val = order[col.key];
                if (col.format === 'currency') val = val ? `$${parseFloat(val).toFixed(2)}` : "—";
                else if (col.format === 'date') val = val ? new Date(val).toLocaleDateString() : "—";
                else if (col.format === 'invoice') val = (val?.toLowerCase() === 'done' || val?.toLowerCase() === 'paid') ? 'Paid' : 'Unpaid';
                else if (col.format === 'status') val = val ? String(val).replace(/-/g, ' ') : "—";
                row[col.label] = val || "—";
            });
            return row;
        });
        exportToCSV(csvFormatted, `Customer_Orders_Page_${pagination.page}.csv`);
    };
    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans flex flex-col gap-6">
            {pageHeaderContent}
            <div className="w-[300px] bg-[#f9fafb] border-[0.66px] border-[#e2e8f0] rounded-[8px] p-6 shadow-sm">
                <h3 className="text-[16px] font-semibold text-black mb-4">Total Orders</h3>
                <p className="text-[20px] font-medium text-black">{pagination.total}</p>
            </div>

            <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-6 flex flex-col relative">
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4 flex-grow">
                        <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden">
                            <div className="pl-3 pr-2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                            </div>
                            <input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3" />
                        </div>
                        {customFilterUI}
                    </div>
                    <button onClick={handleDownloadCSV} className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[15px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
                        Download CSV
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-max border-none">
                        <thead className="bg-[#f9fafb]">
                            <tr>
                                {columns.map((col, index) => (
                                    <SortableHeader
                                        key={index}
                                        label={col.label}
                                        sortKey={col.key}
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                        width={col.width || 'w-auto'}
                                        sortable={col.sortable !== false}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="border-none">
                            {isLoading ? (
                                <tr><td colSpan={columns.length} className="text-center py-12 text-gray-500 italic border-none">Loading orders...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map((order) => {
                                    const isSelected = selectedRowId === order.id;
                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => {
                                                setSelectedRowId(order.id);
                                                navigate(`${detailsBaseRoute}/${order.id}`, { state: { orderData: order } });
                                            }}
                                            className={`transition-colors h-[64px] text-[#4b5563] text-[15px] cursor-pointer duration-200 ${isSelected ? 'bg-table-selected' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            {columns.map((col, index) => (
                                                <td key={index} className={`px-8 py-5 border-none ${col.format === 'status' ? 'capitalize' : ''}`}>
                                                    {formatCellData(order[col.key], col.format, order)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan={columns.length} className="text-center py-12 text-gray-500 italic border-none">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <TablePagination
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
};