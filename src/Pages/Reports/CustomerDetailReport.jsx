import React, { useState, useEffect, useRef } from 'react'; 
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import useStore from '../../Hooks/useStore'; 
import CustomerDetailTable from '../../ComponentsTemp/Home/Tables/CustomerDetailTable'; 
import ReportDateBar from '../../ComponentsTemp/Home/ReportDateBar'; 
import ReportHeader from '../../ComponentsTemp/Home/ReportHeader'; 
import CustomerSelector from '../../ComponentsTemp/Home/Modals/CustomerSelector'; 
import { exportToCSV } from '../../utils/csvHelper'; 

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


const CustomerDetailReport = () => { 
    const { id } = useParams(); 
    const [searchParams, setSearchParams] = useSearchParams(); 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
     const setShowProfile = useStore((state) => state.setShowProfile);
        const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    
    // URL DATES (Preset removed)
    const urlStartDate = searchParams.get('startDate'); 
    const urlEndDate = searchParams.get('endDate'); 
    
    // STATE 
    const [datePreset, setDatePreset] = useState('Current year'); 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false); 
    const dateDropdownRef = useRef(null); 
    
    // DATA STATE 
    const [customerList, setCustomerList] = useState([]); // For the dropdown 
    const [detailData, setDetailData] = useState([]); // For the table 
    const [searchTerm, setSearchTerm] = useState(''); 
    
    // DROPDOWN STATE 
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false); 
    const customerDropdownRef = useRef(null); 
    
    // useEffect(() => { 
    //     setTitle('Sales by Customer Details'); 
      
    // }, [setTitle]); 
    useEffect(() => { 
            setTitle("Sales by Customer Details"); 
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
    
    
    // --- UPDATED URL WRITER ---
    const updateUrlParams = (start, end, newId = id) => { 
        const params = new URLSearchParams(searchParams); 
        if (start) params.set('startDate', start); 
        if (end) params.set('endDate', end); 
        
        // Ensure preset is never in the URL
        params.delete('preset'); 
        
        // If they picked a new customer, we navigate to the new URL entirely! 
        if (newId !== id) { 
            navigate(`/reports/customer-detail/${newId}?${params.toString()}`); 
        } else { 
            setSearchParams(params, { replace: true }); 
        } 
    }; 
    
    const handlePresetSelect = (preset) => { 
        setIsDateDropdownOpen(false); 
        
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
    
    // FETCH CUSTOMER LIST FOR DROPDOWN 
    useEffect(() => { 
        if (!startDate || !endDate) return; 
        
        const fetchCustomerList = async () => { 
            try { 
                const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/customer-sales-report?startDate=${startDate}&endDate=${endDate}`; 
                const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                
                if (response.data.status === 'success') { 
                    const mappedList = response.data.data.map(item => ({ 
                        id: item.id || item.customerId, 
                        name: item.name, 
                        companyName: item.companyName 
                    })); 
                    setCustomerList(mappedList); 
                } 
            } catch (error) { 
                console.error("Error fetching customer list:", error); 
            } 
        }; 
        
        fetchCustomerList(); 
    }, [startDate, endDate]); 
    
    // FETCH SPECIFIC DETAILS FOR TABLE 
    useEffect(() => { 
        if (!id || !startDate || !endDate) return; 
        
        const fetchDetailReport = async () => { 
            setIsGlobalLoading(true); 
            try { 
                const apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/customer-detail-report/${id}?startDate=${startDate}&endDate=${endDate}`; 
                const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                
                if (response.data.status === 'success') { 
                    const formattedData = (response.data.data || []).map(item => ({ 
                        id: item.id, 
                        transactionDate: item.transactionDate, 
                        transactionType: item.transactionType, 
                        num: item.invoiceNumber, 
                        productName: item.productName, 
                        category: item.memo || item.categoryName || 'N/A', 
                        quantity: item.quantity || 0, 
                        amount: item.amount || 0 
                    })); 
                    setDetailData(formattedData); 
                } 
            } catch (error) { 
                console.error("Error fetching details:", error); 
            } finally { 
                setIsGlobalLoading(false); 
            } 
        }; 
        
        fetchDetailReport(); 
    }, [id, startDate, endDate, setIsGlobalLoading]); 
    
    // Click Outside logic for both dropdowns 
    useEffect(() => { 
        const handleClickOutside = (event) => { 
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) setIsDateDropdownOpen(false); 
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) setIsCustomerDropdownOpen(false); 
        }; 
        
        document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, []); 
    
    
    // THE CSV DOWNLOAD HANDLER FOR CUSTOMER DETAILS 
    const handleDownloadCSV = () => { 
        if (!detailData || detailData.length === 0) { 
            alert("No data available to download."); 
            return; 
        } 
        
        // Map the table data to clean Excel columns 
        const excelData = detailData.map(item => ({ 
            "Date": item.transactionDate ? new Date(item.transactionDate).toLocaleDateString() : 'N/A', 
            "Type": item.transactionType || 'Invoice', 
            "Invoice #": item.num || item.invoiceNumber, 
            "Product Name": item.productName || 'N/A', 
            "Category / Memo": item.category || 'N/A', 
            "Quantity": item.quantity || 0, 
            "Amount": `$${Number(item.amount || 0).toFixed(2)}` 
        })); 
        
        // Create a smart filename based on the customer's name and dates 
        const safeCustomerName = activeCustomer ? activeCustomer.name.replace(/\s+/g, '_') : 'Customer'; 
        const filename = `${safeCustomerName}_Details_${startDate}_to_${endDate}.csv`; 
        
        // Trigger the global engine! 
        exportToCSV(excelData, filename); 
    }; 
    
    // ========================================== 
    // THE SEARCH FILTER FOR DETAILS 
    // ========================================== 
    const filteredData = detailData.filter((row) => { 
        if (!searchTerm) return true; 
        const lowerSearch = searchTerm.toLowerCase(); 
        
        // Searches Date, Type, Invoice #, Product Name, and Amount instantly! 
        return Object.values(row).some((value) => String(value).toLowerCase().includes(lowerSearch) ); 
    }); 
    
    // Find the currently selected customer object from the list to display in the UI 
    const activeCustomer = customerList.find(c => String(c.id) === String(id)); 
    
    return ( 
        <div className="w-full flex flex-col h-full bg-[#f8fafc]"> 
            {/* 1. DATE BAR */} 
            <ReportDateBar 
                onBackClick={() => navigate(-1)} 
                startDate={startDate} 
                endDate={endDate} 
                datePreset={datePreset} 
                isDropdownOpen={isDateDropdownOpen} 
                setIsDropdownOpen={setIsDateDropdownOpen} 
                dropdownRef={dateDropdownRef} 
                presetOptions={['All Time', 'Current year', 'Current Month', 'Current Week', 'Last Year', 'Last 90 days', 'Last Month', 'Month to date', 'Last week', 'Custom']} 
                onPresetSelect={handlePresetSelect} 
                onStartChange={(e) => updateUrlParams(e.target.value, endDate)} 
                onEndChange={(e) => updateUrlParams(startDate, e.target.value)} 
                onCloseCustom={() => handlePresetSelect('Current year')} 
            /> 
            
            <div className="p-6 flex-1 flex justify-center"> 
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 "> 
                    <CustomerSelector 
                        customerList={customerList} 
                        activeCustomer={activeCustomer} 
                        onSelect={(customer) => { 
                            if (customer) { 
                                updateUrlParams(startDate, endDate, customer.id); 
                            } 
                        }} 
                    /> 
                    
                    <ReportHeader 
                        title="Sales by Customer Details" 
                        subtitle={activeCustomer ? activeCustomer.companyName : "Loading..."} 
                        dateRange={new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        showFilterButton={false} 
                        onDownloadClick={handleDownloadCSV} 
                    /> 
                    
                    <CustomerDetailTable data={filteredData} /> 
                </div> 
            </div> 
        </div> 
    ); 
}; 

export default CustomerDetailReport;