import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import { exportToCSV } from '../../utils/csvHelper'; 
import useStore from '../../Hooks/useStore'; 
import { SortableHeader } from '../Shared/Table/SortableHeader'; 
import { TablePagination } from '../Shared/Table/TablePagination'; 

export const SupplierCustomerOrderLayout = ({ apiEndpoint, detailsBaseRoute }) => { 
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
                const res = await axios.get(url, { 
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
                }); 
                
                if (res.data.status === 'success') { 
                    setOrders(res.data.data?.data || []); 
                    const exactTotal = res.data.pagination?.totalItems || 0; 
                    setPagination(p => ({ ...p, total: exactTotal })); 
                } 
            } catch (error) { 
                console.error("Failed to fetch supplier customer orders:", error); 
            } finally { 
                setIsLoading(false); 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchOrders(); 
    }, [pagination.page, pagination.limit, apiEndpoint, setIsGlobalLoading]); 

    // --- Sorting Logic (Only for ID as requested) ---
    const handleSort = (key) => { 
        let direction = 'asc'; 
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; 
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default'; 
        setSortConfig({ key: direction === 'default' ? null : key, direction }); 
    }; 

    // --- Search Logic ---
    const filteredOrders = orders.filter(item => { 
        if (!searchQuery) return true; 
        const q = searchQuery.toLowerCase(); 
        return ( 
            String(item.id).includes(q) || 
            (item.companyName || '').toLowerCase().includes(q) || 
            (item.customerName || '').toLowerCase().includes(q) || 
            (item.orderCurrentStatus || '').toLowerCase().includes(q) 
        ); 
    }); 

    // --- Apply Sort ---
    const displayData = [...filteredOrders]; 
    if (sortConfig.key === 'id' && sortConfig.direction !== 'default') { 
        displayData.sort((a, b) => { 
            let valA = a.id; 
            let valB = b.id; 
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; 
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; 
            return 0; 
        }); 
    } 

    // --- Helper to calculate total items from customer order ---
    const calculateTotalItems = (itemsArray) => {
        if (!itemsArray || !Array.isArray(itemsArray)) return 0;
        return itemsArray.reduce((total, currentItem) => total + parseInt(currentItem.qty || 0), 0);
    };

    const handleDownloadCSV = () => { 
        if (!displayData.length) return alert("No data to download!"); 
        const csvFormatted = displayData.map(order => ({ 
            "Order ID": order.id, 
            "Company Name": order.companyName || order.customerName || "—", 
            "No of Items": calculateTotalItems(order.items), // Uses 'items' array for Customer Orders
            "Status": order.orderCurrentStatus 
        })); 
        exportToCSV(csvFormatted, `Supplier_Customer_Orders_Page_${pagination.page}.csv`); 
    }; 

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans flex flex-col gap-6"> 
            
            {/* --- Total Stats Card --- */}
            <div className="w-[300px] bg-[#f9fafb] border-[0.66px] border-[#e2e8f0] rounded-[8px] p-6 shadow-sm"> 
                <h3 className="text-[16px] font-semibold text-black mb-4">Total Orders</h3> 
                <p className="text-[20px] font-medium text-black">{pagination.total}</p> 
            </div> 
            
            {/* --- Main Table Container --- */}
            <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-6 flex flex-col relative"> 
                
                {/* Search & Download Row */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4"> 
                    <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden"> 
                        <div className="pl-3 pr-2 text-gray-400"> 
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg> 
                        </div> 
                        <input type="search" placeholder="Search by ID, Company Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3" /> 
                    </div> 
                    <button onClick={handleDownloadCSV} className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[15px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm"> 
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg> 
                        Download CSV 
                    </button> 
                </div> 

                {/* Table Area */}
                <div className="w-full overflow-x-auto"> 
                    <table className="w-full text-left min-w-max border-none"> 
                        <thead className="bg-[#f9fafb]"> 
                            <tr> 
                                <SortableHeader label="#" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[100px]" /> 
                                {/* Changed from Partner Name to Company Name */}
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[250px] border-none">Company Name</th> 
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[150px] border-none">No of Items</th> 
                                <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[200px] border-none last:rounded-r-lg">Status</th> 
                            </tr> 
                        </thead> 
                        <tbody className="border-none"> 
                            {isLoading ? ( 
                                <tr><td colSpan="4" className="text-center py-12 text-gray-500 italic border-none">Loading orders...</td></tr> 
                            ) : displayData.length > 0 ? ( 
                                displayData.map((order) => { 
                                    const isSelected = selectedRowId === order.id; 
                                    const totalItemsCount = calculateTotalItems(order.items); // Uses 'items' for Customer Orders

                                    return ( 
                                        <tr 
                                            key={order.id} 
                                            onClick={() => { 
                                                setSelectedRowId(order.id); 
                                                navigate(`${detailsBaseRoute}/${order.id}`, { state: { orderData: order } }); 
                                            }} 
                                            className={`transition-colors h-[64px] text-[#4b5563] text-[15px] cursor-pointer duration-200 ${isSelected ? 'bg-table-selected' : 'bg-white hover:bg-gray-50' }`} 
                                        > 
                                            <td className="px-8 py-5 border-none">{order.id}</td> 
                                            <td className="px-8 py-5 border-none font-medium truncate max-w-[250px]" title={order.companyName || order.customerName}>
                                                {/* Fallback to customerName if companyName is missing */}
                                                {order.companyName || order.customerName || "—"}
                                            </td> 
                                            <td className="px-8 py-5 border-none">{totalItemsCount}</td> 
                                            {/* Status as simple text as requested */}
                                            <td className="px-8 py-5 border-none capitalize text-[#4b5563]">
                                                {order.orderCurrentStatus}
                                            </td> 
                                        </tr> 
                                    ); 
                                }) 
                            ) : ( 
                                <tr><td colSpan="4" className="text-center py-12 text-gray-500 italic border-none">No orders found.</td></tr> 
                            )} 
                        </tbody> 
                    </table> 
                </div> 
                
                <TablePagination pagination={pagination} setPagination={setPagination} /> 
            </div> 
        </div> 
    ); 
};