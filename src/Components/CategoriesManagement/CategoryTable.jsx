import React, { useState, useMemo } from 'react'; 
import { SortableHeader } from '../Shared/Table/SortableHeader'; 
import { TablePagination } from '../Shared/Table/TablePagination'; // Global Pagination

export const CategoryTable = ({ data, isLoading, onEdit, onDelete, onStatusToggle, onDownloadCSV }) => { 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [pagination, setPagination] = useState({ page: 1, limit: 10 }); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 

    // 1. Client-Side Search 
    const filteredData = useMemo(() => { 
        if (!data) return []; 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            return (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()); 
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
                if (sortConfig.key === 'calculatedSL' || sortConfig.key === 'numberOfProducts') { 
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
                        placeholder="Search ..." 
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
                {/* Applied global alignment and removed outer borders as per ref structure */}
                <table className="w-full text-center whitespace-nowrap border-collapse min-w-[900px]"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr className="border-b border-[#e2e8f0]"> 
                            <SortableHeader label="SL" sortKey="calculatedSL" currentSort={sortConfig} onSort={handleSort} width="w-[10%]" align="text-center" /> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[30%]">Name</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[20%] text-center">No. of products</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[20%] text-center">Change Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[20%] text-center">Action</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan="5" className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading categories...</td></tr> 
                        ) : paginatedData.length > 0 ? ( 
                            paginatedData.map((cat) => ( 
                                <tr 
                                    key={cat.id} 
                                    className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[15px] cursor-default"
                                > 
                                    <td className="px-8 py-5 font-medium text-gray-900">{cat.calculatedSL}</td> 
                                    <td className="px-8 py-5 text-gray-900 truncate" title={cat.name}>{cat.name}</td> 
                                    <td className="px-8 py-5">{cat.numberOfProducts || 0}</td> 
                                    
                                    <td className="px-8 py-5"> 
                                        <label className="flex items-center justify-center gap-2 cursor-pointer"> 
                                            <div> 
                                                {cat.status ? (
                                                    <div className="w-max text-[12px] bg-[#86644c] text-white font-semibold py-1.5 px-3 rounded-md flex justify-center">Active</div>
                                                ) : (
                                                    <div className="w-max text-[12px] bg-[#EE4A4A14] text-[#EE4A4A] font-semibold py-1.5 px-3 rounded-md flex justify-center">Inactive</div>
                                                )}
                                            </div> 
                                            
                                            {/* Exact ref toggle switch */}
                                            <div 
                                                className="react-switch" 
                                                style={{ position: 'relative', display: 'inline-block', textAlign: 'left', opacity: 1, direction: 'ltr', borderRadius: '14px', transition: 'opacity 0.25s', touchAction: 'none', userSelect: 'none' }}
                                                onClick={(e) => { e.preventDefault(); onStatusToggle(cat); }}
                                            >
                                                <div 
                                                    className="react-switch-bg" 
                                                    style={{ height: '28px', width: '56px', margin: '0px', position: 'relative', background: cat.status ? 'rgb(134, 100, 76)' : 'rgb(136, 136, 136)', borderRadius: '14px', cursor: 'pointer', transition: 'background 0.25s' }}
                                                ></div>
                                                <div 
                                                    className="react-switch-handle" 
                                                    style={{ height: '26px', width: '26px', background: 'rgb(255, 255, 255)', display: 'inline-block', cursor: 'pointer', borderRadius: '50%', position: 'absolute', transform: cat.status ? 'translateX(29px)' : 'translateX(1px)', top: '1px', outline: '0px', boxShadow: 'none', border: '0px', transition: 'background-color 0.25s, transform 0.25s, box-shadow 0.15s' }}
                                                ></div>
                                            </div>
                                        </label> 
                                    </td> 
                                    
                                    <td className="px-8 py-5 text-center"> 
                                        <div className="flex items-center justify-center gap-x-2"> 
                                            {/* Exact ref Edit Button */}
                                            <button 
                                                onClick={() => onEdit(cat)} 
                                                className="border border-[#86644c] rounded-md p-2 text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors outline-none" 
                                                title="Edit" 
                                            > 
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
                                                </svg>
                                            </button> 
                                            {/* Exact ref Delete Button */}
                                            <button 
                                                onClick={() => onDelete(cat)} 
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
                            <tr><td colSpan="5" className="text-center py-12 text-[#4b5563] text-[15px] italic">No categories found.</td></tr> 
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