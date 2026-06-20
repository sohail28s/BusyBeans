import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useStore from '../../../Hooks/useStore';
import { exportToCSV } from '../../../utils/csvHelper';
import ReportDateBar from '../../Home/ReportDateBar';
import { SortableHeader } from '../../Shared/Table/SortableHeader';
import { TablePagination } from '../../Shared/Table/TablePagination';

const getDatesForPreset = (preset) => { 
    const today = new Date(); 
    const year = today.getFullYear(); 
    const month = today.getMonth(); 
    const date = today.getDate(); 
    const day = today.getDay(); 
    
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
    
    let start, end; 
    switch (preset) { 
        case 'All Time': 
            start = new Date(2025, 0, 1); 
            end = today; 
            break; 
        case 'Current year': 
            start = new Date(year, 0, 1); 
            end = new Date(year, 11, 31); 
            break; 
        case 'Current Month': 
            start = new Date(year, month, 1); 
            end = new Date(year, month + 1, 0); 
            break; 
        case 'Current Week': 
            start = new Date(today); 
            start.setDate(date - day); 
            end = new Date(today); 
            end.setDate(date - day + 6); 
            break; 
        case 'Last Year': 
            start = new Date(year - 1, 0, 1); 
            end = new Date(year - 1, 11, 31); 
            break; 
        case 'Last 90 days': 
            start = new Date(today); 
            start.setDate(date - 90); 
            end = today; 
            break; 
        case 'Last Month': 
            start = new Date(year, month - 1, 1); 
            end = new Date(year, month, 0); 
            break; 
        case 'Month to date': 
            start = new Date(year, month, 1); 
            end = today; 
            break; 
        case 'Last week': 
            start = new Date(today); 
            start.setDate(date - day - 7); 
            end = new Date(today); 
            end.setDate(date - day - 1); 
            break; 
        default: 
            return { start: null, end: null }; 
    } 
    return { start: format(start), end: format(end) }; 
}; 

// --- NEW: Reverse Lookup Function ---
const getPresetForDates = (startStr, endStr) => {
    const presets = [
        'All Time', 'Current year', 'Current Month', 'Current Week', 
        'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week'
    ];
    
    // Check if the provided dates match any preset's generated dates
    for (const preset of presets) {
        const { start, end } = getDatesForPreset(preset);
        if (start === startStr && end === endStr) {
            return preset;
        }
    }
    return 'Custom';
};


