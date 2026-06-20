import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import PulloutIntentTable from './PulloutIntentTable';

// --- Updated Date Preset Logic ---
const getDatesForPreset = (preset) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let start, end;

    switch (preset) {
        case 'All time':
            start = new Date(2025, 0, 1);
            end = today;
            break;
        case 'Today':
            start = new Date(today);
            end = new Date(today);
            break;
        case 'Yesterday':
            start = new Date(today);
            start.setDate(date - 1);
            end = new Date(start);
            break;
        case 'Last 7 days':
            start = new Date(today);
            start.setDate(date - 7);
            end = today;
            break;
        case 'Last 30 days':
            start = new Date(today);
            start.setDate(date - 30);
            end = today;
            break;
        case 'Last 90 days':
            start = new Date(today);
            start.setDate(date - 90);
            end = today;
            break;
        case 'This month':
            start = new Date(year, month, 1);
            end = today;
            break;
        case 'Last month':
            start = new Date(year, month - 1, 1);
            end = new Date(year, month, 0);
            break;
        default:
            return { start: null, end: null };
    }
    return { start: format(start), end: format(end) };
};

// Updated list exactly as requested
const datePresets = ['All time', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This month', 'Last month', 'Custom'];

// Formatting helper to create "Apr 01, 2026"
const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const PulloutIntentSyncPage = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const setShowProfile = useStore((state) => state.setShowProfile);


    // --- State ---
    const [activeTab, setActiveTab] = useState('Not synced');
    const [datePreset, setDatePreset] = useState('All time');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedPartnerId, setSelectedPartnerId] = useState('');
    const [partnersList, setPartnersList] = useState([]);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);

    // Pagination & Selection
    const [pagination, setPagination] = useState({ page: 1, limit: 20, totalItems: 0 });
    const [selectedRows, setSelectedRows] = useState([]);

    // Sync Summary State
    const [syncSummary, setSyncSummary] = useState(null);

    // --- Header Initialization ---
    useEffect(() => {
        setTitle('QuickBooks invoices — pullout intent sync');
        setShowProfile(false);
        return () =>
            setTitle('');
        setShowProfile(true);
    }, [setTitle, setShowProfile]);

    // --- Date Range Calculation ---
    const derivedDateRange = useMemo(() => {
        if (datePreset === 'Custom') return { start: startDate, end: endDate };
        return getDatesForPreset(datePreset);
    }, [datePreset, startDate, endDate]);

    // --- Clear Summary when filters/tabs change ---
    useEffect(() => {
        setSyncSummary(null);
        setSelectedRows([]);
        setPagination(p => ({ ...p, page: 1 }));
    }, [activeTab, datePreset, startDate, endDate, selectedPartnerId]);

    // --- 1. Fetch Partners for Dropdown ---
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep?limit=10000', getAuthConfig());
                if (res.data?.status === 'success') {
                    setPartnersList(res.data.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch partners:", error);
            }
        };
        fetchPartners();
    }, []);

    // --- 2. Fetch Main Data ---
    const fetchData = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const { start, end } = derivedDateRange;
            let baseUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/pullout-intent-unsynced-orders';
            const params = new URLSearchParams({ page: pagination.page, limit: pagination.limit });

            if (activeTab === 'Synced') params.append('syncStatus', 'synced');
            if (start) params.append('startDate', start);
            if (end) params.append('endDate', end);
            if (selectedPartnerId) params.append('salesRepId', selectedPartnerId);

            const res = await axios.get(`${baseUrl}?${params.toString()}`, getAuthConfig());
            if (res.data?.status === 'success') {
                setData(res.data.data || []);
                const exactTotal = res.data.pagination?.total || res.data.pagination?.totalItems || 0;
                setPagination(p => ({ ...p, totalItems: exactTotal }));
            } else {
                toast.error("Failed to fetch data.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching orders.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, derivedDateRange, selectedPartnerId, pagination.page, pagination.limit]);

    const handleSyncSelected = async () => {
        if (selectedRows.length === 0) return;
        setIsSyncing(true);
        setIsGlobalLoading(true);
        try {
            const payload = { orderIds: selectedRows };
            const res = await axios.post('https://testingbb.trimworldwide.com/api/v1/admin/qbo/pullout-custom-field/sync', payload, getAuthConfig());
            if (res.data?.status === 'success') {
                toast.success("Sync operation completed.");
                setSyncSummary(res.data);
                setSelectedRows([]);
                fetchData();
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("Failed to sync selected orders.");
        } finally {
            setIsSyncing(false);
            setIsGlobalLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans p-6 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">

                <div className="flex items-center flex-wrap">
                    <button
                        type="button"
                        onClick={() => setActiveTab('Not synced')}
                        className={`font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 ${activeTab === 'Not synced' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                        Not synced
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('Synced')}
                        className={`font-workSans font-medium border border-black border-l-0 px-5 sm:px-8 py-2.5 duration-200 ${activeTab === 'Synced' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                        Synced
                    </button>
                </div>

                <p className="max-w-4xl text-[14px] text-gray-500 py-4">
                    Customer orders (dropship partner, bank check pullouts) whose PulloutIntentId is not yet on the admin QuickBooks invoice. Select rows and sync; successful rows disappear from this list on refresh.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-y-4 py-4" data-testid="pullout-intent-qbo-sync-filter-section">
                    <div className="flex items-center gap-x-4 flex-wrap gap-y-2">

                        <button type="button" className="flex justify-center items-center text-black hover:opacity-70 transition-opacity mt-0.5">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg">
                                <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
                            </svg>
                        </button>

                        <div className="flex items-center gap-2 px-4 h-[42px] bg-whiterounded-md border border-gray-200">
                            <span className="text-[15px] font-sans text-[#4b5563]">Date range:</span>
                            <span className="text-[15px] font-sans font-semibold text-[#111827]">
                                {derivedDateRange.start ? `${formatDisplayDate(derivedDateRange.start)} — ${formatDisplayDate(derivedDateRange.end)}` : 'All time'}
                            </span>
                        </div>

                        <div className="relative w-[180px]">
                            <div
                                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                                className={`w-full h-[50px] pl-4 pr-2 bg-white border rounded-md text-[15px] text-[#111827] outline-none cursor-pointer flex items-center justify-between shadow-sm transition-all ${isDateDropdownOpen ? 'border-[#86644c] ring-1 ring-[#86644c]' : 'border-gray-200 hover:border-[#86644c]'}`}
                            >
                                <span className="truncate select-none">{datePreset}</span>
                                <div className="flex items-center pointer-events-none">
                                    <span className="w-[1px] h-[22px] bg-gray-200 mx-2"></span>
                                    <div className="flex items-center justify-center px-1 text-[#111827]">
                                        <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="currentColor" className={`transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180' : ''}`}>
                                            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {isDateDropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-input-brown border border-gray-200 rounded-md shadow-xl z-50 max-h-[250px] overflow-y-auto py-1">
                                    {datePresets.map(preset => (
                                        <div
                                            key={preset}
                                            onClick={() => {
                                                setDatePreset(preset);
                                                setIsDateDropdownOpen(false);
                                            }}
                                            className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors text-white hover:bg-input-hover ${datePreset === preset ? 'bg-input-hover font-medium' : ''}`}
                                        >
                                            {preset}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative w-[220px]">
                            <div
                                onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}
                                className={`w-full h-[50px] pl-4 pr-2 bg-white border rounded-md text-[15px] text-[#111827] outline-none cursor-pointer flex items-center justify-between shadow-sm transition-all ${isPartnerDropdownOpen ? 'border-[#86644c] ring-1 ring-[#86644c]' : 'border-gray-200 hover:border-[#86644c]'}`}
                            >
                                <span className="truncate select-none">
                                    {selectedPartnerId === "" ? "All Local Partners" : partnersList.find(p => p.id.toString() === selectedPartnerId)?.srName || "All Local Partners"}
                                </span>
                                <div className="flex items-center pointer-events-none">
                                    <span className="w-[1px] h-[22px] bg-gray-200 mx-2"></span>
                                    <div className="flex items-center justify-center px-1 text-[#111827]">
                                        <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="currentColor" className={`transition-transform duration-200 ${isPartnerDropdownOpen ? 'rotate-180' : ''}`}>
                                            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {isPartnerDropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-input-brown border border-gray-200 rounded-md shadow-xl z-50 max-h-[250px] overflow-y-auto py-1">
                                    <div
                                        onClick={() => { setSelectedPartnerId(""); setIsPartnerDropdownOpen(false); }}
                                        className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors text-white hover:bg-input-hover ${selectedPartnerId === "" ? 'bg-input-hover font-medium' : ''}`}
                                    >
                                        All Local Partners
                                    </div>
                                    {partnersList.map(partner => (
                                        <div
                                            key={partner.id}
                                            onClick={() => { setSelectedPartnerId(partner.id.toString()); setIsPartnerDropdownOpen(false); }}
                                            className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors text-white hover:bg-input-hover ${selectedPartnerId === partner.id.toString() ? 'bg-input-hover font-medium' : ''}`}
                                        >
                                            {partner.srName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
{/* 
                        {datePreset === 'Custom' && (
                            <div className="flex items-center gap-2 animate-fadeIn">
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-[42px] px-3 border border-gray-300 rounded-md text-[15px] outline-none bg-white text-black focus:border-blue-500 shadow-sm" />
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-[42px] px-3 border border-gray-300 rounded-md text-[15px] outline-none bg-white text-black focus:border-blue-500 shadow-sm" />
                            </div>
                        )} */}


                        {datePreset === 'Custom' && (
    <div className="flex items-center gap-2 animate-fadeIn">
        
        {/* Start Date Container */}
        <div className="relative h-[42px] flex border border-gray-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 shadow-sm transition-colors">
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full h-full px-3 bg-transparent outline-none text-[15px] text-black [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10" 
            />
            {/* Custom Black Filled Calendar Icon */}
            <div className="flex items-center justify-center pr-3 pl-1 text-black pointer-events-none relative z-0 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75Zm13.5 9H3.75v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                </svg>
            </div>
        </div>

        {/* End Date Container */}
        <div className="relative h-[42px] flex border border-gray-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 shadow-sm transition-colors">
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full h-full px-3 bg-transparent outline-none text-[15px] text-black [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10" 
            />
            {/* Custom Black Filled Calendar Icon */}
            <div className="flex items-center justify-center pr-3 pl-1 text-black pointer-events-none relative z-0 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75Zm13.5 9H3.75v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                </svg>
            </div>
        </div>

    </div>
)}
                    </div>

                    {activeTab === 'Not synced' && (
                        <button
                            onClick={handleSyncSelected}
                            disabled={selectedRows.length === 0 || isSyncing}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border font-medium transition-colors duration-200 ${selectedRows.length > 0 && !isSyncing
                                    ? 'bg-black text-white border-black hover:bg-white hover:text-black'
                                    : 'bg-[#a38068] text-white border-[#a38068] opacity-60 cursor-not-allowed'
                                }`}
                        >
                            {isSyncing ? 'Syncing...' : `Sync selected (${selectedRows.length})`}
                        </button>
                    )}
                </div>

                {syncSummary && (
                    <div className="rounded-lg border border-gray-200 bg-stone-50 p-4 space-y-3 mb-6 animate-fadeIn" data-testid="pullout-intent-qbo-sync-results-panel">
                        <h3 className="font-sans font-semibold text-slate-500">Last sync summary</h3>
                        <div className="flex flex-wrap gap-4 text-sm font-medium">
                            <span className="text-gray-900">Total: {syncSummary.summary.total}</span>
                            <span className="text-emerald-800">Synced: {syncSummary.summary.synced}</span>
                            <span className="text-amber-800">Skipped: {syncSummary.summary.skipped}</span>
                            <span className="text-red-800">Failed: {syncSummary.summary.failed}</span>
                        </div>
                        {syncSummary.results && syncSummary.results.length > 0 && (
                            <div className="max-h-64 overflow-auto rounded border border-stone-200 bg-white custom-scrollbar">
                                <table className="min-w-full text-left text-[13px]">
                                    <thead className="bg-stone-100 font-semibold text-stone-700">
                                        <tr>
                                            <th className="px-4 py-2.5">Order ID</th>
                                            <th className="px-4 py-2.5">Outcome</th>
                                            <th className="px-4 py-2.5">Action</th>
                                            <th className="px-4 py-2.5">QBO invoice</th>
                                            <th className="px-4 py-2.5">HTTP</th>
                                            <th className="px-4 py-2.5">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {syncSummary.results.map((result, idx) => (
                                            <tr key={idx} className="border-t border-stone-100 hover:bg-stone-50 transition-colors text-gray-700">
                                                <td className="px-4 py-2 font-mono">{result.orderId}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-block rounded border px-2 py-0.5 text-[12px] font-medium ${result.outcome === 'skipped' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                                                            result.outcome === 'synced' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                                                                'bg-red-100 text-red-900 border-red-200'
                                                        }`}>
                                                        {result.outcome}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">{result.action}</td>
                                                <td className="px-4 py-2 font-mono">{result.invoiceId || '—'}</td>
                                                <td className="px-4 py-2">{result.syncResult?.statusCode || '—'}</td>
                                                <td className="px-4 py-2 max-w-md truncate" title={result.reason}>{result.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}


                <PulloutIntentTable
                    data={data}
                    isLoading={isLoading}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    isSyncTab={activeTab === 'Synced'}
                />
            </div>
        </div>
    );
};

export default PulloutIntentSyncPage;