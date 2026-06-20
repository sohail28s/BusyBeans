import React, { useState, useEffect, useRef } from 'react'; 
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import useStore from '../../Hooks/useStore'; 
import ReportDateBar from '../../ComponentsTemp/Home/ReportDateBar'; 
import ReportHeader from '../../ComponentsTemp/Home/ReportHeader'; 
import ProductCategoryTable from '../../ComponentsTemp/Home/Tables/ProductCategoryTable'; 
import FilterModal from '../../ComponentsTemp/Home/Modals/FilterModal'; 
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

const ProductReports = () => { 
    const [searchParams, setSearchParams] = useSearchParams(); 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
     const setShowProfile = useStore((state) => state.setShowProfile);

    // URL FILTERS 
    const role = searchParams.get('role'); 
    const salesRepIds = searchParams.get('salesRepId'); 
    const employeeIds = searchParams.get('employeeId'); 
    const filterNames = searchParams.get('filterNames'); 
    
    // URL PRODUCT ID 
    const productId = searchParams.get('productId'); 
    
    // URL DATES (Preset removed)
    const urlStartDate = searchParams.get('startDate'); 
    const urlEndDate = searchParams.get('endDate'); 
    
    const [datePreset, setDatePreset] = useState('Month to date'); 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false); 
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); 
    const dateDropdownRef = useRef(null); 
    
    const [reportData, setReportData] = useState([]); 
    const [grandTotal, setGrandTotal] = useState(0); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [activeProductName, setActiveProductName] = useState(''); 
    
     useEffect(() => {
            setTitle('Sales by Product/Category Summary');
            setShowProfile(false);
            return () => setTitle('');
            setShowProfile(true);
        }, [setTitle,setShowProfile]);
   
    useEffect(() => { 
        if (urlStartDate && urlEndDate) { 
            // Check if the URL dates match a preset
            const matchedPreset = getPresetForDates(urlStartDate, urlEndDate);
            setDatePreset(matchedPreset); 
            setStartDate(urlStartDate); 
            setEndDate(urlEndDate); 
        } else { 
            handlePresetSelect('Month to date'); 
        } 
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [urlStartDate, urlEndDate]); 
    
    // --- UPDATED URL WRITER ---
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
        } else if (type === 'Local Partner' && entitiesArray && entitiesArray.length > 0) { 
            params.set('role', 'local_partner'); 
            params.set('salesRepId', entitiesArray.map(e => e.id).join(',')); 
            params.set('filterNames', entitiesArray.map(e => e.srName).join(', ')); 
        } else if (type === 'Employee' && entitiesArray && entitiesArray.length > 0) { 
            params.set('role', 'employee'); 
            params.set('employeeId', entitiesArray.map(e => e.id).join(',')); 
            params.set('filterNames', entitiesArray.map(e => e.name).join(', ')); 
        } 
        
        setSearchParams(params, { replace: true }); 
        setIsFilterModalOpen(false); 
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
    
    // THE MAGIC API FETCH 
    useEffect(() => { 
        if (!startDate || !endDate) return; 
        
        const fetchProductReport = async () => { 
            setIsGlobalLoading(true); 
            try { 
                let apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/admin-reports/category-wise-product-sales-report?startDate=${startDate}&endDate=${endDate}`; 
                if (role === 'admin') apiUrl += `&role=admin`; 
                if (salesRepIds) apiUrl += `&salesRepId=${salesRepIds}`; 
                if (employeeIds) apiUrl += `&employeeId=${employeeIds}`; 
                
                const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                
                if (response.data.status === 'success') { 
                    let rawData = response.data.data || []; 
                    
                    // 1. IF WE HAVE A PRODUCT ID, FILTER THE DATA! 
                    if (productId) { 
                        const targetId = parseInt(productId); 
                        let foundCategory = null; 
                        let foundItem = null; 
                        
                        for (const cat of rawData) { 
                            const item = cat.items.find(i => parseInt(i.productId || i.id) === targetId); 
                            if (item) { 
                                foundCategory = { ...cat }; // Copy the category 
                                foundItem = item; // Save the item 
                                break; 
                            } 
                        } 
                        
                        if (foundCategory && foundItem) { 
                            foundCategory.items = [foundItem]; // Strip out all other products! 
                            rawData = [foundCategory]; // Strip out all other categories! 
                            setActiveProductName(foundItem.productName); // Save name for the header 
                        } else { 
                            rawData = []; // Product not found in this date range 
                            setActiveProductName(''); 
                        } 
                    } else { 
                        setActiveProductName(''); 
                    } 
                    
                    // 2. DO THE MATH 
                    let absoluteTotalAmount = 0; 
                    rawData.forEach(category => category.items.forEach(item => { 
                        absoluteTotalAmount += (item.amount || 0); 
                    })); 
                    
                    setGrandTotal(absoluteTotalAmount); 
                    
                    const processedData = rawData.map(category => { 
                        let catQty = 0, catAmount = 0, catCogs = 0; 
                        
                        category.items.forEach(item => { 
                            catQty += (item.quantity || 0); 
                            catAmount += (item.amount || 0); 
                            catCogs += (item.costOfGoodsSold || 0); 
                        }); 
                        
                        const catGrossMargin = catAmount - catCogs; 
                        
                        return { 
                            ...category, 
                            totals: { 
                                quantity: catQty, 
                                amount: catAmount, 
                                cogs: catCogs, 
                                grossMargin: catGrossMargin, 
                                avgPrice: catQty > 0 ? (catAmount / catQty) : 0, 
                                grossMarginPercent: catAmount > 0 ? (catGrossMargin / catAmount) * 100 : 0, 
                                percentOfSales: absoluteTotalAmount > 0 ? (catAmount / absoluteTotalAmount) * 100 : 0 
                            } 
                        }; 
                    }); 
                    
                    setReportData(processedData); 
                } 
            } catch (error) { 
                console.error("Error fetching product report:", error); 
            } finally { 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchProductReport(); 
    }, [startDate, endDate, role, salesRepIds, employeeIds, productId, setIsGlobalLoading]); 
    
    const filteredData = reportData.filter(category => { 
        if (category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())) return true; 
        const matchingItems = category.items.filter(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase())); 
        return matchingItems.length > 0; 
    }); 
    
    const getInitialEntities = () => { 
        if (!filterNames) return []; 
        const ids = (salesRepIds || employeeIds || '').split(','); 
        const names = filterNames.split(', '); 
        return ids.map((id, index) => ({ id: parseInt(id), name: names[index], srName: names[index] })); 
    }; 
    
    const handleDownloadCSV = () => { 
        const toCurr = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; 
        const toPct = (val) => `${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`; 
        
        let excelData = []; 
        
        if (!filteredData || filteredData.length === 0) { 
            alert("No data available to download."); 
            return; 
        } 
        
        filteredData.forEach(category => { 
            excelData.push({ 
                "Product / Category": `TOTAL: ${category.categoryName}`, 
                "Quantity": category.totals.quantity, 
                "Amount": toCurr(category.totals.amount), 
                "% of Sales": toPct(category.totals.percentOfSales), 
                "Avg Price": toCurr(category.totals.avgPrice), 
                "COGS": toCurr(category.totals.cogs), 
                "Gross Margin": toCurr(category.totals.grossMargin), 
                "Gross Margin %": toPct(category.totals.grossMarginPercent) 
            }); 
            
            category.items.forEach(item => { 
                const margin = (item.amount || 0) - (item.costOfGoodsSold || 0); 
                excelData.push({ 
                    "Product / Category": ` - ${item.productName}`, 
                    "Quantity": item.quantity || 0, 
                    "Amount": toCurr(item.amount), 
                    "% of Sales": toPct(((item.amount || 0) / grandTotal) * 100), 
                    "Avg Price": toCurr((item.amount || 0) / (item.quantity || 1)), 
                    "COGS": toCurr(item.costOfGoodsSold), 
                    "Gross Margin": toCurr(margin), 
                    "Gross Margin %": toPct((margin / (item.amount || 1)) * 100) 
                }); 
            }); 
        }); 
        
        const filename = productId ? `${activeProductName ? activeProductName.replace(/\s+/g, '_') : 'Product'}_${startDate}_to_${endDate}.csv` : `Product_Category_Summary_${startDate}_to_${endDate}.csv`; 
        exportToCSV(excelData, filename); 
    }; 
    
    return ( 
        <div className="w-full flex flex-col h-full bg-[#f8fafc]"> 
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
                activeRole={role} 
            /> 
            
            <div className="p-6 flex-1 flex justify-center"> 
                <div className="w-full max-w-[1200px] bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8"> 
                    <ReportHeader 
                        title={"Sales by Product/Category Summary"} 
                        subtitle="BUSY BEAN COFFEE, INC" 
                        dateRange={`${startDate} to ${endDate}`} 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        onFilterClick={() => setIsFilterModalOpen(true)} 
                        onDownloadClick={handleDownloadCSV} 
                        showFilterButton={true} 
                    /> 
                    <ProductCategoryTable data={filteredData} grandTotalAmount={grandTotal} /> 
                </div> 
            </div> 
            
            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)} 
                onApply={handleApplyFilters} 
                initialType={role === 'admin' ? 'Admin' : role === 'local_partner' ? 'Local Partner' : role === 'employee' ? 'Employee' : 'All'} 
                initialEntities={getInitialEntities()} 
                showEmployees={false} 
                multiSelect={true} 
            /> 
        </div> 
    ); 
}; 

export default ProductReports;