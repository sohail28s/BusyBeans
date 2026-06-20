import React, { useState, useEffect, useRef } from 'react'; 
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import useStore from '../../Hooks/useStore'; 
import { exportToCSV } from '../../utils/csvHelper'; 
import ReportDateBar from '../../ComponentsTemp/Home/ReportDateBar'; 
import ReportHeader from '../../ComponentsTemp/Home/ReportHeader'; 
import ReportTable from '../../ComponentsTemp/Home/Tables/ReportTable'; 
import FilterModal from '../../ComponentsTemp/Home/Modals/FilterModal'; 

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

const CustomerReports = () => { 
    const [searchParams, setSearchParams] = useSearchParams(); 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
     const setShowProfile = useStore((state) => state.setShowProfile);
    
    const customerId = searchParams.get('customerId'); 
    const role = searchParams.get('role'); 
    const salesRepIds = searchParams.get('salesRepId'); 
    const employeeIds = searchParams.get('employeeId'); 
    const filterNames = searchParams.get('filterNames'); 
    
    // URL DATES (Preset removed)
    const urlStartDate = searchParams.get('startDate'); 
    const urlEndDate = searchParams.get('endDate'); 
    
    // STATE 
    const [datePreset, setDatePreset] = useState('Current year'); 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(""); 
    const [reportData, setReportData] = useState([]); 
    
    const dropdownRef = useRef(null); 
    
    useEffect(() => { 
               setTitle("Sales by Customer Summary"); 
               setShowProfile(false); 
               return () => { 
                   setShowProfile(true); 
               }; 
           }, [ setTitle , setShowProfile]); 
    
    // --- UPDATED URL LISTENER ---
    useEffect(() => { 
        if (urlStartDate && urlEndDate) { 
            // Check if the URL dates match a preset
            const matchedPreset = getPresetForDates(urlStartDate, urlEndDate);
            setDatePreset(matchedPreset); 
            setStartDate(urlStartDate); 
            setEndDate(urlEndDate); 
        } else { 
            handlePresetSelect('Current year'); 
        } 
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [urlStartDate, urlEndDate]); 
    
    // --- UPDATED URL PARAM WRITER ---
    const updateUrlParams = (start, end) => { 
        const params = new URLSearchParams(searchParams); 
        if (start) params.set('startDate', start); 
        if (end) params.set('endDate', end); 
        
        // Ensure preset is never in the URL
        params.delete('preset'); 
        setSearchParams(params, { replace: true }); 
    }; 
    
    const handleApplyFilters = (type, entitiesArray) => { 
        const params = new URLSearchParams(searchParams); 
        params.delete('role'); 
        params.delete('salesRepId'); 
        params.delete('employeeId'); 
        params.delete('filterNames'); 
        
        if (type === 'Admin') { 
            params.set('role', 'admin'); 
        } else if (type === 'Local Partner' && entitiesArray.length > 0) { 
            params.set('role', 'local_partner'); 
            params.set('salesRepId', entitiesArray.map(e => e.id).join(',')); 
            params.set('filterNames', entitiesArray.map(e => e.srName).join(', ')); 
        } else if (type === 'Employee' && entitiesArray.length > 0) { 
            params.set('role', 'employee'); 
            params.set('employeeId', entitiesArray.map(e => e.id).join(',')); 
            params.set('filterNames', entitiesArray.map(e => e.name).join(', ')); 
        } 
        
        setSearchParams(params, { replace: true }); 
        setIsFilterModalOpen(false); 
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
            // State updates naturally happen via the URL listener above, 
            // but we trigger the URL change here.
            updateUrlParams(start, end); 
        } 
    }; 
    
    // API FETCH 
    useEffect(() => { 
        if (!startDate || !endDate) return; 
        const fetchReport = async () => { 
            setIsGlobalLoading(true); 
            try { 
                let apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/customer-sales-report?startDate=${startDate}&endDate=${endDate}`; 
                if (role === 'admin') apiUrl += `&role=admin`; 
                if (salesRepIds) apiUrl += `&salesRepId=${salesRepIds}`; 
                if (employeeIds) apiUrl += `&employeeId=${employeeIds}`; 
                if (customerId) apiUrl += `&customerId=${customerId}`; 
                
                const res = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                
                if (res.data.status === 'success') { 
                    setReportData((res.data.data || []).map(item => ({ 
                        id: item.customerId || item.id, 
                        name: item.companyName || item.name || 'Unknown', 
                        value: item.totatSpent || 0 
                    }))); 
                } 
            } catch (error) { 
                console.error(error); 
            } finally { 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchReport(); 
    }, [startDate, endDate, customerId, salesRepIds, employeeIds, role, setIsGlobalLoading]); 
    
    const getInitialEntities = () => { 
        if (!filterNames) return []; 
        const ids = (salesRepIds || employeeIds || '').split(','); 
        const names = filterNames.split(', '); 
        return ids.map((id, index) => ({ id: parseInt(id), name: names[index], srName: names[index] })); 
    }; 
    
    // THE SEARCH FILTER 
    const filteredData = reportData.filter((row) => { 
        if (!searchTerm) return true; 
        const lowerSearch = searchTerm.toLowerCase(); 
        return Object.values(row).some((value) => String(value).toLowerCase().includes(lowerSearch) ); 
    }); 
    
    // THE CSV DOWNLOAD HANDLER 
    const handleDownload = () => { 
        if (!filteredData || filteredData.length === 0) { 
            alert("No data available to download."); 
            return; 
        } 
        const excelData = filteredData.map(item => ({ "Company Name": item.name, "Total Spent": `$${Number(item.value || 0).toFixed(2)}` })); 
        exportToCSV(excelData, `Customer_Summary_${startDate}_to_${endDate}.csv`); 
    }; 
    
    return ( 
        <div className="w-full flex flex-col h-full bg-white "> 
            <ReportDateBar 
                onBackClick={() => navigate(-1)} 
                startDate={startDate} 
                endDate={endDate} 
                datePreset={datePreset} 
                isDropdownOpen={isDropdownOpen} 
                setIsDropdownOpen={setIsDropdownOpen} 
                dropdownRef={dropdownRef} 
                presetOptions={['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom']} 
                onPresetSelect={handlePresetSelect} 
                onStartChange={(e) => updateUrlParams(e.target.value, endDate)} 
                onEndChange={(e) => updateUrlParams(startDate, e.target.value)} 
                onCloseCustom={() => handlePresetSelect('Current year')} 
                activeRole={role} 
                filterNames={filterNames} 
            /> 
            
            {/* REPORT CONTENT AREA */} 
            <div className="p-6 flex-1 flex justify-center"> 
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:px-8 py-6"> 
                    <ReportHeader 
                        title="Sales by Customer Summary" 
                        subtitle="BUSY BEAN COFFEE, INC" 
                        dateRange={`${startDate} to ${endDate}`} 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        onFilterClick={() => setIsFilterModalOpen(true)} 
                        showFilterButton={true} 
                        onDownloadClick={handleDownload} 
                    /> 
                    <ReportTable 
                        columns={[ { header: 'Company Name', accessor: 'name' }, { header: 'Total', accessor: 'value', isNumeric: true } ]} 
                        data={filteredData} 
                        totalValueKey="value" 
                        searchTerm={searchTerm} 
                        onRowClick={(row) => navigate(`/reports/customer-detail/${row.id}?startDate=${startDate}&endDate=${endDate}`)} 
                    /> 
                </div> 
            </div> 
            
            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)} 
                onApply={handleApplyFilters} 
                initialType={role === 'admin' ? 'Admin' : role === 'local_partner' ? 'Local Partner' : role === 'employee' ? 'Employee' : 'All'} 
                initialEntities={getInitialEntities()} 
                showEmployees={true} 
                multiSelect={true} 
            /> 
        </div> 
    ); 
}; 

export default CustomerReports;



