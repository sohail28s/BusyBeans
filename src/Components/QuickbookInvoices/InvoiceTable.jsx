import React, { useState, useEffect, useRef } from 'react'; 
import { exportToCSV } from '../../utils/csvHelper' 

const PaginationSelect = ({ options, value, onChange }) => { 
    const [isOpen, setIsOpen] = useState(false); 
    const selectRef = useRef(null); 
    
    useEffect(() => { 
        const handleClickOutside = (event) => { 
            if (selectRef.current && !selectRef.current.contains(event.target)) setIsOpen(false); 
        }; 
        document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, []); 
    
    const selectedLabel = options.find(opt => opt.value === value)?.label || value; 
    
    return ( 
        <div className="relative font-sans" ref={selectRef}> 
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-[8px] cursor-pointer text-[#4b5563] hover:text-[#3b82f6] transition-colors"> 
                <span className="text-[16px]">{selectedLabel}</span> 
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg> 
            </div> 
            {isOpen && ( 
                <div className="absolute bottom-[calc(100%+8px)] right-0 w-[80px] bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-[9999] py-1"> 
                    {options.map(opt => ( 
                        <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`px-4 py-2 text-[14px] cursor-pointer transition-colors text-center ${opt.value === value ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-white text-[#4b5563] hover:bg-gray-50'}`}> 
                            {opt.label} 
                        </div> 
                    ))} 
                </div> 
            )} 
        </div> 
    ); 
}; 

export const InvoiceTable = ({ data, isLoading, pagination, setPagination, showCheckboxes, selectedIds, setSelectedIds }) => { 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'asc' | 'desc' 
    
    // 1. Client-Side Search Logic (.includes) 
    const filteredData = data.filter(item => { 
        if (!searchQuery) return true; 
        const q = searchQuery.toLowerCase(); 
        return ( 
            String(item.id).includes(q) || 
            (item.invoiceNumber || '').toLowerCase().includes(q) || 
            (item.salesRepName || '').toLowerCase().includes(q) || 
            (item.orderCurrentStatus || '').toLowerCase().includes(q) 
        ); 
    }); 
    
    // 2. Attach the true SL value to each row BEFORE sorting 
    let displayData = filteredData.map((item, index) => ({ 
        ...item, 
        calculatedSL: ((pagination.page - 1) * pagination.limit) + index + 1 
    })); 
    
    // 3. Client-Side Sort Logic based on the SL 
    if (sortOrder === 'asc') { 
        displayData.sort((a, b) => a.calculatedSL - b.calculatedSL); 
    } else if (sortOrder === 'desc') { 
        displayData.sort((a, b) => b.calculatedSL - a.calculatedSL); 
    } 
    
    const toggleSort = () => { 
        if (sortOrder === 'default') setSortOrder('asc'); 
        else if (sortOrder === 'asc') setSortOrder('desc'); 
        else setSortOrder('default'); 
    }; 
    
    const formatDate = (dateString) => { 
        if (!dateString) return ""; 
        const date = new Date(dateString); 
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); 
    }; 
    
    // Checkbox Logic 
    const handleSelectAll = (e) => { 
        if (e.target.checked) setSelectedIds(displayData.map(item => item.id)); 
        else setSelectedIds([]); 
    }; 
    
    const handleSelectOne = (id, checked) => { 
        if (checked) setSelectedIds(prev => [...prev, id]); 
        else setSelectedIds(prev => prev.filter(item => item !== id)); 
    }; 
    
    const handleDownloadCSV = () => { 
        if (!displayData || displayData.length === 0) { 
            alert("No data to download!"); 
            return; 
        } 
        
        // Map the raw data to clean, professional CSV columns 
        const csvFormattedData = displayData.map((invoice, index) => ({ 
            "SL": ((pagination.page - 1) * pagination.limit) + index + 1, 
            "Order ID": invoice.id, 
            "Invoice #": invoice.invoiceNumber || `INV00${invoice.id}`, 
            "Order Status": invoice.orderCurrentStatus, 
            "Payment Status": invoice.paymentStatus || 'Pending', 
            "Sales Rep": invoice.salesRepName || "", 
            "Total Qty": invoice.totalQuantity, 
            "Subtotal ($)": invoice.subTotal, 
            "Shipping ($)": invoice.shippingCharges, 
            "Total Bill ($)": invoice.totalBill, 
            "Delivered On": invoice.deliveredOn ? new Date(invoice.deliveredOn).toLocaleDateString() : "", 
            "Created At": invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "", 
            "Overdue": invoice.overdueInvoice ? 'Yes' : 'No' 
        })); 
        
        // Trigger your helper function! 
        exportToCSV(csvFormattedData, `Invoices_Page_${pagination.page}.csv`); 
    }; 
    
    // Pagination Math 
    const safeTotal = pagination.total || 0; 
    const totalPages = Math.max(1, Math.ceil(safeTotal / pagination.limit)); 
    let startPage = Math.max(1, pagination.page - 2); 
    let endPage = Math.min(totalPages, startPage + 4); 
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4); 
    const pageNumbers = Array.from({length: (endPage - startPage) + 1}, (_, i) => startPage + i); 

    return ( 
        <div className="bg-white w-full border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm flex flex-col font-sans relative z-0 p-[24px]"> 
            
            <div className="flex items-center justify-between mb-[24px] flex-wrap gap-2"> 
                <div className="relative flex items-center w-[300px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden"> 
                    <div className="pl-[12px] pr-[8px] text-gray-500"> 
                        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg> 
                    </div> 
                    <input 
                        type="search" 
                        placeholder="Search ..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full h-full bg-transparent text-[15px] text-gray-700 focus:outline-none pr-[12px]" 
                    /> 
                </div> 
                <button 
                    onClick={handleDownloadCSV} 
                    className="h-[45px] px-[20px] flex items-center gap-[8px] bg-black text-white text-[15px] font-semibold border-[0.66px] border-black rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm"
                > 
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z"/></svg> 
                    Download CSV 
                </button> 
            </div> 

            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left min-w-max border-none"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr> 
                            {showCheckboxes && ( 
                                <th className="px-8 py-5 w-[50px] text-center border-none first:rounded-l-lg last:rounded-r-lg"> 
                                    {/* CUSTOM HEADER CHECKBOX */}
                                    <div className="relative flex items-center justify-center w-4 h-4 mx-auto">
                                        <input 
                                            type="checkbox" 
                                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] bg-white checked:bg-black checked:border-black cursor-pointer transition-colors m-0" 
                                            checked={displayData.length > 0 && selectedIds.length === displayData.length} 
                                            onChange={handleSelectAll} 
                                        /> 
                                        <svg className="absolute w-2.5 h-2.5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 14 14" fill="none">
                                            <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </th> 
                            )} 
                            
                            <th 
                                onClick={toggleSort} 
                                className="px-8 py-5 font-bold text-[14px] w-[100px] cursor-pointer select-none transition-colors text-[#374151] border-none first:rounded-l-lg last:rounded-r-lg"
                            > 
                                <div className="flex items-center gap-2"> 
                                    SL 
                                    {sortOrder === 'default' && ( 
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                                            <path d="M5.64515 3.61291C5.47353 3.61291 5.30192 3.54968 5.16644 3.4142L3.38708 1.63484L1.60773 3.4142C1.34579 3.67613 0.912244 3.67613 0.650309 3.4142C0.388374 3.15226 0.388374 2.71871 0.650309 2.45678L2.90837 0.198712C3.17031 -0.0632236 3.60386 -0.0632236 3.86579 0.198712L6.12386 2.45678C6.38579 2.71871 6.38579 3.15226 6.12386 3.4142C5.98837 3.54968 5.81676 3.61291 5.64515 3.61291Z" fill="currentColor"></path> 
                                            <path d="M3.38714 14C3.01681 14 2.70972 13.6929 2.70972 13.3226V0.677419C2.70972 0.307097 3.01681 0 3.38714 0C3.75746 0 4.06456 0.307097 4.06456 0.677419V13.3226C4.06456 13.6929 3.75746 14 3.38714 14Z" fill="currentColor"></path> 
                                            <path d="M10.6129 14C10.4413 14 10.2697 13.9368 10.1342 13.8013L7.87611 11.5432C7.61418 11.2813 7.61418 10.8477 7.87611 10.5858C8.13805 10.3239 8.5716 10.3239 8.83353 10.5858L10.6129 12.3652L12.3922 10.5858C12.6542 10.3239 13.0877 10.3239 13.3497 10.5858C13.6116 10.8477 13.6116 11.2813 13.3497 11.5432L11.0916 13.8013C10.9561 13.9368 10.7845 14 10.6129 14Z" fill="currentColor"></path> 
                                            <path d="M10.6129 14C10.2426 14 9.93552 13.6929 9.93552 13.3226V0.677419C9.93552 0.307097 10.2426 0 10.6129 0C10.9833 0 11.2904 0.307097 11.2904 0.677419V13.3226C11.2904 13.6929 10.9832 14 10.6129 14Z" fill="currentColor"></path> 
                                        </svg> 
                                    )} 
                                    {sortOrder === 'asc' && ( 
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="p-icon p-sortable-column-icon"><path d="M3.63435 0.19871C3.57113 0.135484 3.49887 0.0903226 3.41758 0.0541935C3.255 -0.0180645 3.06532 -0.0180645 2.90274 0.0541935C2.82145 0.0903226 2.74919 0.135484 2.68597 0.19871L0.427901 2.45677C0.165965 2.71871 0.165965 3.15226 0.427901 3.41419C0.689836 3.67613 1.12338 3.67613 1.38532 3.41419L2.48726 2.31226V13.3226C2.48726 13.6929 2.79435 14 3.16467 14C3.535 14 3.84209 13.6929 3.84209 13.3226V2.31226L4.94403 3.41419C5.07951 3.54968 5.25113 3.6129 5.42274 3.6129C5.59435 3.6129 5.76597 3.54968 5.90145 3.41419C6.16338 3.15226 6.16338 2.71871 5.90145 2.45677L3.64338 0.19871H3.63435ZM13.7685 13.3226C13.7685 12.9523 13.4615 12.6452 13.0911 12.6452H7.22016C6.84984 12.6452 6.54274 12.9523 6.54274 13.3226C6.54274 13.6929 6.84984 14 7.22016 14H13.0911C13.4615 14 13.7685 13.6929 13.7685 13.3226ZM7.22016 8.58064C6.84984 8.58064 6.54274 8.27355 6.54274 7.90323C6.54274 7.5329 6.84984 7.22581 7.22016 7.22581H9.47823C9.84855 7.22581 10.1556 7.5329 10.1556 7.90323C10.1556 8.27355 9.84855 8.58064 9.47823 8.58064H7.22016ZM7.22016 5.87097H7.67177C8.0421 5.87097 8.34919 5.56387 8.34919 5.19355C8.34919 4.82323 8.0421 4.51613 7.67177 4.51613H7.22016C6.84984 4.51613 6.54274 4.82323 6.54274 5.19355C6.54274 5.56387 6.84984 5.87097 7.22016 5.87097ZM11.2847 11.2903H7.22016C6.84984 11.2903 6.54274 10.9832 6.54274 10.6129C6.54274 10.2426 6.84984 9.93548 7.22016 9.93548H11.2847C11.655 9.93548 11.9621 10.2426 11.9621 10.6129C11.9621 10.9832 11.655 11.2903 11.2847 11.2903Z" fill="currentColor"></path></svg> 
                                    )} 
                                    {sortOrder === 'desc' && ( 
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="p-icon p-sortable-column-icon"><path d="M4.93953 10.5858L3.83759 11.6877V0.677419C3.83759 0.307097 3.53049 0 3.16017 0C2.78985 0 2.48275 0.307097 2.48275 0.677419V11.6877L1.38082 10.5858C1.11888 10.3239 0.685331 10.3239 0.423396 10.5858C0.16146 10.8477 0.16146 11.2813 0.423396 11.5432L2.68146 13.8013C2.74469 13.8645 2.81694 13.9097 2.89823 13.9458C2.97952 13.9819 3.06985 14 3.16017 14C3.25049 14 3.33178 13.9819 3.42211 13.9458C3.5034 13.9097 3.57565 13.8645 3.63888 13.8013L5.89694 11.5432C6.15888 11.2813 6.15888 10.8477 5.89694 10.5858C5.63501 10.3239 5.20146 10.3239 4.93953 10.5858ZM13.0957 0H7.22468C6.85436 0 6.54726 0.307097 6.54726 0.677419C6.54726 1.04774 6.85436 1.35484 7.22468 1.35484H13.0957C13.466 1.35484 13.7731 1.04774 13.7731 0.677419C13.7731 0.307097 13.466 0 13.0957 0ZM7.22468 5.41935H9.48275C9.85307 5.41935 10.1602 5.72645 10.1602 6.09677C10.1602 6.4671 9.85307 6.77419 9.48275 6.77419H7.22468C6.85436 6.77419 6.54726 6.4671 6.54726 6.09677C6.54726 5.72645 6.85436 5.41935 7.22468 5.41935ZM7.6763 8.12903H7.22468C6.85436 8.12903 6.54726 8.43613 6.54726 8.80645C6.54726 9.17677 6.85436 9.48387 7.22468 9.48387H7.6763C8.04662 9.48387 8.35372 9.17677 8.35372 8.80645C8.35372 8.43613 8.04662 8.12903 7.6763 8.12903ZM7.22468 2.70968H11.2892C11.6595 2.70968 11.9666 3.01677 11.9666 3.3871C11.9666 3.75742 11.6595 4.06452 11.2892 4.06452H7.22468C6.85436 4.06452 6.54726 3.75742 6.54726 3.3871C6.54726 3.01677 6.85436 2.70968 7.22468 2.70968Z" fill="currentColor"></path></svg> 
                                    )} 
                                </div> 
                            </th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[140px] border-none first:rounded-l-lg last:rounded-r-lg">Order ID</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[160px] border-none first:rounded-l-lg last:rounded-r-lg">Invoice #</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[160px] border-none first:rounded-l-lg last:rounded-r-lg">Order Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[160px] border-none first:rounded-l-lg last:rounded-r-lg">Payment Status</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[180px] border-none first:rounded-l-lg last:rounded-r-lg">Sales Rep</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[100px] border-none first:rounded-l-lg last:rounded-r-lg">Total Qty</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[140px] border-none first:rounded-l-lg last:rounded-r-lg">Subtotal ($)</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[140px] border-none first:rounded-l-lg last:rounded-r-lg">Shipping ($)</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[140px] border-none first:rounded-l-lg last:rounded-r-lg">Total Bill ($)</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[160px] border-none first:rounded-l-lg last:rounded-r-lg">Delivered On</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[160px] border-none first:rounded-l-lg last:rounded-r-lg">Created At</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody className="border-none"> 
                        {isLoading ? ( 
                            <tr><td colSpan={showCheckboxes ? "13" : "12"} className="text-center py-12 text-gray-500 italic border-none">Loading invoices...</td></tr> 
                        ) : displayData.length > 0 ? ( 
                            displayData.map((invoice, index) => ( 
                                <tr 
                                    key={invoice.id} 
                                    className={`transition-colors duration-200 h-[64px] text-[#4b5563] text-[14px] cursor-pointer ${
                                        selectedIds.includes(invoice.id) ? 'bg-table-selected' : 'bg-white hover:bg-gray-50'
                                    }`}
                                > 
                                    {showCheckboxes && ( 
                                        <td className="px-8 py-5 text-center border-none"> 
                                            {/* CUSTOM ROW CHECKBOX */}
                                            <div className="relative flex items-center justify-center w-4 h-4 mx-auto">
                                                <input 
                                                    type="checkbox" 
                                                    className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] bg-white checked:bg-black checked:border-black cursor-pointer transition-colors m-0" 
                                                    checked={selectedIds.includes(invoice.id)} 
                                                    onChange={(e) => handleSelectOne(invoice.id, e.target.checked)} 
                                                />
                                                <svg className="absolute w-2.5 h-2.5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 14 14" fill="none">
                                                    <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        </td> 
                                    )} 
                                    <td className="px-8 py-5 font-medium text-gray-900 border-none">{invoice.calculatedSL}</td> 
                                    <td className="px-8 py-5 border-none">{invoice.id}</td> 
                                    <td className="px-8 py-5 border-none">{invoice.invoiceNumber || `INV00${invoice.id}`}</td> 
                                    <td className="px-8 py-5 capitalize border-none">{invoice.orderCurrentStatus}</td> 
                                    <td className="px-8 py-5 border-none"> 
                                        {invoice.paymentStatus?.toLowerCase() || 'pending'} 
                                    </td> 
                                    <td className="px-8 py-5 border-none">{invoice.salesRepName || ""}</td> 
                                    <td className="px-8 py-5 border-none">{invoice.totalQuantity}</td> 
                                    <td className="px-8 py-5 border-none">{invoice.subTotal}</td> 
                                    <td className="px-8 py-5 border-none">{invoice.shippingCharges}</td> 
                                    <td className="px-8 py-5 border-none">{invoice.totalBill}</td> 
                                    <td className="px-8 py-5 border-none">{formatDate(invoice.deliveredOn)}</td> 
                                    <td className="px-8 py-5 border-none">{formatDate(invoice.createdAt)}</td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan={showCheckboxes ? "13" : "12"} className="text-left pl-10 py-6 text-gray-500 italic border-none">No Data Found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* Pagination Controls */} 
            <div className="w-full pt-[24px] flex flex-row items-center justify-center text-[16px] text-gray-500 bg-white relative z-10 overflow-visible"> 
                <div className="flex items-center gap-[12px]"> 
                    <button onClick={() => setPagination(p => ({ ...p, page: 1 }))} disabled={pagination.page <= 1} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&laquo;</button> 
                    <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page <= 1} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&lsaquo;</button> 
                    {pageNumbers.map(num => ( 
                        <button key={num} onClick={() => setPagination(p => ({ ...p, page: num }))} className={`w-[32px] h-[32px] flex items-center justify-center transition-colors text-[16px] ${pagination.page === num ? 'text-[#2563eb] font-medium' : 'hover:text-[#3b82f6]'}`}>{num}</button> 
                    ))} 
                    <button onClick={() => setPagination(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))} disabled={pagination.page >= totalPages} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&rsaquo;</button> 
                    <button onClick={() => setPagination(p => ({ ...p, page: totalPages }))} disabled={pagination.page >= totalPages} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&raquo;</button> 
                </div> 
                <div className=" flex items-center pr-[12px]"> 
                    <PaginationSelect 
                        options={[
                            { label: "10", value: 10 }, { label: "25", value: 25 }, { label: "50", value: 50 }, 
                            { label: "100", value: 100 }, { label: "150", value: 150 }, { label: "250", value: 250 }, 
                         
                        ]} 
                        value={pagination.limit} 
                        onChange={(val) => setPagination(p => ({ ...p, limit: Number(val), page: 1 }))} 
                    /> 
                </div> 
            </div> 
        </div> 
    ); 
};