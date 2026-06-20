import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToCSV } from '../../utils/csvHelper';
import useStore from '../../Hooks/useStore';
import { toast } from 'react-toastify';
import { PageStatsHeader } from '../../Components/Shared/PageStatsHeader';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';

const UpcomingCustomerOrders = () => {
  const setTitle = useStore((state) => state.setTitle);
  const setActions = useStore((state) => state.setActions);
  const setShowProfile = useStore((state) => state.setShowProfile);
  const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebooking, setIsRebooking] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setTitle('Upcoming Orders');
    setShowProfile(false);
    setIsGlobalLoading(true);
    setActions(
      <div className="flex items-center">
        <button className="flex items-center gap-2 h-[40px] px-4 border border-gray-300 rounded-[6px] bg-white text-[14px] text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          Filters
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    );
    return () => {
      setTitle('');
      setActions(null);
      setShowProfile(true);
      setIsGlobalLoading(false);
    };
  }, [setTitle, setActions, setShowProfile, setIsGlobalLoading]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = `https://testingbb.trimworldwide.com/api/v1/admin/order-frequency/upcomming-orders?page=${pagination.page}&limit=${pagination.limit}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.data.status === 'success') {
        setOrders(res.data.data?.order || []);
        setPagination(p => ({ ...p, total: res.data.pagination?.totalItems || 0 }));
      }
    } catch (error) {
      console.error("Failed to fetch upcoming orders:", error);
      toast.error("Failed to load upcoming orders.");
    } finally {
      setIsLoading(false);
      setIsGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.limit]);

  const handleRebook = async () => {
    if (selectedIds.length === 0) {
      return toast.warning("Please select at least one order to rebook.");
    }
    setIsRebooking(true);
    try {
      const res = await axios.post(
        'https://testingbb.trimworldwide.com/api/v1/admin/order-frequency/book-orders',
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      if (res.data.status === 'success' || res.status === 200 || res.status === 201) {
        toast.success("Orders successfully rebooked!");
        setSelectedIds([]);
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to rebook orders:", error);
      toast.error("An error occurred while rebooking. Please try again.");
    } finally {
      setIsRebooking(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(displayData.map(order => order.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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
      String(item.id).toLowerCase().includes(q) ||
      String(item.companyName).toLowerCase().includes(q)
    );
  });

  const displayData = [...filteredOrders];
  if (sortConfig.key && sortConfig.direction !== 'default') {
    displayData.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === 'id') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortConfig.key === 'orderDate') {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric'
    });
  };

  const handleDownloadCSV = () => {
    if (!displayData.length) return toast.info("No data to download!");
    const csvFormatted = displayData.map(order => ({
      'ID': order.id,
      'Company Name': order.companyName,
      'Order Date': formatDate(order.orderDate),
      'Deliver On': formatDate(order.nextOrderDate)
    }));
    exportToCSV(csvFormatted, `Upcoming_Orders_Page_${pagination.page}.csv`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans flex flex-col gap-6">
      <PageStatsHeader
        cardTitle="Total Orders"
        totalValue={pagination.total}
        buttonText="Rebook Order"
        isButtonLoading={isRebooking}
        onButtonClick={handleRebook}
      />
      <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-6 flex flex-col relative">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden">
            <div className="pl-3 pr-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
            </div>
            <input
              type="search"
              placeholder="Search by Order ID, Company Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3"
            />
          </div>
          <button
            onClick={handleDownloadCSV}
            className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[15px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg>
            Download CSV
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-max border-none">
            <thead className="bg-[#f9fafb]">
              <tr>
                <th className="px-8 py-5 w-[60px] border-none first:rounded-l-lg last:rounded-r-lg">
                  {/* Select All Checkbox */}
                  <div className="relative flex items-center justify-center w-4 h-4 mx-auto">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] bg-white checked:bg-black checked:border-black cursor-pointer transition-colors m-0"
                      checked={displayData.length > 0 && selectedIds.length === displayData.length}
                      onChange={handleSelectAll}
                    />
                    <svg className="absolute w-2.5 h-2.5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </th>
                <SortableHeader label="#" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[120px]" />
                <SortableHeader label="Company Name" sortable={false} width="w-auto" />
                <SortableHeader label="Order Date" sortKey="orderDate" currentSort={sortConfig} onSort={handleSort} width="w-[200px]" />
                <SortableHeader label="Deliver On" sortable={false} width="w-[200px]" />
              </tr>
            </thead>
            <tbody className="border-none">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic border-none">Loading upcoming orders...</td></tr>
              ) : displayData.length > 0 ? (
                displayData.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleSelectOne(order.id)}
                      className={`transition-colors h-[64px] text-[#4b5563] text-[15px] cursor-pointer duration-200 ${isSelected ? 'bg-table-selected' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <td className="px-8 py-5 border-none" onClick={(e) => e.stopPropagation()}>
                        {/* Row Checkbox */}
                        <div className="relative flex items-center justify-center w-4 h-4 mx-auto">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] bg-white checked:bg-black checked:border-black cursor-pointer transition-colors m-0"
                            checked={isSelected}
                            onChange={() => handleSelectOne(order.id)}
                          />
                          <svg className="absolute w-2.5 h-2.5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </td>
                      <td className="px-8 py-5 border-none font-medium text-gray-700">{order.id}</td>
                      <td className="px-8 py-5 border-none">{order.companyName}</td>
                      <td className="px-8 py-5 border-none">{formatDate(order.orderDate)}</td>
                      <td className="px-8 py-5 border-none">{formatDate(order.nextOrderDate)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic border-none">No upcoming orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination pagination={pagination} setPagination={setPagination} />
      </div>
    </div>
  );
};

export default UpcomingCustomerOrders;