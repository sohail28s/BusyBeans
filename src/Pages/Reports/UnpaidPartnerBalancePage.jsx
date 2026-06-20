import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import { exportToCSV } from '../../utils/csvHelper';
import ReportDateBar from '../../ComponentsTemp/Home/ReportDateBar'; 
import { UnpaidPartnerBalanceTable } from '../../ComponentsTemp/ReportsManagement/UnpaidPartnerBalanceTable'; // Adjust path if needed

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

export const UnpaidPartnerBalancePage = () => {
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    // Data State
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [partnerType, setPartnerType] = useState('dropship-partner'); // Toggle State

    // Date Range State
    const datePresets = ['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom'];
    const [datePreset, setDatePreset] = useState('All Time');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --- Header Setup ---
    useEffect(() => {
        setTitle('Unpaid Partner Balance Report');
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

    // --- Data Fetching ---
    const fetchReportData = useCallback(async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        setIsGlobalLoading(true);

        try {
            const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/unpaid-partner-balance?partnerType=${partnerType}&startDate=${startDate}&endDate=${endDate}`;
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
    }, [startDate, endDate, partnerType, setIsGlobalLoading]);

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

        const isDirect = partnerType === 'direct-partner';

        const csvFormatted = filteredData.map((item, index) => {
            if (isDirect) {
                return {
                    "SL": index + 1,
                    "Local Partner": item.srName || "-",
                    "Outstanding Balance": item.totalOutstanding ? `$${item.totalOutstanding.toFixed(2)}` : "$0.00",
                    "Orders on credit": item.totalOrdersOnCredit || 0,
                    "Partner Orders": item.parsedSelfOrdCred || 0,
                    "Customer Order": item.parsedOrdCred || 0,
                    "Credit on Partner Orders": item.parsedSelfOutBal ? `$${item.parsedSelfOutBal.toFixed(2)}` : "$0.00",
                    "Credit on Customer Orders": item.parsedOutBal ? `$${item.parsedOutBal.toFixed(2)}` : "$0.00"
                };
            } else {
                return {
                    "SL": index + 1,
                    "Type": item.partnerType || "-",
                    "Local Partner": item.srName || "-",
                    "Outstanding Balance": item.parsedOutBal ? `$${item.parsedOutBal.toFixed(2)}` : "$0.00",
                    "Orders on credit": item.parsedOrdCred || 0
                };
            }
        });

        exportToCSV(csvFormatted, `Unpaid_${isDirect ? 'Direct' : 'Dropship'}_Balance_${startDate}_to_${endDate}.csv`);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans">
            
            {/* Wrapper putting Toggle & Date Bar in Flex Row */}
            <div className="flex flex-col xl:flex-row xl:items-center w-full bg-white relative">
                
                {/* The Custom Switch Container (Using EXACT HTML Classes requested) */}
                <div className="pl-6 pt-5 pb-2 xl:pt-0 xl:pb-0 xl:absolute xl:left-[60px] z-10 flex items-center shrink-0">
                    <div className="flex items-center">
                        <div 
                            onClick={() => setPartnerType('dropship-partner')}
                            className={`py-4 px-10 cursor-pointer font-semibold text-center border-y border-l transition-colors ${
                                partnerType === 'dropship-partner' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Drop Ship
                        </div>
                        <div 
                            onClick={() => setPartnerType('direct-partner')}
                            className={`py-4 px-10 cursor-pointer font-semibold text-center border transition-colors ${
                                partnerType === 'direct-partner' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Direct
                        </div>
                    </div>
                </div>

                {/* The Shared ReportDateBar */}
                <div className="flex-1 w-full pl-0 xl:pl-[380px]">
                    <ReportDateBar 
                        onBackClick={() => navigate(-1)} 
                        showBackButton={false}
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
                </div>

            </div>

            {/* Table Area */}
            <div className="p-6 md:p-8 pt-0 mt-4 xl:mt-0">
                <UnpaidPartnerBalanceTable 
                    data={reportData} 
                    isLoading={isLoading} 
                    onDownloadCSV={handleDownloadCSV} 
                    partnerType={partnerType}
                />
            </div>
            
        </div>
    );
};

export default UnpaidPartnerBalancePage;