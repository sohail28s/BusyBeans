import React from 'react';

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export const InvoiceActivityModal = ({ isOpen, onClose, orderInfo }) => {
    if (!isOpen) return null;
    const data = orderInfo || {};
    const invoiceDate = data.invoiceDate;
    const sentCount = data.invoiceEmailSentCount || 0;
    const firstOpened = data.paymentLinkFirstOpenedAt;
    const lastOpened = data.paymentLinkLastOpenedAt;
    const openCount = data.paymentLinkOpenCount || 0;
    const paidDate = data.invoicePaidDate;

    // Timeline Configuration
    const timelineSteps = [
        { id: 'created', title: 'Invoice Created', date: formatDate(invoiceDate), isActive: !!invoiceDate },
        { id: 'sent', title: `Sent ${sentCount} times`, date: sentCount > 0 ? formatDate(invoiceDate) : '—', isActive: sentCount > 0 },
        { id: 'first_open', title: 'First Open', date: formatDate(firstOpened), isActive: !!firstOpened },
        { id: 'recent_open', title: 'Recently Opened', date: formatDate(lastOpened), isActive: !!lastOpened },
        { id: 'viewed', title: `Viewed ${openCount} times`, date: '—', isActive: openCount > 0 },
        { id: 'paid', title: 'Paid', date: formatDate(paidDate), isActive: !!paidDate }
    ];

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50  transition-opacity" 
            onClick={onClose}
        >
            {/* Modal Container */}
            <div 
                className="bg-white rounded-[8px] w-[92vw] max-w-[420px] shadow-2xl overflow-hidden flex flex-col font-nunito" 
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5">
                    <h2 className="text-[20px] font-semibold text-[#334155]">Invoice Activity</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1" 
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z" fill="currentColor"></path>
                        </svg>
                    </button>
                </div>
                
                {/* Body / Timeline */}
                <div className="px-6 pb-6 pt-2">
                    <div className="py-1">
                        {timelineSteps.map((step, index) => {
                            const isLast = index === timelineSteps.length - 1;
                            return (
                                <div key={step.id} className="relative pl-8 pb-5">
                                    {/* Timeline Connecting Line */}
                                    {!isLast && (
                                        <span className="absolute left-[11px] top-5 h-[calc(100%-6px)] w-[2px] bg-gray-200"></span>
                                    )}

                                    {/* Timeline Dot (Active vs Inactive logic directly mapping reference HTML) */}
                                    {step.isActive ? (
                                        <span className="absolute left-0 top-1 h-[22px] w-[22px] rounded-full border-2 border-green-500 bg-green-50">
                                            <span className="absolute inset-[5px] rounded-full bg-green-500"></span>
                                        </span>
                                    ) : (
                                        <span className="absolute left-0 top-1 h-[22px] w-[22px] rounded-full border-2 border-gray-300 bg-white"></span>
                                    )}

                                    {/* Content Area */}
                                    <p className="text-[15px] font-semibold text-gray-800">{step.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};