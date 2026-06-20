import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../utils/csvHelper';
import useStore from '../../Hooks/useStore';
import { SortableHeader } from '../Shared/Table/SortableHeader';
import { TablePagination } from '../Shared/Table/TablePagination';

export const PartnerOrderLayout = ({ apiEndpoint, detailsBaseRoute }) => {
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
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
                // FIX: This turns off the brown screen once the response arrives
                setIsGlobalLoading(false);
            }
        };
        fetchOrders();
    }, [pagination.page, pagination.limit, apiEndpoint, setIsGlobalLoading]); // Add to dependency array

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default';
        setSortConfig({ key: direction === 'default' ? null : key, direction });
    };

    const filteredOrders = orders.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            String(item.id).includes(q) ||
            (item.invoiceNumber || '').toLowerCase().includes(q) ||
            (item.poNumber || '').toLowerCase().includes(q) ||
            (item.note || '').toLowerCase().includes(q) ||
            (item.salesRepName || '').toLowerCase().includes(q)
        );
    });

    const displayData = [...filteredOrders];
    if (sortConfig.key && sortConfig.direction !== 'default') {
        displayData.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (sortConfig.key === 'totalBill') {
                valA = parseFloat(valA || 0);
                valB = parseFloat(valB || 0);
            }
            if (sortConfig.key === 'createdAt') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const handleDownloadCSV = () => {
        if (!displayData.length) return alert("No data to download!");
        const csvFormatted = displayData.map(order => ({
            "Order ID": order.id,
            "Partner Name": order.salesRepName || "—",
            "Order Date": formatDate(order.createdAt),
            "Deliver On": formatDate(order.deliveredOn),
            "Total": `$${order.totalBill}`,
            "Invoice": order.paymentStatus === 'done' || order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
            "Status": order.orderCurrentStatus
        }));
        exportToCSV(csvFormatted, `Orders_Page_${pagination.page}.csv`);
    };


    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans flex flex-col gap-6">
            <div className="w-[300px] bg-[#f9fafb] border-[0.66px] border-[#e2e8f0] rounded-[8px] p-6 shadow-sm">
                <h3 className="text-[16px] font-semibold text-black mb-4">Total Orders</h3>
                <p className="text-[20px] font-medium text-black">{pagination.total}</p>
            </div>

            <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-6 flex flex-col relative">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden">
                        <div className="pl-3 pr-2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                        </div>
                        <input
                            type="search"
                            placeholder="Search by Id, invoice number, po number, note"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3"
                        />
                    </div>
                    <button onClick={handleDownloadCSV} className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[15px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg>
                        Download CSV
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-max border-none">
                        <thead className="bg-[#f9fafb]">
                            <tr>
                                <SortableHeader label="#" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[100px]" />
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[180px] border-none first:rounded-l-lg last:rounded-r-lg">Partner Name</th>
                                <SortableHeader label="Order Date" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} width="w-[140px]" />
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[140px] border-none first:rounded-l-lg last:rounded-r-lg">Deliver On</th>
                                <SortableHeader label="Total" sortKey="totalBill" currentSort={sortConfig} onSort={handleSort} width="w-[120px]" />
                                <SortableHeader label="Invoice" sortKey="paymentStatus" currentSort={sortConfig} onSort={handleSort} width="w-[120px]" />
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[140px] border-none first:rounded-l-lg last:rounded-r-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="border-none">
                            {isLoading ? (
                                <tr><td colSpan="7" className="text-center py-12 text-gray-500 italic border-none">Loading orders...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map((order) => {
                                    const isPaid = order.paymentStatus?.toLowerCase() === 'done' || order.paymentStatus?.toLowerCase() === 'paid';
                                    const isSelected = selectedRowId === order.id;
                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => {
                                                setSelectedRowId(order.id);
                                                navigate(`${detailsBaseRoute}/${order.id}`, { state: { orderData: order } });
                                            }}
                                            className={`transition-colors h-[64px] text-[#4b5563] text-[15px] cursor-pointer duration-200 ${isSelected ? 'bg-table-selected' : 'bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-8 py-5 border-none">{order.id}</td>
                                            <td className="px-8 py-5 border-none">{order.salesRepName || "—"}</td>
                                            <td className="px-8 py-5 border-none">{formatDate(order.createdAt)}</td>
                                            <td className="px-8 py-5 border-none">{formatDate(order.deliveredOn)}</td>
                                            <td className="px-8 py-5 border-none">${parseFloat(order.totalBill || 0).toFixed(2)}</td>
                                            <td className="px-8 py-5 border-none capitalize">{isPaid ? 'Paid' : 'Unpaid'}</td>
                                            <td className="px-8 py-5 border-none capitalize">{order.orderCurrentStatus}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="7" className="text-center py-12 text-gray-500 italic border-none">No orders found.</td></tr>
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