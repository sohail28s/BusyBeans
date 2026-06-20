import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { PageStatsHeader } from '../../Components/Shared/PageStatsHeader'; 

const SortableHeader = ({ label, sortKey, currentSort, onSort, width = "w-auto" }) => { 
    const isActive = currentSort.key === sortKey && currentSort.direction !== 'default'; 
    const direction = currentSort.key === sortKey ? currentSort.direction : 'default'; 
    
    return ( 
        <th 
            onClick={() => onSort(sortKey)} 
            className={`px-6 py-4 font-bold text-[14px] ${width} cursor-pointer select-none transition-colors ${ isActive ? 'bg-blue-50 text-blue-600' : 'text-[#374151] hover:bg-gray-50' }`} 
        > 
            <div className="flex items-center gap-2"> 
                {label} 
                {direction === 'default' && ( 
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400"> 
                        <path d="M5.64515 3.61291C5.47353 3.61291 5.30192 3.54968 5.16644 3.4142L3.38708 1.63484L1.60773 3.4142C1.34579 3.67613 0.912244 3.67613 0.650309 3.4142C0.388374 3.15226 0.388374 2.71871 0.650309 2.45678L2.90837 0.198712C3.17031 -0.0632236 3.60386 -0.0632236 3.86579 0.198712L6.12386 2.45678C6.38579 2.71871 6.38579 3.15226 6.12386 3.4142C5.98837 3.54968 5.81676 3.61291 5.64515 3.61291Z" fill="currentColor"/> 
                        <path d="M3.38714 14C3.01681 14 2.70972 13.6929 2.70972 13.3226V0.677419C2.70972 0.307097 3.01681 0 3.38714 0C3.75746 0 4.06456 0.307097 4.06456 0.677419V13.3226C4.06456 13.6929 3.75746 14 3.38714 14Z" fill="currentColor"/> 
                        <path d="M10.6129 14C10.4413 14 10.2697 13.9368 10.1342 13.8013L7.87611 11.5432C7.61418 11.2813 7.61418 10.8477 7.87611 10.5858C8.13805 10.3239 8.5716 10.3239 8.83353 10.5858L10.6129 12.3652L12.3922 10.5858C12.6542 10.3239 13.0877 10.3239 13.3497 10.5858C13.6116 10.8477 13.6116 11.2813 13.3497 11.5432L11.0916 13.8013C10.9561 13.9368 10.7845 14 10.6129 14Z" fill="currentColor"/> 
                        <path d="M10.6129 14C10.2426 14 9.93552 13.6929 9.93552 13.3226V0.677419C9.93552 0.307097 10.2426 0 10.6129 0C10.9833 0 11.2904 0.307097 11.2904 0.677419V13.3226C11.2904 13.6929 10.9832 14 10.6129 14Z" fill="currentColor"/> 
                    </svg> 
                )} 
                {direction === 'asc' && ( 
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-blue-600">
                        <path d="M3.63435 0.19871C3.57113 0.135484 3.49887 0.0903226 3.41758 0.0541935C3.255 -0.0180645 3.06532 -0.0180645 2.90274 0.0541935C2.82145 0.0903226 2.74919 0.135484 2.68597 0.19871L0.427901 2.45677C0.165965 2.71871 0.165965 3.15226 0.427901 3.41419C0.689836 3.67613 1.12338 3.67613 1.38532 3.41419L2.48726 2.31226V13.3226C2.48726 13.6929 2.79435 14 3.16467 14C3.535 14 3.84209 13.6929 3.84209 13.3226V2.31226L4.94403 3.41419C5.07951 3.54968 5.25113 3.6129 5.42274 3.6129C5.59435 3.6129 5.76597 3.54968 5.90145 3.41419C6.16338 3.15226 6.16338 2.71871 5.90145 2.45677L3.64338 0.19871H3.63435ZM13.7685 13.3226C13.7685 12.9523 13.4615 12.6452 13.0911 12.6452H7.22016C6.84984 12.6452 6.54274 12.9523 6.54274 13.3226C6.54274 13.6929 6.84984 14 7.22016 14H13.0911C13.4615 14 13.7685 13.6929 13.7685 13.3226ZM7.22016 8.58064C6.84984 8.58064 6.54274 8.27355 6.54274 7.90323C6.54274 7.5329 6.84984 7.22581 7.22016 7.22581H9.47823C9.84855 7.22581 10.1556 7.5329 10.1556 7.90323C10.1556 8.27355 9.84855 8.58064 9.47823 8.58064H7.22016ZM7.22016 5.87097H7.67177C8.0421 5.87097 8.34919 5.56387 8.34919 5.19355C8.34919 4.82323 8.0421 4.51613 7.67177 4.51613H7.22016C6.84984 4.51613 6.54274 4.82323 6.54274 5.19355C6.54274 5.56387 6.84984 5.87097 7.22016 5.87097ZM11.2847 11.2903H7.22016C6.84984 11.2903 6.54274 10.9832 6.54274 10.6129C6.54274 10.2426 6.84984 9.93548 7.22016 9.93548H11.2847C11.655 9.93548 11.9621 10.2426 11.9621 10.6129C11.9621 10.9832 11.655 11.2903 11.2847 11.2903Z" fill="currentColor"></path>
                    </svg> 
                )} 
                {direction === 'desc' && ( 
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-blue-600">
                        <path d="M4.93953 10.5858L3.83759 11.6877V0.677419C3.83759 0.307097 3.53049 0 3.16017 0C2.78985 0 2.48275 0.307097 2.48275 0.677419V11.6877L1.38082 10.5858C1.11888 10.3239 0.685331 10.3239 0.423396 10.5858C0.16146 10.8477 0.16146 11.2813 0.423396 11.5432L2.68146 13.8013C2.74469 13.8645 2.81694 13.9097 2.89823 13.9458C2.97952 13.9819 3.06985 14 3.16017 14C3.25049 14 3.33178 13.9819 3.42211 13.9458C3.5034 13.9097 3.57565 13.8645 3.63888 13.8013L5.89694 11.5432C6.15888 11.2813 6.15888 10.8477 5.89694 10.5858C5.63501 10.3239 5.20146 10.3239 4.93953 10.5858ZM13.0957 0H7.22468C6.85436 0 6.54726 0.307097 6.54726 0.677419C6.54726 1.04774 6.85436 1.35484 7.22468 1.35484H13.0957C13.466 1.35484 13.7731 1.04774 13.7731 0.677419C13.7731 0.307097 13.466 0 13.0957 0ZM7.22468 5.41935H9.48275C9.85307 5.41935 10.1602 5.72645 10.1602 6.09677C10.1602 6.4671 9.85307 6.77419 9.48275 6.77419H7.22468C6.85436 6.77419 6.54726 6.4671 6.54726 6.09677C6.54726 5.72645 6.85436 5.41935 7.22468 5.41935ZM7.6763 8.12903H7.22468C6.85436 8.12903 6.54726 8.43613 6.54726 8.80645C6.54726 9.17677 6.85436 9.48387 7.22468 9.48387H7.6763C8.04662 9.48387 8.35372 9.17677 8.35372 8.80645C8.35372 8.43613 8.04662 8.12903 7.6763 8.12903ZM7.22468 2.70968H11.2892C11.6595 2.70968 11.9666 3.01677 11.9666 3.3871C11.9666 3.75742 11.6595 4.06452 11.2892 4.06452H7.22468C6.85436 4.06452 6.54726 3.75742 6.54726 3.3871C6.54726 3.01677 6.85436 2.70968 7.22468 2.70968Z" fill="currentColor"></path>
                    </svg> 
                )} 
            </div> 
        </th> 
    ); 
};

