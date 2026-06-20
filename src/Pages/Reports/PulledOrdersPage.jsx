import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import { exportToCSV } from '../../utils/csvHelper';
import ReportDateBar from '../../ComponentsTemp/Home/ReportDateBar'; // Adjust Import path
import { PulledOrdersTable } from '../../ComponentsTemp/ReportsManagement/PulledOrdersTable'; // Adjust Import path

const getDatesForPreset = (preset) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    const day = today.getDay();
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let start, end;
    switch (preset) {
        case 'All Time': start = new Date(2025, 0, 1); end = today; break;
        case 'Current year': start = new Date(year, 0, 1); end = new Date(year, 11, 31); break;
        case 'Current Month': start = new Date(year, month, 1); end = new Date(year, month + 1, 0); break;
        case 'Current Week': start = new Date(today); start.setDate(date - day); end = new Date(today); end.setDate(date - day + 6); break;
        case 'Last Year': start = new Date(year - 1, 0, 1); end = new Date(year - 1, 11, 31); break;
        case 'Last 90 days': start = new Date(today); start.setDate(date - 90); end = today; break;
        case 'Last Month': start = new Date(year, month - 1, 1); end = new Date(year, month, 0); break;
        case 'Month to date': start = new Date(year, month, 1); end = today; break;
        case 'Last week': start = new Date(today); start.setDate(date - day - 7); end = new Date(today); end.setDate(date - day - 1); break;
        default: return { start: null, end: null };
    }
    return { start: format(start), end: format(end) };
};

export const PulledOrdersPage = () => {
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    // Data States
    const [reportData, setReportData] = useState([]);
    const [localPartners, setLocalPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Date Range State
    const datePresets = ['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom'];
    const [datePreset, setDatePreset] = useState('All Time');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedPartnerId, setSelectedPartnerId] = useState('all');
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Backend Pagination State
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    // --- Header Setup ---
    useEffect(() => {
        setTitle('Pulled Orders Receivable Report');
        setActions(null);
        setShowProfile(false); 

        return () => {
            setTitle('');
            setShowProfile(true); 
        };
    }, [setTitle, setActions, setShowProfile]);

    // --- Date Initialization & Updates ---
    useEffect(() => {
        if (datePreset !== 'Custom') {
            const { start, end } = getDatesForPreset(datePreset);
            if (start && end) {
                setStartDate(start);
                setEndDate(end);
            }
        }
    }, [datePreset]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [startDate, endDate, selectedPartnerId]);

    // --- Fetch Local Partners ---
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep`, getAuthConfig());
                if (res.data?.status === 'success' && res.data.data?.data) {
                    setLocalPartners(res.data.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch local partners:", err);
            }
        };
        fetchPartners();
    }, []);

    // --- Fetch Table Data ---
    const fetchReportData = useCallback(async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        setIsGlobalLoading(true);

        try {
            let apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/pulled-orders-receivable?startDate=${startDate}&endDate=${endDate}&page=${pagination.page}&limit=${pagination.limit}`;
            
            // Append Partner Filter if not 'all'
            if (selectedPartnerId !== 'all') {
                apiUrl += `&salesRepId=${selectedPartnerId}`;
            }

            const res = await axios.get(apiUrl, getAuthConfig());

            if (res.data?.status === 'success') {
                setReportData(res.data.data || []);
                if (res.data.pagination) {
                    setPagination(prev => ({ ...prev, total: res.data.pagination.total }));
                }
            } else {
                toast.error("Failed to load report data.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching the report.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    }, [startDate, endDate, selectedPartnerId, pagination.page, pagination.limit, setIsGlobalLoading]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    // --- Handlers ---
    const handlePresetSelect = (preset) => {
        setDatePreset(preset);
        setIsDropdownOpen(false);
    };

    const handleDownloadCSV = (filteredData) => {
        if (!filteredData || !filteredData.length) return toast.info("No records to export.");

        const csvFormatted = filteredData.map((item, index) => {
            return {
                "SL": index + 1,
                "Invoice #": item.invoiceNumber || "-",
                "Order Date": item.on ? new Date(item.on).toLocaleDateString() : "-",
                "Customer (Company)": item.companyName || "-",
                "Local Partner": item.salesRepName || "-",
                "Total Bill": item.totalBill ? `$${parseFloat(item.totalBill).toFixed(2)}` : "$0.00",
                "Admin Receivable": item.adminReceivableAmount ? `$${parseFloat(item.adminReceivableAmount).toFixed(2)}` : "$0.00",
                "Partner Commission": item.localPatnerCommission ? `$${parseFloat(item.localPatnerCommission).toFixed(2)}` : "$0.00",
                "Pullout Intent ID": item.effectivePulloutIntentId || "-",
                "Pullout Date": item.pulloutDate ? new Date(item.pulloutDate).toLocaleDateString() : "-",
                "Payment Status": item.paymentStatus || "-"
            };
        });

        exportToCSV(csvFormatted, `Pulled_Orders_Receivable_${startDate}_to_${endDate}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans">
            
            <ReportDateBar 
                onBackClick={() => navigate(-1)} 
                startDate={startDate} 
                endDate={endDate} 
                datePreset={datePreset} 
                isDropdownOpen={isDropdownOpen} 
                setIsDropdownOpen={setIsDropdownOpen} 
                dropdownRef={dropdownRef} 
                presetOptions={datePresets} 
                onPresetSelect={handlePresetSelect} 
                onStartChange={(e) => { setStartDate(e.target.value); setDatePreset('Custom'); }} 
                onEndChange={(e) => { setEndDate(e.target.value); setDatePreset('Custom'); }} 
                onCloseCustom={() => setDatePreset('All Time')} 
                
                // NEW PROPS PASSED HERE
                localPartners={localPartners}
                selectedPartnerId={selectedPartnerId}
                onPartnerChange={setSelectedPartnerId}
            />

            <div className="p-6 md:p-8 pt-0">
                <PulledOrdersTable 
                    data={reportData} 
                    isLoading={isLoading} 
                    onDownloadCSV={handleDownloadCSV} 
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
            
        </div>
    );
};

export default PulledOrdersPage;