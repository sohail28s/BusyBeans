import { formatDateWithTime } from '../../../utils/orderUtils'; 

export const EmailLogsAccordion = ({ emailLogs, showEmailsAccordion, setShowEmailsAccordion }) => ( 
    <div className="w-full py-4 px-4 2xl:px-8 border border-gray-200 bg-white rounded-sm shadow-sm mb-8"> 
        <button 
            onClick={() => setShowEmailsAccordion(!showEmailsAccordion)} 
            className="w-full flex items-center justify-between gap-2 text-left font-semibold text-gray-800 hover:opacity-80 transition-opacity"
        > 
            <span className="flex items-center gap-2 flex-wrap"> 
                <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" className="text-black">
                    <path d="M6 6C6 5.44772 6.44772 5 7 5H17C17.5523 5 18 5.44772 18 6C18 6.55228 17.5523 7 17 7H7C6.44771 7 6 6.55228 6 6Z" fill="currentColor"></path>
                    <path d="M6 10C6 9.44771 6.44772 9 7 9H17C17.5523 9 18 9.44771 18 10C18 10.5523 17.5523 11 17 11H7C6.44771 11 6 10.5523 6 10Z" fill="currentColor"></path>
                    <path d="M7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44771 15 7 15H17C17.5523 15 18 14.5523 18 14C18 13.4477 17.5523 13 17 13H7Z" fill="currentColor"></path>
                    <path d="M6 18C6 17.4477 6.44772 17 7 17H11C11.5523 17 12 17.4477 12 18C12 18.5523 11.5523 19 11 19H7C6.44772 19 6 18.5523 6 18Z" fill="currentColor"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.34315 3.34315 1 5 1H19C20.6569 1 22 2.34315 22 4V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V4ZM5 3H19C19.5523 3 20 3.44771 20 4V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44771 3 5 3Z" fill="currentColor"></path>
                </svg> 
                <span>Emails/Invoices sent for this order</span> 
                <span className="text-gray-500 font-normal text-sm">({emailLogs.length})</span> 
            </span> 
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className={`shrink-0 transition-transform duration-200 ${showEmailsAccordion ? 'rotate-180' : ''}`} height="22" width="22">
                <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
            </svg> 
        </button> 
        
        {showEmailsAccordion && ( 
            <div className="space-y-3 mt-4"> 
                {emailLogs.length > 0 ? ( 
                    emailLogs.map(log => { 
                        const meta = log.metadata ? JSON.parse(log.metadata) : {}; 
                        const successStyle = log.emailSent === 'Success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'; 
                        
                        // Dynamically format pill text
                        const typeDisplay = log.emailType.replace(/_/g, ' ');
                        const orderTypeLabel = log.orderType === 'local-partner' ? 'partner' : 'customer';
                        const pillText = `${typeDisplay} (${orderTypeLabel})`;

                        // --- PARTNER VIEW (Screenshot 1 / HTML Snippet) ---
                        if (log.orderType === 'local-partner') {
                            return (
                                <div key={log.id} className="border border-gray-200 rounded-lg p-3 text-sm space-y-1.5 bg-gray-50/50 mb-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="font-medium text-gray-700">{formatDateWithTime(log.sentAt)}</span>
                                            <span className="px-2 py-0.5 rounded bg-[#86644c]/10 text-[#86644c] font-medium capitalize">
                                                {pillText}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${log.emailSent === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {log.emailSent}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600"><span className="font-medium">To:</span> {log.recipients}</p>
                                    <p className="text-gray-600 truncate max-w-full"><span className="font-medium">Subject:</span> {meta.subject || '-'}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-1">
                                        <p><span className="font-medium">Recently viewed:</span> {log.lastOpenedAt ? formatDateWithTime(log.lastOpenedAt) : '—'}</p>
                                        <p><span className="font-medium">First opened:</span> {log.firstOpenedAt ? formatDateWithTime(log.firstOpenedAt) : '—'}</p>
                                        <p><span className="font-medium">Last opened:</span> {log.lastOpenedAt ? formatDateWithTime(log.lastOpenedAt) : '—'}</p>
                                        <p><span className="font-medium">Open count:</span> {log.openCount || 0}</p>
                                        <p><span className="font-medium">Click count:</span> {log.clickCount || 0}</p>
                                        <p><span className="font-medium">Soft bounced at:</span> {log.softBouncedAt ? formatDateWithTime(log.softBouncedAt) : '—'}</p>
                                        <p className="sm:col-span-2"><span className="font-medium">Soft bounce reason:</span> {log.softBounceReason || '—'}</p>
                                    </div>
                                </div>
                            );
                        }

                        // --- CUSTOMER VIEW (Screenshot 2 / Original) ---
                        return ( 
                            <div key={log.id} className="border border-gray-200 rounded-xl p-4 text-sm space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow"> 
                                <div className="flex flex-wrap items-start justify-between gap-3"> 
                                    <div className="space-y-1 min-w-0"> 
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Sent At</p> 
                                        <p className="font-semibold text-gray-800">{formatDateWithTime(log.sentAt)}</p> 
                                    </div> 
                                    <div className="flex flex-wrap items-center gap-2"> 
                                        <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#86644c]/10 text-[#86644c] text-xs leading-none font-semibold whitespace-nowrap capitalize">
                                            {pillText}
                                        </span> 
                                        <span className={`inline-flex items-center h-7 px-3 rounded-full text-xs leading-none font-semibold tracking-wide whitespace-nowrap capitalize ${successStyle}`}>
                                            {log.emailSent}
                                        </span> 
                                    </div> 
                                </div> 
                                <div className="space-y-1.5 text-sm"> 
                                    <p className="text-gray-700 break-all"><span className="font-semibold text-gray-900">To: </span> {log.recipients}</p> 
                                    <p className="text-gray-700"><span className="font-semibold text-gray-900">Subject: </span> {meta.subject || '-'}</p> 
                                </div> 
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3"> 
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1.5"> 
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Engagement</p> 
                                        <p className="text-gray-700 text-xs"><span className="font-medium">First opened: </span> {log.firstOpenedAt ? formatDateWithTime(log.firstOpenedAt) : '—'}</p> 
                                        <p className="text-gray-700 text-xs"><span className="font-medium">Last opened: </span> {log.lastOpenedAt ? formatDateWithTime(log.lastOpenedAt) : '—'}</p> 
                                        <div className="flex flex-wrap gap-2 pt-1"> 
                                            <span className="inline-flex items-center h-7 px-2.5 rounded-md bg-white border text-[11px] leading-none text-gray-700 font-medium">Opens: {log.openCount || 0}</span> 
                                            <span className="inline-flex items-center h-7 px-2.5 rounded-md bg-white border text-[11px] leading-none text-gray-700 font-medium">Clicks: {log.clickCount || 0}</span> 
                                        </div> 
                                    </div> 
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1.5"> 
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery</p> 
                                        <p className="text-gray-700 text-xs"><span className="font-medium">Soft bounced at: </span> {log.softBouncedAt ? formatDateWithTime(log.softBouncedAt) : '—'}</p> 
                                        <p className="text-gray-700 text-xs break-words"><span className="font-medium">Soft bounce reason: </span> {log.softBounceReason || '—'}</p> 
                                    </div> 
                                </div> 
                            </div> 
                        ); 
                    }) 
                ) : ( 
                    <div className="text-center py-6 text-gray-400 italic text-sm">No emails have been sent yet.</div> 
                )} 
            </div> 
        )} 
    </div> 
);