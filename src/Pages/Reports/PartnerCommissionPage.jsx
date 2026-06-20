import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import { exportToCSV } from '../../utils/csvHelper';
import ReportDateBar from '../../ComponentsTemp/Home/ReportDateBar'; 
import { PartnerCommissionTable } from '../../ComponentsTemp/ReportsManagement/PartnerCommissionTable'; 

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

export const PartnerCommissionPage = () => {
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
     const setShowProfile = useStore((state) => state.setShowProfile);

    // Data State
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Date Range State
    const datePresets = ['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom'];
    const [datePreset, setDatePreset] = useState('All Time');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --- Header Setup ---
    useEffect(() => {
        setTitle('Partner Profits Report');

        setShowProfile(false);
        setActions(null);
        return () => setTitle('');
        setShowProfile(true);
    }, [setTitle, setActions,setShowProfile]);

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

    // --- Data Fetching ---
    const fetchReportData = useCallback(async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        setIsGlobalLoading(true);

        try {
            const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/partner-commission?startDate=${startDate}&endDate=${endDate}`;
            const res = await axios.get(apiUrl, getAuthConfig());

            if (res.data?.status === 'success') {
                setReportData(res.data.data || []);
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
    }, [startDate, endDate, setIsGlobalLoading]);

    // Fetch data whenever the resolved dates change
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

        const csvFormatted = filteredData.map((item, index) => ({
            "SL": index + 1,
            "Local Partner": item.srName || "-",
            "Orders Placed": item.ordersPlaced ? `$${item.ordersPlaced.toFixed(2)}` : "$0.00",
            "Total Sales": item.totalSales ? `$${item.totalSales.toFixed(2)}` : "$0.00",
            "Whole Sale Price Cost": item.wholesalePriceCost ? `$${item.wholesalePriceCost.toFixed(2)}` : "$0.00",
            "Total Partner Profits": item.totalCommission ? `$${item.totalCommission.toFixed(2)}` : "$0.00"
        }));

        exportToCSV(csvFormatted, `Partner_Profits_Report_${startDate}_to_${endDate}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans">
            
            {/* Shared Date Bar Component */}
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
            />

            {/* Main Content Area */}
            <div className="p-6 md:p-8 pt-0">
                <PartnerCommissionTable 
                    data={reportData} 
                    isLoading={isLoading} 
                    onDownloadCSV={handleDownloadCSV} 
                />
            </div>
            
        </div>
    );
};

export default PartnerCommissionPage;