import React, { useState, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { TablePagination } from '../../Shared/Table/TablePagination'; // Global Pagination


export const EmployeeCustomersTable = ({ data, isLoading, pagination, setPagination, onUnlink, onDownloadCSV }) => { 
    const navigate = useNavigate(); 
    const [searchQuery, setSearchQuery] = useState(''); 

    // Client-Side Search 
    const filteredData = useMemo(() => { 
        if (!data) return []; 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                (item.companyName || '').toLowerCase().includes(q) || 
                (item.name || '').toLowerCase().includes(q) || 
                (item.email || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    // --- Pagination Adapter ---
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.totalItems || 0
    };

    const handleSetPagination = (updater) => {
        const nextState = typeof updater === 'function' ? updater(adaptedPagination) : updater;
        setPagination({ page: nextState.page, limit: nextState.limit });
    };

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans"> 
            
            {/* Table Toolbar */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                <div className="relative flex items-center w-full max-w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg overflow-hidden"> 
                    {/* EXACT REF SEARCH SVG */}
                    <div className="pl-4 pr-2 text-gray-500"> 
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.3-4.3"></path>
                        </svg> 
                    </div> 
                    <input 
                        placeholder="Search by company name, contact, email..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3 placeholder:font-sans placeholder:font-medium" 
                        type="search" 
                    /> 
                </div> 
                
                <button 
                    onClick={onDownloadCSV} 
                    disabled={isLoading || filteredData.length === 0} 
                    className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                > 
                    {/* EXACT REF DOWNLOAD SVG */}
                    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span className="group-hover:text-black text-white font-sans font-medium transition-colors">Download CSV</span> 
                </button> 
            </div> 

            {/* Table Area (Non-Sortable) */} 
            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left min-w-[1000px] border-collapse"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr className="border-b border-[#e2e8f0]"> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[8%] whitespace-nowrap">#</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[22%] whitespace-nowrap">Company Name</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[18%] whitespace-nowrap">Main Contact</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[22%] whitespace-nowrap">Email</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[12%] whitespace-nowrap">Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[18%] whitespace-nowrap text-left">Action</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan="6" className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading customers...</td></tr> 
                        ) : filteredData.length > 0 ? ( 
                            filteredData.map((cust, index) => ( 
                                <tr 
                                    key={cust.id} 
                                    className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[15px] cursor-default"
                                > 
                                    <td className="px-8 py-5 font-medium text-gray-900">{((pagination.page - 1) * pagination.limit) + (index + 1)}</td> 
                                    <td className="px-8 py-5 text-gray-900 truncate max-w-[200px]" title={cust.companyName}>{cust.companyName || '-'}</td> 
                                    <td className="px-8 py-5 truncate max-w-[200px]" title={cust.name}>{cust.name || '-'}</td> 
                                    <td className="px-8 py-5 truncate max-w-[250px]" title={cust.email}>{cust.email || '-'}</td> 
                                    
                                    {/* Status Pill */}
                                    <td className="px-8 py-5 whitespace-nowrap"> 
                                        {cust.status ? ( 
                                            <span className="bg-[#2f9e54] text-white px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium tracking-wide shadow-sm"> 
                                                Active 
                                            </span> 
                                        ) : ( 
                                            <span className="bg-gray-500 text-white px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium tracking-wide shadow-sm"> 
                                                Inactive 
                                            </span> 
                                        )} 
                                    </td> 
                                    
                                    {/* Actions */}
                                    <td className="px-8 py-5 text-left"> 
                                        <div className="flex items-center gap-x-3"> 
                                            {/* EXACT REF VIEW BUTTON & SVG */}
                                            <button 
                                                onClick={() => navigate(`/customers/${cust.id}`, { state: { customerData: cust } })} 
                                                className="h-[32px] px-4 border border-gray-300 bg-white rounded-[6px] text-gray-600 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors text-[13px] font-medium outline-none" 
                                            > 
                                                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                </svg>
                                                View 
                                            </button> 
                                            
                                            {/* EXACT REF UNLINK BUTTON & SVG */}
                                            <button 
                                                onClick={() => onUnlink(cust)} 
                                                className="h-[32px] px-4 border border-[#fca5a5] bg-[#fef2f2] rounded-[6px] text-[#ef4444] flex items-center justify-center gap-1.5 hover:bg-[#fee2e2] transition-colors text-[13px] font-medium outline-none" 
                                            > 
                                                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path>
                                                </svg>
                                                Unlink 
                                            </button> 
                                        </div> 
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan="6" className="text-center py-12 text-[#4b5563] text-[15px] italic">No assigned customers found.</td></tr> 
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