// --- MAIN COMPONENT ---
const AssignedOrdersReport = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Global State
    const setStoreTitle = useStore(state => state.setTitle);
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);
    const userId = useStore(state => state.userId);

    // URL Dates
    const urlStartDate = searchParams.get('startDate'); 
    const urlEndDate = searchParams.get('endDate');

    // Local State
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

    // Date Bar States
    const [datePreset, setDatePreset] = useState('All Time'); 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
    const dropdownRef = useRef(null); 
    const presetOptions = ['All Time', 'Today', 'Yesterday', 'This Week', 'This Month', 'Custom'];

    // Set Page Title
    useEffect(() => {
        setStoreTitle('Assigned Orders Report');
        return () => setStoreTitle('');
    }, [setStoreTitle]);

    // --- URL LISTENER (Syncs URL Dates with State) ---
    useEffect(() => { 
        if (urlStartDate && urlEndDate) { 
            const matchedPreset = getPresetForDates(urlStartDate, urlEndDate); 
            setDatePreset(matchedPreset); 
            setStartDate(urlStartDate); 
            setEndDate(urlEndDate); 
        } else { 
            // Default to 'All Time' when page first loads without URL params
            handlePresetSelect('All Time'); 
        } 
    }, [urlStartDate, urlEndDate]);

    // --- URL PARAM WRITER ---
    const updateUrlParams = (start, end) => { 
        const params = new URLSearchParams(searchParams); 
        if (start) params.set('startDate', start); 
        if (end) params.set('endDate', end); 
        params.delete('preset'); 
        setSearchParams(params, { replace: true }); 
    }; 

    const handlePresetSelect = (preset) => { 
        setIsDropdownOpen(false); 
        if (preset === 'Custom') { 
            setDatePreset('Custom'); 
            updateUrlParams(startDate, endDate); 
            return; 
        } 
        const { start, end } = getDatesForPreset(preset); 
        if (start && end) { 
            updateUrlParams(start, end); 
        } 
    };

    // --- API FETCH (Triggers when dates change) ---
    useEffect(() => {
        const fetchReportData = async () => {
            if (!userId || !startDate || !endDate) return; 

            setIsLoading(true);
            setIsGlobalLoading(true);

            try {
                const url = `https://testingbb.trimworldwide.com/api/v1/admin/supplier-reports/assigned-orders-report/${userId}`;
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });

                if (res.data.status === 'success') {
                    const rawData = res.data.data?.data || [];
                    const dataWithSL = rawData.map((item, index) => ({
                        ...item,
                        sl: index + 1
                    }));
                    
                    setReports(dataWithSL);
                    const exactTotal = res.data.pagination?.totalItems || res.data.results || 0;
                    setPagination(p => ({ ...p, total: exactTotal }));
                }
            } catch (error) {
                console.error("Failed to fetch assigned orders report:", error);
            } finally {
                setIsLoading(false);
                setIsGlobalLoading(false);
            }
        };

        fetchReportData();
    }, [startDate, endDate, pagination.page, pagination.limit, userId, setIsGlobalLoading]);

    // --- Sorting Logic ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default';
        setSortConfig({ key: direction === 'default' ? null : key, direction });
    };

    // --- Search Filtering ---
    const filteredReports = reports.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            String(item.sl).includes(q) ||
            (item.customerName || '').toLowerCase().includes(q) ||
            (item.productNames || '').toLowerCase().includes(q) ||
            (item.note || '').toLowerCase().includes(q)
        );
    });

    // --- Apply Sorting ---
    const displayData = [...filteredReports];
    if (sortConfig.key && sortConfig.direction !== 'default') {
        displayData.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            if (sortConfig.key === 'sl' || sortConfig.key === 'totalQuantity') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // --- Helpers ---
    const handleDownloadCSV = () => {
        if (!displayData.length) return alert("No data to download!");
        const csvFormatted = displayData.map(row => ({
            "SL": row.sl,
            "Customer Name": row.customerName || "—",
            "Product Names": row.productNames || "—",
            "Total Quantity": row.totalQuantity || 0,
            "Assigned At": row.assignedAt || "—",
            "Note": row.note || "—"
        }));
        exportToCSV(csvFormatted, `Assigned_Orders_Report_${startDate}_to_${endDate}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans flex flex-col gap-6">
            
            {/* --- Date Bar (Range Enabled, Filter Disabled) --- */}
            <ReportDateBar 
                onBackClick={() => navigate(-1)} 
                showDateRangeBar={true} 
                datePreset={datePreset} 
                isDropdownOpen={isDropdownOpen} 
                setIsDropdownOpen={setIsDropdownOpen} 
                dropdownRef={dropdownRef} 
                presetOptions={presetOptions} 
                onPresetSelect={handlePresetSelect} 
                startDate={startDate} 
                endDate={endDate} 
                onStartChange={(e) => updateUrlParams(e.target.value, endDate)} 
                onEndChange={(e) => updateUrlParams(startDate, e.target.value)} 
                onCloseCustom={() => handlePresetSelect('All Time')} 
                presetOptions={['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom']} 
            />

            <div className="px-6 md:px-8 pb-8 flex flex-col gap-6">
                
                {/* --- Main Table Container --- */}
                <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-6 flex flex-col relative">
                    
                    {/* Search & Download Row */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="relative flex items-center w-full sm:w-[350px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden">
                            <div className="pl-3 pr-2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                            </div>
                            <input 
                                type="search" 
                                placeholder="Search by SL, Name, Product..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3" 
                            />
                        </div>
                        <button onClick={handleDownloadCSV} className="h-[45px] px-6 flex items-center gap-2 bg-black text-white text-[15px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm active:scale-[0.98]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg>
                            Download CSV
                        </button>
                    </div>

                    {/* Table Area (Scrollable on small screens) */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-none min-w-[1100px]">
                            <thead className="bg-[#f9fafb]">
                                <tr>
                                    <SortableHeader label="SL" sortKey="sl" currentSort={sortConfig} onSort={handleSort} width="w-[80px]" />
                                    <th className="px-6 py-5 font-bold text-[#374151] text-[14px] w-[200px] border-none">Customer Name</th>
                                    <th className="px-6 py-5 font-bold text-[#374151] text-[14px] w-[350px] border-none">Product Names</th>
                                    <th className="px-6 py-5 font-bold text-[#374151] text-[14px] w-[150px] border-none text-center">Total Quantity</th>
                                    <th className="px-6 py-5 font-bold text-[#374151] text-[14px] w-[220px] border-none">Assigned At</th>
                                    <th className="px-6 py-5 font-bold text-[#374151] text-[14px] w-[200px] border-none last:rounded-r-lg">Note</th>
                                </tr>
                            </thead>
                            <tbody className="border-none">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="text-center py-12 text-gray-500 italic border-none">Loading report...</td></tr>
                                ) : displayData.length > 0 ? (
                                    displayData.map((row) => (
                                        <tr 
                                            key={row.id} 
                                            className="transition-colors text-[#4b5563] text-[15px] border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-5 border-none align-top font-medium">{row.sl}</td>
                                            <td className="px-6 py-5 border-none align-top whitespace-normal break-words">{row.customerName || "—"}</td>
                                            <td className="px-6 py-5 border-none align-top whitespace-normal break-words leading-relaxed text-gray-500">{row.productNames || "—"}</td>
                                            <td className="px-6 py-5 border-none align-top font-medium text-center">{row.totalQuantity || 0}</td>
                                            <td className="px-6 py-5 border-none align-top whitespace-normal break-words">{row.assignedAt || "—"}</td>
                                            <td className="px-6 py-5 border-none align-top whitespace-normal break-words text-gray-500">{row.note || "—"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-12 text-gray-500 italic border-none">No assigned orders found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <TablePagination pagination={pagination} setPagination={setPagination} variant='simple' />
                </div>
            </div>
        </div>
    );
};

export default AssignedOrdersReport;