const PendingPullouts = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'default' });
    const [isProcessing, setIsProcessing] = useState(false);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    useEffect(() => {
        const customTitleNode = (
            <div className="flex items-center text-[20px] font-bold text-gray-800">
                <button onClick={() => navigate(`/sale-representative/details/${id}`)} className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7h18" /></svg>
                </button>
                <span>Pending Pullout Orders</span>
            </div>
        );

        setTitle(customTitleNode);
        setActions(null); 
        return () => setTitle('');
    }, [navigate, id, setTitle, setActions]);

    const fetchPendingOrders = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/orders-pending-pullouts/${id}`, getAuthConfig());
            if (res.data?.status === 'success') {
                setOrders(res.data.data?.order || []);
                setSelectedOrders([]); 
            }
        } catch (error) {
            console.error("Failed to fetch pending pullouts:", error);
            toast.error("Failed to load pending pullout orders.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrders();
    }, [id]);

    const displayData = useMemo(() => {
        let filtered = [...orders];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(o => 
                String(o.invoiceNumber || '').toLowerCase().includes(q) ||
                String(o.companyName || '').toLowerCase().includes(q)
            );
        }

        if (sortConfig.key && sortConfig.direction !== 'default') {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (sortConfig.key === 'invoiceDate') {
                    valA = new Date(valA).getTime() || 0;
                    valB = new Date(valB).getTime() || 0;
                } else if (sortConfig.key === 'overdueInvoice') {
                    valA = Number(valA) || 0;
                    valB = Number(valB) || 0;
                } else {
                    valA = String(valA || '').toLowerCase();
                    valB = String(valB || '').toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [orders, searchQuery, sortConfig]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedOrders(displayData.map(o => o.id));
        else setSelectedOrders([]);
    };

    const handleSelectOne = (orderId) => {
        setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return { key: 'default', direction: 'default' };
                return { key, direction: 'asc' }; 
            }
            return { key, direction: 'asc' }; 
        });
    };

    const handlePullout = async () => {
        if (selectedOrders.length === 0) {
            return toast.warning("Please select at least one order to process payment.");
        }

        setIsProcessing(true);
        try {
            const selectedOrderData = orders.filter(o => selectedOrders.includes(o.id));
            const calculatedAmount = selectedOrderData.reduce((sum, o) => sum + parseFloat(o.adminReceivableAmount || 0), 0);

            const payload = {
                amount: parseFloat(calculatedAmount.toFixed(2)),
                orderList: selectedOrderData.map(o => ({
                    id: o.id,
                    localPatnerCommission: o.localPatnerCommission,
                    adminReceivableAmount: o.adminReceivableAmount,
                    invoiceNumber: o.invoiceNumber
                })),
                dateAndTime: new Date().toISOString()
            };

            const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/admin/pull-payments-from-patners-banka-account/${id}`, payload, getAuthConfig());

            if (res.data?.status === 'success' || res.status === 200 || res.status === 201) {
                toast.success("Pullout payment processed successfully!");
                fetchPendingOrders(); 
            }
        } catch (error) {
            console.error("Pullout Failed:", error);
            toast.error(error.response?.data?.message || "Failed to process pullout payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadCSV = () => {
        if (!displayData.length) return toast.info("No data to download!");
        const csvContent = [
            ["Invoice Number", "Company", "Admin Receivable", "Total Bill", "Partner Profit", "Invoice Date", "Overdue Invoice", "Discount Price", "Items Price", "Wholesale Price"],
            ...displayData.map(o => [
                o.invoiceNumber, o.companyName, o.adminReceivableAmount, o.totalBill, o.localPatnerCommission, 
                o.invoiceDate, o.overdueInvoice ? "Yes" : "No", o.discountPrice, o.itemsPrice, o.wholesalePrice
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Pending_Pullouts_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalOrdersCount = orders.length;
    const totalAdminReceivable = orders.reduce((sum, order) => sum + parseFloat(order.adminReceivableAmount || 0), 0).toFixed(2);

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans flex flex-col gap-6">
            
            <PageStatsHeader 
                cardTitle="Total Orders"
                totalValue={isLoading ? '...' : totalOrdersCount}
                secondCardTitle="Total Admin Receivable Amount"
                secondTotalValue={isLoading ? '...' : `$${totalAdminReceivable}`}
                buttonText="Pullout Payment"
                buttonLoadingText="Processing..."
                isButtonLoading={isProcessing}
                onButtonClick={handlePullout}
            />

            <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-6 flex flex-col">
                
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden shadow-inner">
                        <div className="pl-3 pr-2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                        </div>
                        <input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3"
                        />
                    </div>
                    <button onClick={handleDownloadCSV} className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[15px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z"/></svg>
                        Download CSV
                    </button>
                </div>

                <div className="w-full overflow-x-auto border border-[#e2e8f0] rounded-[8px]">
                    <table className="w-full text-left min-w-max border-collapse whitespace-nowrap">
                        <thead className="bg-[#f9fafb] border-b border-[#e2e8f0]">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center border-r border-[#e2e8f0]">
                                    <input 
                                        type="checkbox" 
                                        checked={displayData.length > 0 && selectedOrders.length === displayData.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 cursor-pointer rounded border-gray-300 accent-[#86644c]"
                                    />
                                </th>
                                <SortableHeader label="INV#" sortKey="invoiceNumber" currentSort={sortConfig} onSort={handleSort} width="w-[140px]" />
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Company Name</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Admin Receivable</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Total Bill</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Partner Profit</th>
                                <SortableHeader label="Invoice Date" sortKey="invoiceDate" currentSort={sortConfig} onSort={handleSort} width="w-[150px]" />
                                <SortableHeader label="Overdue Invoice" sortKey="overdueInvoice" currentSort={sortConfig} onSort={handleSort} width="w-[170px]" />
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Discount Price</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Items Price</th>
                                <th className="px-6 py-4 font-bold text-[#374151] text-[14px]">Wholesale Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                            {isLoading ? (
                                <tr><td colSpan={11} className="text-center py-12 text-gray-500 italic">Loading pullout orders...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        onClick={() => handleSelectOne(order.id)}
                                        className={`hover:bg-gray-50 transition-colors h-[64px] text-[#4b5563] text-[14px] cursor-pointer ${selectedOrders.includes(order.id) ? 'bg-orange-50/30' : ''}`} 
                                    >
                                        <td className="px-6 py-4 text-center border-r border-[#e2e8f0]">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => handleSelectOne(order.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 cursor-pointer rounded border-gray-300 accent-[#86644c]"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.invoiceNumber || "—"}</td>
                                        <td className="px-6 py-4">{order.companyName || "—"}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">${parseFloat(order.adminReceivableAmount || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">${parseFloat(order.totalBill || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">${parseFloat(order.localPatnerCommission || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">{order.invoiceDate || "—"}</td>
                                        
                                        {/* EXACT FIX YOU REQUESTED: Simple text "Yes" or "No" */}
                                        <td className="px-6 py-4 text-center font-medium">
                                            {order.overdueInvoice ? "Yes" : "No"}
                                        </td>

                                        <td className="px-6 py-4">${parseFloat(order.discountPrice || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">${parseFloat(order.itemsPrice || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">${parseFloat(order.wholesalePrice || 0).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={11} className="text-center py-12 text-gray-500 italic">No pending pullouts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default PendingPullouts;
