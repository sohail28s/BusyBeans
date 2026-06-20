import React, { useState, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { SortableHeader } from '../../Shared/Table/SortableHeader'; 
import { TablePagination } from '../../Shared/Table/TablePagination'; 

export const EmployeeTable = ({ 
    data, 
    isLoading, 
    onStatusToggle, 
    onEditProfile, 
    onEditCommission, 
    onDelete, 
    onDownloadCSV 
}) => { 
    const navigate = useNavigate(); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [pagination, setPagination] = useState({ page: 1, limit: 10 }); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 

    // 1. Client-Side Search 
    const filteredData = useMemo(() => { 
        if (!data) return []; 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.name || '').toLowerCase().includes(q) || 
                (item.email || '').toLowerCase().includes(q) || 
                (item.phoneNumber || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    let baseData = useMemo(() => { 
        return filteredData.map((item, index) => ({ ...item, calculatedSL: index + 1 })); 
    }, [filteredData]); 

    // 2. Client-Side Sort Logic 
    const sortedData = useMemo(() => { 
        let displayData = [...baseData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            displayData.sort((a, b) => { 
                let aVal = a[sortConfig.key]; 
                let bVal = b[sortConfig.key]; 
                
                if (sortConfig.key === 'calculatedSL' || sortConfig.key === 'commissionPercentage') { 
                    aVal = parseFloat(aVal || 0); 
                    bVal = parseFloat(bVal || 0); 
                } else {
                    aVal = (aVal || '').toString().toLowerCase(); 
                    bVal = (bVal || '').toString().toLowerCase();
                }
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1; 
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1; 
                return 0; 
            }); 
        } 
        return displayData; 
    }, [baseData, sortConfig]); 

    const handleSort = (key) => { 
        let direction = 'asc'; 
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = 'default';
        }
        setSortConfig({ key, direction }); 
    }; 

    // 3. Slice for Pagination 
    const paginatedData = useMemo(() => { 
        const start = (pagination.page - 1) * pagination.limit; 
        return sortedData.slice(start, start + pagination.limit); 
    }, [sortedData, pagination.page, pagination.limit]); 

    // --- Pagination Adapter ---
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: sortedData.length
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
                        placeholder="Search by Name, Email, Phone..." 
                        value={searchQuery} 
                        onChange={(e) => { 
                            setSearchQuery(e.target.value); 
                            setPagination(p => ({ ...p, page: 1 })); 
                        }} 
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
                <table className="w-full text-left whitespace-nowrap border-collapse min-w-[1100px]"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr className="border-b border-[#e2e8f0]"> 
                            <SortableHeader label="SL" sortKey="calculatedSL" currentSort={sortConfig} onSort={handleSort} width="w-[8%]" align="text-left" /> 
                            <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} width="w-[20%]" align="text-left" /> 
                            <SortableHeader label="Email" sortKey="email" currentSort={sortConfig} onSort={handleSort} width="w-[22%]" align="text-left" /> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[15%]">Phone Number</th> 
                            <SortableHeader label="Commission %" sortKey="commissionPercentage" currentSort={sortConfig} onSort={handleSort} width="w-[15%]" align="text-left" /> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[10%]">Change Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[10%] text-left">Action</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan="7" className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading employees...</td></tr> 
                        ) : paginatedData.length > 0 ? ( 
                            paginatedData.map((emp) => ( 
                                <tr 
                                    key={emp.id} 
                                    className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[15px] cursor-default"
                                > 
                                    <td className="px-8 py-5 font-medium text-gray-900">{emp.calculatedSL}</td> 
                                    <td className="px-8 py-5 text-gray-900 truncate max-w-[200px]" title={emp.name}>{emp.name || '-'}</td> 
                                    <td className="px-8 py-5 truncate max-w-[250px]" title={emp.email}>{emp.email || '-'}</td> 
                                    <td className="px-8 py-5">
                                        {emp.countryCode ? `+${emp.countryCode} ` : ''}{emp.phoneNumber || '-'}
                                    </td> 
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2"> 
                                            <span>{parseFloat(emp.commissionPercentage || 0).toFixed(2)}%</span> 
                                            <button 
                                                onClick={() => onEditCommission(emp)} 
                                                className="text-[#86644c] hover:text-amber-900 text-sm font-medium underline outline-none" 
                                            > 
                                                Edit 
                                            </button> 
                                        </div>
                                    </td> 
                                    
                                    {/* Toggle Switch */}
                                    <td className="px-8 py-5"> 
                                        <label className="flex items-center gap-2 cursor-pointer"> 
                                            <div> 
                                                {emp.status ? (
                                                    <div className="w-max text-[12px] bg-[#86644c] text-white font-semibold py-1.5 px-3 rounded-md flex justify-center">Active</div>
                                                ) : (
                                                    <div className="w-max text-[12px] bg-[#EE4A4A14] text-[#EE4A4A] font-semibold py-1.5 px-3 rounded-md flex justify-center">Inactive</div>
                                                )}
                                            </div> 
                                            
                                            <div 
                                                className="react-switch" 
                                                style={{ position: 'relative', display: 'inline-block', textAlign: 'left', opacity: 1, direction: 'ltr', borderRadius: '14px', transition: 'opacity 0.25s', touchAction: 'none', userSelect: 'none' }}
                                                onClick={(e) => { e.preventDefault(); onStatusToggle(emp); }}
                                            >
                                                <div 
                                                    className="react-switch-bg" 
                                                    style={{ height: '28px', width: '56px', margin: '0px', position: 'relative', background: emp.status ? 'rgb(134, 100, 76)' : 'rgb(136, 136, 136)', borderRadius: '14px', cursor: 'pointer', transition: 'background 0.25s' }}
                                                ></div>
                                                <div 
                                                    className="react-switch-handle" 
                                                    style={{ height: '26px', width: '26px', background: 'rgb(255, 255, 255)', display: 'inline-block', cursor: 'pointer', borderRadius: '50%', position: 'absolute', transform: emp.status ? 'translateX(29px)' : 'translateX(1px)', top: '1px', outline: '0px', boxShadow: 'none', border: '0px', transition: 'background-color 0.25s, transform 0.25s, box-shadow 0.15s' }}
                                                ></div>
                                            </div>
                                        </label> 
                                    </td> 
                                    
                                    <td className="px-8 py-5"> 
                                        <div className="flex items-center gap-x-2"> 
                                            {/* View Button */}
                                            <button 
                                                onClick={() => navigate(`/employees/${emp.id}`, { state: { employeeData: emp } })} 
                                                className="border border-gray-400 rounded-md p-2 text-gray-600 hover:text-[#86644c] hover:border-[#86644c] transition-colors outline-none" 
                                                title="View details" 
                                            > 
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
                                                </svg>
                                            </button> 
                                            {/* Edit Button */}
                                            <button 
                                                onClick={() => onEditProfile(emp)} 
                                                className="border border-[#86644c] rounded-md p-2 text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors outline-none" 
                                                title="Edit" 
                                            > 
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
                                                </svg>
                                            </button> 
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => onDelete(emp)} 
                                                className="border border-red-400 rounded-md p-2 text-red-500 hover:bg-red-50 transition-colors outline-none" 
                                                title="Delete" 
                                            > 
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                </svg>
                                            </button> 
                                        </div> 
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan="7" className="text-center py-12 text-[#4b5563] text-[15px] italic">No employees found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            <TablePagination 
                pagination={adaptedPagination} 
                setPagination={handleSetPagination} 
            /> 
            
        </div> 
    ); 
};