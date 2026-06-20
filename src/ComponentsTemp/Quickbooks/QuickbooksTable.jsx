import React, { useState, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader'; 
import { TablePagination } from '../../Components/Shared/Table/TablePagination'; 
import { CustomCheckbox } from '../../Components/Shared/Table/CustomCheckbox'; 

export const QuickbooksTable = ({ viewMode, data, isLoading, pagination, setPagination, selectedIds, setSelectedIds, onDownloadCSV }) => { 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 
    const navigate = useNavigate(); 

    // 1. Client-Side Search 
    const filteredData = useMemo(() => { 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.companyName || item.name || '').toLowerCase().includes(q) || 
                (item.name || '').toLowerCase().includes(q) || 
                (item.employee || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    // 2. Client-Side Sort 
    const sortedData = useMemo(() => { 
        let sortableItems = [...filteredData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            sortableItems.sort((a, b) => { 
                let aVal = a[sortConfig.key] || ''; 
                let bVal = b[sortConfig.key] || ''; 
                if (typeof aVal === 'string') aVal = aVal.toLowerCase(); 
                if (typeof bVal === 'string') bVal = bVal.toLowerCase(); 
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1; 
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1; 
                return 0; 
            }); 
        } 
        return sortableItems; 
    }, [filteredData, sortConfig]); 

    const handleSort = (key) => { 
        let direction = 'asc'; 
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; 
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default'; 
        setSortConfig({ key, direction }); 
    }; 

    // --- Dynamic Checkbox Logic (Unregistered View Only) --- 
    const displayedIds = useMemo(() => sortedData.map(item => item.id), [sortedData]); 
    const isAllSelected = displayedIds.length > 0 && displayedIds.every(id => selectedIds.includes(id)); 

    const handleSelectAll = (e) => { 
        if (isAllSelected) { 
            setSelectedIds(prev => prev.filter(id => !displayedIds.includes(id))); 
        } else { 
            setSelectedIds(prev => [...new Set([...prev, ...displayedIds])]); 
        } 
    }; 

    const handleRowSelect = (id) => { 
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id] ); 
    }; 

    // --- Pagination Adapter ---
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.totalItems || pagination.total || 0
    };

    const handleSetPagination = (updater) => {
        const nextState = typeof updater === 'function' ? updater(adaptedPagination) : updater;
        setPagination({ page: nextState.page, limit: nextState.limit });
    };

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans"> 
            
            {/* Table Toolbar */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                <div className="relative"> 
                    <input 
                        placeholder="Search by Name, Main Contact, Employee..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg pl-10 pr-5 outline-none placeholder:font-sans placeholder:font-medium focus:bg-gray-200 transition-colors text-[14px] text-gray-700" 
                        type="search" 
                    /> 
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute top-3 md:top-3.5 left-3 text-gray-900" height="20" width="20">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </div> 
                
                <button 
                    onClick={onDownloadCSV} 
                    disabled={isLoading || data.length === 0} 
                    className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                > 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                        <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                    </svg>
                    <span className="group-hover:text-black text-white font-sans font-medium transition-colors">Download CSV</span> 
                </button> 
            </div> 

            {/* Table Area */} 
            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left min-w-[1000px] border-collapse"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr className="border-b border-[#e2e8f0]"> 
                            {/* Only show checkbox column if unregistered */} 
                            {viewMode === 'unregistered' && ( 
                                <th className="w-12 px-4 py-5 text-center"> 
                                    <div className="flex justify-center items-center w-full h-full">
                                        <CustomCheckbox 
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </div>
                                </th> 
                            )} 
                            
                            <SortableHeader label="Name" sortKey="companyName" currentSort={sortConfig} onSort={handleSort} width="w-[25%]" /> 
                            <SortableHeader label="Main Contact" sortKey="name" currentSort={sortConfig} onSort={handleSort} width="w-[25%]" /> 
                            <SortableHeader label="Employee" sortKey="employee" currentSort={sortConfig} onSort={handleSort} width="w-[20%]" /> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[15%] whitespace-nowrap">Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[15%] whitespace-nowrap">Last Order</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan={viewMode === 'unregistered' ? 6 : 5} className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading customers...</td></tr> 
                        ) : sortedData.length > 0 ? ( 
                            sortedData.map((cust) => ( 
                                <tr 
                                    key={cust.id} 
                                    onClick={() => navigate(`/customers/${cust.id}`, { state: { customerData: cust } })} 
                                    className="transition-colors text-[#4b5563] text-[15px] hover:bg-gray-50 cursor-pointer" 
                                > 
                                    {viewMode === 'unregistered' && ( 
                                        <td className="w-12 px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}> 
                                            <div className="flex justify-center items-center w-full h-full">
                                                <CustomCheckbox 
                                                    checked={selectedIds.includes(cust.id)}
                                                    onChange={() => handleRowSelect(cust.id)}
                                                />
                                            </div>
                                        </td> 
                                    )} 
                                    
                                    <td className="px-8 py-5 text-gray-900 whitespace-nowrap truncate max-w-[200px]" title={cust.companyName || cust.name}>{cust.companyName || cust.name || '-'}</td> 
                                    <td className="px-8 py-5 text-gray-900 whitespace-nowrap truncate max-w-[200px]" title={cust.name}>{cust.name || '-'}</td> 
                                    
                                    <td className="px-8 py-5 whitespace-nowrap"> 
                                        {cust.employee ? ( 
                                            <span className="text-gray-900">{cust.employee}</span> 
                                        ) : ( 
                                            <span className="bg-[#EE4A4A14] text-[#EE4A4A] px-3 py-1.5 rounded-md text-[12px] font-semibold flex justify-center w-max"> 
                                                Not Assigned 
                                            </span> 
                                        )} 
                                    </td> 
                                    
                                    <td className="px-8 py-5 whitespace-nowrap"> 
                                        {cust.status ? ( 
                                            <span className="bg-[#2f9e54] text-white px-3 py-1.5 rounded-md text-[12px] font-semibold flex justify-center w-24"> 
                                                Active 
                                            </span> 
                                        ) : ( 
                                            <span className="bg-[#EE4A4A] text-white px-3 py-1.5 rounded-md text-[12px] font-semibold flex justify-center w-24"> 
                                                Inactive 
                                            </span> 
                                        )} 
                                    </td> 
                                    
                                    <td className="px-8 py-5 text-gray-900 whitespace-nowrap">Last order</td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan={viewMode === 'unregistered' ? 6 : 5} className="text-center py-12 text-[#4b5563] text-[15px] italic">No customers found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* Global Pagination */} 
            <TablePagination 
                pagination={adaptedPagination} 
                setPagination={handleSetPagination} 
            /> 
            
        </div> 
    ); 
};