import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import useStore from '../../Hooks/useStore'; 
import { toast } from 'react-toastify';

const CustomSelect = ({ options, value, onChange, placeholder, isUpward = false }) => { 
    const [isOpen, setIsOpen] = useState(false); 
    const selectRef = useRef(null); 
    
    useEffect(() => { 
        const handleClickOutside = (event) => { 
            if (selectRef.current && !selectRef.current.contains(event.target)) setIsOpen(false); 
        }; 
        document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, []); 
    
    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder; 
    
    return ( 
        // <div className="relative w-full font-sans" ref={selectRef}> 
        //     <div onClick={() => setIsOpen(!isOpen)} className={`w-full h-[40px] bg-white border-[0.66px] rounded-[8px] flex items-center justify-between px-[12px] text-black cursor-pointer transition-all ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-[#d1d5db] hover:border-gray-400'}`} > 
        //         <span className="truncate text-[16px]">{selectedLabel}</span> 
        //         <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen && !isUpward ? 'rotate-180' : isOpen && isUpward ? '' : isUpward ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24"> 
        //             <path d="M7 10l5 5 5-5H7z" /> 
        //         </svg> 
        //     </div> 
            
        //     {isOpen && ( 
        //         <div className={`absolute left-0 w-full bg-white border-[0.66px] border-[#e2e8f0] rounded-[6px] shadow-2xl z-[9999] max-h-[250px] overflow-y-auto py-1 ${isUpward ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'}`}> 
        //             {options.map(opt => ( 
        //                 <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className="px-[12px] py-[8px] text-[14px] cursor-pointer transition-colors bg-white text-black hover:bg-blue-50" > 
        //                     {opt.label} 
        //                 </div> 
        //             ))} 
        //         </div> 
        //     )} 
        // </div> 
        <div className="relative w-full font-sans" ref={selectRef}> 
    <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full h-[40px] bg-white border-[0.66px] rounded-[8px] flex items-center justify-between pl-[12px] pr-[4px] text-black cursor-pointer transition-all ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-[#d1d5db] hover:border-gray-400'}`} 
    > 
        <span className="truncate text-[16px]">{selectedLabel}</span> 
        
        {/* React-Select style separator and SVG block */}
        <div className="flex items-center">
            {/* The vertical separator line */}
            <span className="w-[1px] h-[20px] bg-[#cccccc] mx-[6px]"></span>
            
            {/* The SVG Container */}
            <div className="flex items-center justify-center p-[4px] text-[#cccccc] hover:text-[#9ca3af] transition-colors">
                <svg 
                    height="20" 
                    width="20" 
                    viewBox="0 0 20 20" 
                    aria-hidden="true" 
                    focusable="false" 
                    className={`transition-transform duration-200 ${isOpen && !isUpward ? 'rotate-180' : isOpen && isUpward ? '' : isUpward ? 'rotate-180' : ''}`}
                >
                    <path 
                        fill="currentColor" 
                        d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
                    ></path>
                </svg>
            </div>
        </div>
    </div> 
    
    {isOpen && ( 
        <div className={`absolute left-0 w-full bg-white border-[0.66px] border-[#e2e8f0] rounded-[6px] shadow-2xl z-[9999] max-h-[250px] overflow-y-auto py-1 ${isUpward ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'}`}> 
            {options.map(opt => ( 
                <div 
                    key={opt.value} 
                    onClick={() => { onChange(opt.value); setIsOpen(false); }} 
                    className="px-[12px] py-[8px] text-[14px] cursor-pointer transition-colors bg-white text-black hover:bg-blue-50" 
                > 
                    {opt.label} 
                </div> 
            ))} 
        </div> 
    )} 
</div>
    ); 
}; 
const EmailLogFilters = ({ onApplyFilters }) => { 
    const [emailType, setEmailType] = useState('all'); 
    const [orderId, setOrderId] = useState(''); 
    const [fromDate, setFromDate] = useState(''); 
    const [toDate, setToDate] = useState(''); 
    
    const EMAIL_TYPES = [ 
        { label: "All types", value: "all" }, 
        { label: "Success", value: "success" }, 
        { label: "Failed", value: "failed" }, 
        { label: "Invoice Sent", value: "invoice_sent" }, 
        { label: "Payment Reminder", value: "invoice_reminder" }, 
        { label: "Paid Receipt (Customer)", value: "paid_receipt" }, 
        { label: "Paid Receipt (Admin/Partner)", value: "paid_receipt_admin" }, 
        { label: "Supplier New Order", value: "supplier_new_order" }, 
    ]; 
    
    useEffect(() => { 
        const timeoutId = setTimeout(() => { 
            onApplyFilters({ emailType, orderId, fromDate, toDate }); 
        }, 500); 
        return () => clearTimeout(timeoutId); 
    }, [emailType, orderId, fromDate, toDate]); 
    
    return ( 
        <div className="w-full bg-white border-[0.66px] border-[#e2e8f0] rounded-[12px] shadow-sm p-[24px] font-sans flex flex-col gap-[16px]"> 
            <div className="flex flex-row flex-wrap gap-[16px] items-end"> 
                <div className="flex flex-col gap-[6px] w-full sm:w-[180px]"> 
                    <label className="text-[14px] font-medium text-[#374151]">Email type</label> 
                    <CustomSelect options={EMAIL_TYPES} value={emailType} onChange={setEmailType} placeholder="All types" /> 
                </div> 
                <div className="flex flex-col gap-[6px] w-full sm:w-[180px]"> 
                    <label className="text-[14px] font-medium text-[#374151]">Order ID</label> 
                    <input type="number" placeholder="Filter by order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full h-[40px] bg-white border-[0.66px] border-[#d1d5db] rounded-[8px] px-[12px] text-[16px] text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" /> 
                </div> 
                <div className="flex flex-col gap-[6px] w-full sm:w-[180px]"> 
                    <label className="text-[14px] font-medium text-[#374151]">From date</label> 
                    <div className="relative w-full h-[40px] border-[0.66px] border-[#d1d5db] rounded-[8px] flex items-center bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden"> 
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full h-full px-[12px] bg-transparent outline-none text-[14px] text-gray-700 relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" /> 
                        <div className="absolute right-[12px] z-0 text-gray-400 pointer-events-none"> 
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
                        </div> 
                    </div> 
                </div> 
                <div className="flex flex-col gap-[6px] w-full sm:w-[180px]"> 
                    <label className="text-[14px] font-medium text-[#374151]">To date</label> 
                    <div className="relative w-full h-[40px] border-[0.66px] border-[#d1d5db] rounded-[8px] flex items-center bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden"> 
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full h-full px-[12px] bg-transparent outline-none text-[14px] text-gray-700 relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" /> 
                        <div className="absolute right-[12px] z-0 text-gray-400 pointer-events-none"> 
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
                        </div> 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
}; 

const EmailLogsTable = ({ logs, isLoading, pagination, setPagination }) => { 
    const [selectedRowId, setSelectedRowId] = useState(null); 
    const [retryingLogId, setRetryingLogId] = useState(null); // Track which button is loading
    
    const formatDateTime = (dateString) => { 
        if (!dateString) return "—"; 
        const date = new Date(dateString); 
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); 
    }; 
    
    const getMetadataField = (metadataString, field) => { 
        if (!metadataString) return "—"; 
        try { 
            const parsed = JSON.parse(metadataString); 
            return parsed[field] || "—"; 
        } catch { 
            return "—"; 
        } 
    }; 

    // --- NEW: Retry Logic ---
    const handleRetry = async (log, e) => {
        e.stopPropagation(); // Prevent row click
        
        // Prevent double clicks
        if (retryingLogId) return; 

        setRetryingLogId(log.id);

        try {
            // Re-format the email type to match backend expectations. 
            // e.g., "invoice_sent" becomes "invoice-sent"
            const formattedEmailType = log.emailType.replace(/_/g, '-');
            
            const payload = {
                orderId: String(log.orderId || log.partnerOrderId),
                orderType: log.orderType || "customer",
                emailType: formattedEmailType
            };

            const response = await axios.post(
                'https://testingbb.trimworldwide.com/api/v1/admin/order-management/email-helper', 
                payload,
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );

            if (response.data.status === 'success') {
                toast.success("Email retry initiated successfully!");
            } else {
                toast.error(response.data.message || "Failed to retry email.");
            }

        } catch (error) {
            console.error("Retry Error:", error);
            toast.error(error.response?.data?.message || "An error occurred while retrying the email.");
        } finally {
            setRetryingLogId(null);
        }
    };
    
    // --- EXACT DYNAMIC MATH FOR RESULTS TEXT AND PAGES --- 
    const safeTotal = pagination.total || 0; 
    const startRange = safeTotal === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1; 
    const endRange = Math.min(pagination.page * pagination.limit, safeTotal); 
    const totalPages = Math.max(1, Math.ceil(safeTotal / pagination.limit)); 
    
    let startPage = Math.max(1, pagination.page - 2); 
    let endPage = Math.min(totalPages, startPage + 4); 
    if (endPage - startPage < 4) { 
        startPage = Math.max(1, endPage - 4); 
    } 
    const pageNumbers = []; 
    for (let i = startPage; i <= endPage; i++) { 
        pageNumbers.push(i); 
    } 
    const PAGINATION_OPTIONS = [ 
        { label: "10", value: 10 }, 
        { label: "20", value: 20 }, 
        { label: "50", value: 50 }, 
        { label: "100", value: 100 } 
    ]; 
    
    return ( 
        <div className="mt-6 bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans relative z-0"> 
            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left min-w-max border-none"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] rounded-tl-lg rounded-bl-lg border-none">Sent at</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Type</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Order ID</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Order type</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Recipients</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Subject</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Status</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] border-none">Error</th> 
                            <th className="px-6 py-5 font-bold text-gray-800 text-[14px] min-w-[12rem] rounded-tr-lg rounded-br-lg border-none">Action</th> 
                        </tr> 
                    </thead> 
                    <tbody className="border-none"> 
                        {isLoading ? ( 
                            <tr><td colSpan="9" className="text-center py-12 text-gray-500 italic">Loading logs...</td></tr> 
                        ) : logs.length > 0 ? ( 
                            logs.map((log) => { 
                                const isSelected = selectedRowId === log.id; 
                                const isFailed = log.emailSent === 'Failed' || log.emailSent === 'failed';
                                
                                return ( 
                                  <tr 
    key={log.id} 
    onClick={() => setSelectedRowId(log.id)} 
    className={`cursor-pointer transition-colors duration-200 ${ isSelected ? 'bg-[#e5e7eb]' : 'bg-white hover:bg-gray-100' }`} 
> 
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words min-w-[10rem] w-[12rem]">
        {formatDateTime(log.sentAt)}
    </td> 
    
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words capitalize min-w-[8rem] w-[10rem]">
        {log.emailType.replace(/_/g, ' ')}
    </td> 
    
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words min-w-[8rem] w-[8rem]">
        {log.orderId || log.partnerOrderId || "—"}
    </td> 
    
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words min-w-[8rem] w-[8rem]">
        {log.orderType || "—"}
    </td> 
    
    {/* break-all is perfect here so long emails break across lines properly */}
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-all min-w-[14rem] w-[16rem]">
        {log.recipients || "—"}
    </td> 
    
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words min-w-[14rem] w-[18rem]"> 
        {getMetadataField(log.metadata, 'subject')} 
    </td> 
    
    <td className="px-6 py-5 whitespace-normal break-words min-w-[8rem] w-[10rem]"> 
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${ !isFailed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200' }`}> 
            {log.emailSent || 'Unknown'} 
        </span> 
    </td> 
    
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words min-w-[12rem] w-[13rem]">
        {log.errorMessage || "—"}
    </td> 
    
    <td className="px-6 py-5 text-gray-700 text-[14px] whitespace-normal break-words min-w-[8rem] w-[8rem]"> 
        {/* Action Button */} 
        {isFailed ? ( 
            <button 
                onClick={(e) => handleRetry(log, e)} 
                disabled={retryingLogId === log.id} 
                className="px-4 py-1.5 text-brand-brown hover:text-white bg-white hover:bg-[#86644c] text-[14px] font-medium rounded border border-[#86644c] transition-colors disabled:opacity-50" 
            > 
                {retryingLogId === log.id ? 'Retry' : 'Retry'} 
            </button> 
        ) : ( 
            "—" 
        )} 
    </td> 
</tr>
                                ); 
                            }) 
                        ) : ( 
                            <tr><td colSpan="9" className="text-center py-12 text-gray-500 italic border-none">No logs found matching your filters.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 
            
            <div className="flex items-center relative min-h-[3rem] w-full pt-4"> 
                <div className="text-sm text-gray-600 font-medium shrink-0 hidden sm:block"> 
                    Results {startRange}-{endRange} total {safeTotal} 
                </div> 
                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2"> 
                    <button onClick={() => setPagination(p => ({ ...p, page: 1 }))} disabled={pagination.page <= 1} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-40 transition-colors text-[18px]" > &laquo; </button> 
                    <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page <= 1} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-40 transition-colors text-[18px]" > &lsaquo; </button> 
                    {pageNumbers.map(num => ( 
                        <button key={num} onClick={() => setPagination(p => ({ ...p, page: num }))} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors text-[14px] font-medium ${ pagination.page === num ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100' }`} > {num} </button> 
                    ))} 
                    <button onClick={() => setPagination(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))} disabled={pagination.page >= totalPages} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-40 transition-colors text-[18px]" > &rsaquo; </button> 
                    <button onClick={() => setPagination(p => ({ ...p, page: totalPages }))} disabled={pagination.page >= totalPages} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-40 transition-colors text-[18px]" > &raquo; </button> 
                </div> 
                <div className="shrink-0 ml-auto w-[100px] relative z-[9999]"> 
                    <CustomSelect options={PAGINATION_OPTIONS} value={pagination.limit} onChange={(val) => setPagination(p => ({ ...p, limit: Number(val), page: 1 }))} placeholder="Choose" isUpward={true} /> 
                </div> 
            </div> 
        </div> 
    ); 
}; 

const EmailLogs = () => { 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    
    const [logs, setLogs] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 }); 
    const [currentFilters, setCurrentFilters] = useState({ emailType: 'all', orderId: '', fromDate: '', toDate: '' }); 
    
    useEffect(() => { 
        setTitle("Email Logs"); 
        setShowProfile(false); 
        setActions(null); 
        return () => { 
            setActions(null); 
            setShowProfile(true); 
        }; 
    }, [setTitle, setActions, setShowProfile]); 
    
    useEffect(() => { 
        const fetchLogs = async () => { 
            setIsLoading(true); 
            setIsGlobalLoading(true); 
            try { 
                const queryParams = new URLSearchParams({ page: pagination.page, limit: pagination.limit }); 
                
                if (currentFilters.emailType && currentFilters.emailType !== 'all') { 
                    if (currentFilters.emailType === 'success') { 
                        queryParams.append('emailSent', 'Success'); 
                    } else if (currentFilters.emailType === 'failed') { 
                        queryParams.append('emailSent', 'Failed'); 
                    } else { 
                        queryParams.append('emailType', currentFilters.emailType); 
                    } 
                } 
                if (currentFilters.orderId) queryParams.append('orderId', currentFilters.orderId); 
                if (currentFilters.fromDate) queryParams.append('fromDate', currentFilters.fromDate); 
                if (currentFilters.toDate) queryParams.append('toDate', currentFilters.toDate); 
                
                const url = `https://testingbb.trimworldwide.com/api/v1/admin/order-management/email-log?${queryParams.toString()}`; 
                const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                
                if (res.data.status === 'success' && res.data.data) { 
                    setLogs(res.data.data.emailLogs || []); 
                    const exactTotal = res.data.data.pagination?.total || 0; 
                    setPagination(p => ({ ...p, total: exactTotal })); 
                } 
            } catch (error) { 
                console.error("Failed to fetch logs:", error); 
            } finally { 
                setIsLoading(false); 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchLogs(); 
    }, [pagination.page, pagination.limit, currentFilters]); 
    
    const handleFilters = (filters) => { 
        setPagination(p => ({ ...p, page: 1 })); 
        setCurrentFilters(filters); 
    }; 
    
    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans"> 
            <div className="w-full mx-auto"> 
                <EmailLogFilters onApplyFilters={handleFilters} /> 
                <EmailLogsTable logs={logs} isLoading={isLoading} pagination={pagination} setPagination={setPagination} /> 
            </div> 
        </div> 
    ); 
}; 

export default EmailLogs;







