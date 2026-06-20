import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TablePagination } from '../../Shared/Table/TablePagination';
import { CustomCheckbox } from '../../Shared/Table/CustomCheckbox';
import { formatDate } from '../../../utils/orderUtils';
import { exportToCSV } from '../../../utils/csvHelper';
import { toast } from 'react-toastify';
const InvoiceStatusBadge = ({ text }) => {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    const styles = lowerText === 'paid' ? 'bg-[#10b981] text-white' : 'bg-[#f59e0b] text-white';
    return (
        <span className={`${styles} px-3 py-1 rounded-full text-[11px] font-bold capitalize tracking-wide`}>
            {text}
        </span>
    );a
};

const OrderStatusBadge = ({ text }) => {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    let styles = 'bg-[#f3f4f6] text-[#1f2937]';
    if (lowerText === 'order placed' || lowerText === 'dispatched') {
        styles = 'bg-[#10b981] text-white';
    } else if (lowerText === 'acknowledged') {
        styles = 'bg-[#f59e0b] text-white';
    } else if (lowerText === 'dispatched to supplier') {
        styles = 'bg-[#14b8a6] text-white';
    }
    return (
        <span className={`${styles} px-3 py-1 rounded-full text-[11px] font-semibold capitalize`}>
            {text}
        </span>
    );
};




const CustomerOrdersSection = ({
    orders, searchQuery, setSearchQuery, selectedOrders,
    onSelectAll, onSelectOne, pagination, setPagination
}) => {
    const navigate = useNavigate();


     const handleDownloadCSV = () => {
        if (!orders || orders.length === 0) {
            return toast.info("No orders to download!");
        }

        // Format the data exactly how you want it to look in Excel
        const csvFormattedData = orders.map(order => {
            const rawId = String(order.invoiceNumber || order.id);
            const displayId = rawId.startsWith('INV') ? rawId.replace(/^INV0*/, '') : rawId;

            const orderDate = order.on || order.invoiceDate;
            const deliverDate = order.deliveredOn;
            const invoiceSendDate = order.invoicePaidDate || order.invoiceDate;
            const invoicePaidDate = order.invoicePaidDate;

            return {
                'Order ID': displayId || '—',
                'Order Date': orderDate ? formatDate(orderDate) : '—',
                'Deliver On': deliverDate ? formatDate(deliverDate) : '—',
                'Total ($)': parseFloat(order.totalBill || 0).toFixed(2),
                'Invoice Status': order.paymentStatus || '—',
                'Order Status': order.orderCurrentStatus || '—',
                'Overdue': order.overdueInvoice ? 'Yes' : 'No',
                'Invoice Send Date': invoiceSendDate ? formatDate(invoiceSendDate) : '—',
                'Invoice Paid Date': invoicePaidDate ? formatDate(invoicePaidDate) : '—'
            };
        });

        exportToCSV(csvFormattedData, `Customer_Orders.csv`);
    };
   

    return (
        <div className="bg-white w-full flex flex-col">

            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
            </div>

            {/* Controls Section (Search & Download) */}
            <div className="bg-white overflow-x-auto">
                <div className="[&_div.relative]:mb-4">
                    <div className="flex justify-between items-end md:items-center flex-wrap gap-3">

                        {/* Search Input */}
                        <div className="relative">
                            <input
                                placeholder="Search by order id and invoice number"
                                className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg pl-10 pr-5 outline-none placeholder:font-sans placeholder:font-medium focus:bg-gray-200 transition-colors"
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg
                                stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                                strokeLinecap="round" strokeLinejoin="round"
                                className="absolute top-3 md:top-3.5 left-3 text-gray-900"
                                height="20" width="20" xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                        </div>

                        {/* Download CSV Button */}

                        <button
                            type="button"
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group"
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                            </svg>
                            <span className="group-hover:text-black text-white font-sans font-medium">
                                Download CSV
                            </span>
                        </button>

                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full rounded-[8px] overflow-hidden border border-[#e2e8f0] bg-white mt-2">
                    <table className="w-full text-left table-fixed border-collapse">
                        <thead className="bg-[#f9fafb]">
                            <tr className="text-[#374151] text-[13px] font-bold border-b border-[#e2e8f0]">
                                <th className="px-4 py-4 w-[5%] text-center border-r border-[#e2e8f0]">
                                    <CustomCheckbox checked={orders.length > 0 && selectedOrders.length === orders.length} onChange={onSelectAll} />
                                </th>
                                <th className="px-4 py-4 w-[8%]">#</th>
                                <th className="px-4 py-4 w-[12%]">Order Date</th>
                                <th className="px-4 py-4 w-[12%]">Deliver On</th>
                                <th className="px-4 py-4 w-[10%]">Total</th>
                                <th className="px-4 py-4 w-[12%] text-center">Invoice</th>
                                <th className="px-4 py-4 w-[15%] text-center">Status</th>
                                <th className="px-4 py-4 w-[8%] text-center">Overdue</th>
                                <th className="px-4 py-4 w-[10%]">Invoice Send</th>
                                <th className="px-4 py-4 w-[8%]">Invoice Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => {
                                    const rawId = String(order.invoiceNumber || order.id);
                                    const displayId = rawId.startsWith('INV') ? rawId.replace(/^INV0*/, '') : rawId;

                                    // Formatting dates safely
                                    const orderDate = order.on || order.invoiceDate;
                                    const deliverDate = order.deliveredOn;
                                    const invoiceSendDate = order.invoicePaidDate || order.invoiceDate;
                                    const invoicePaidDate = order.invoicePaidDate;

                                    return (
                                        <tr key={order.id} onClick={() => navigate(`/orders/details/${order.id}`)} className={`hover:bg-gray-50 transition-colors text-[13px] cursor-pointer border-b border-[#e2e8f0] last:border-0 ${selectedOrders.includes(order.id) ? 'bg-gray-50' : 'bg-white'}`}>
                                            <td className="px-4 py-4 text-center border-r border-[#e2e8f0]" onClick={(e) => e.stopPropagation()}>
                                                <CustomCheckbox checked={selectedOrders.includes(order.id)} onChange={() => onSelectOne(order.id)} />
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-black">{displayId || ""}</td>
                                            <td className="px-4 py-4 text-gray-600">{orderDate ? formatDate(orderDate) : ""}</td>
                                            <td className="px-4 py-4 text-gray-600">{deliverDate ? formatDate(deliverDate) : ""}</td>
                                            <td className="px-4 py-4 font-semibold text-black">${parseFloat(order.totalBill || 0).toFixed(2)}</td>
                                            <td className="px-4 py-4 text-center"><InvoiceStatusBadge text={order.paymentStatus} /></td>
                                            <td className="px-4 py-4 text-center"><OrderStatusBadge text={order.orderCurrentStatus} /></td>
                                            <td className="px-4 py-4 text-center text-gray-600">{order.overdueInvoice ? "Yes" : ""}</td>
                                            <td className="px-4 py-4 text-gray-600 truncate">{invoiceSendDate ? formatDate(invoiceSendDate) : ""}</td>
                                            <td className="px-4 py-4 text-gray-600 truncate">{invoicePaidDate ? formatDate(invoicePaidDate) : ""}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan={10} className="text-center py-12 text-gray-500 italic">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <TablePagination pagination={pagination} setPagination={setPagination} />
            </div>
        </div>
    );
};

export default CustomerOrdersSection;