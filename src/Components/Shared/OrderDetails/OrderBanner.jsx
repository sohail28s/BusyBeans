import { formatDate } from '../../../utils/orderUtils'; 

export const OrderBanner = ({ orderData, currentPaymentValue, handlePaymentStatusChange, isUpdatingPayment, setIsLogModalOpen, isPartnerRoute }) => {
    
    // Check if it's a partner order AND the payment method is 'card'
    const isPartnerCardPayment = isPartnerRoute && orderData?.paymentMethod?.toLowerCase() === 'card';

    return (
        <div className="w-full bg-[#eff6ff] flex flex-col xl:flex-row xl:justify-between items-start gap-4 rounded-md px-4 lg:px-6 py-4 border border-blue-100 mb-6"> 
            <div className="flex gap-x-2 w-full min-w-0"> 
                <div className="shrink-0 mt-[2px]"> 
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="25" width="25" className="text-black"> 
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect> 
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path> 
                        <path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path> 
                    </svg> 
                </div> 
                <div className="space-y-4"> 
                    <p className="font-semibold text-[15px] text-black">This order is {orderData.orderCurrentStatus}</p> 
                    <div className="space-y-2"> 
                        <p className="text-[14px] text-black">Optional actions:</p> 
                        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center"> 
                            <p className="font-semibold text-[15px] text-black">Record a payment:</p> 
                            
                            {/* Conditional Rendering Logic Here */}
                            {isPartnerCardPayment ? (
                                <div className="bg-payment-yellow text-black px-4 py-2 rounded-md text-base font-medium tracking-wide">
                                    {currentPaymentValue}
                                </div>
                            ) : (
                                <div className="relative w-full sm:w-[160px] group bg-transparent"> 
                                    <select 
                                        value={currentPaymentValue} 
                                        onChange={handlePaymentStatusChange} 
                                        disabled={isUpdatingPayment} 
                                        className="w-full appearance-none border border-gray-200 bg-transparent rounded-md h-[42px] pl-3 pr-12 text-[14px] text-black outline-none focus:border-[#86644c] transition-all cursor-pointer" 
                                    > 
                                        <option value="Unpaid">Unpaid</option> 
                                        <option value="Paid">Paid</option> 
                                    </select> 
                                    <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none"> 
                                        <span className="w-[1px] h-[18px] bg-gray-300 mr-2"></span> 
                                        <svg className="w-4 h-4 text-gray-500 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" /></svg> 
                                    </div> 
                                </div> 
                            )}
                        </div> 
                    </div> 
                </div> 
            </div> 
            
            <div className="self-start rounded-lg border border-blue-100 bg-white/80 px-3 py-2.5 shadow-sm w-full xl:w-auto xl:min-w-[320px] max-w-full"> 
                <div className="flex items-center justify-between gap-3"> 
                    <div className="space-y-1"> 
                        <p className="text-sm font-semibold text-gray-800">Invoice Sent: <span className="text-gray-700 font-medium">{orderData.invoiceDate ? formatDate(orderData.invoiceDate) : 'Not Sent'}</span></p> 
                        <p className="text-sm font-semibold text-gray-800">Invoice Reminder: <span className="text-gray-700 font-medium">{orderData.invoiceReminder ? formatDate(orderData.invoiceReminder) : '—'}</span></p> 
                    </div> 
                    <div className="relative group shrink-0"> 
                        <button type="button" onClick={() => setIsLogModalOpen(true)} className="h-9 w-9 rounded-md border border-[#86644c]/30 text-[#86644c] flex items-center justify-center hover:bg-[#86644c] hover:text-white transition-colors"> 
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16" width="16"><path d="M6 6C6 5.44772 6.44772 5 7 5H17C17.5523 5 18 5.44772 18 6C18 6.55228 17.5523 7 17 7H7C6.44771 7 6 6.55228 6 6Z"></path><path d="M6 10C6 9.44771 6.44772 9 7 9H17C17.5523 9 18 9.44771 18 10C18 10.5523 17.5523 11 17 11H7C6.44771 11 6 10.5523 6 10Z"></path><path d="M7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44771 15 7 15H17C17.5523 15 18 14.5523 18 14C18 13.4477 17.5523 13 17 13H7Z"></path><path d="M6 18C6 17.4477 6.44772 17 7 17H11C11.5523 17 12 17.4477 12 18C12 18.5523 11.5523 19 11 19H7C6.44772 19 6 18.5523 6 18Z"></path><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.34315 3.34315 1 5 1H19C20.6569 1 22 2.34315 22 4V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V4ZM5 3H19C19.5523 3 20 3.44771 20 4V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44771 3 5 3Z"></path></svg> 
                        </button> 
                        <span className="pointer-events-none absolute -top-9 right-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[11px] bg-gray-900 text-white px-2 py-1 rounded">View invoice tracking</span> 
                    </div> 
                </div> 
            </div> 
        </div> 
    );
};



