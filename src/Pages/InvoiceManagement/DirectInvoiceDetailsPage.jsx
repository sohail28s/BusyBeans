import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { getAuthConfig } from '../../utils/orderUtils'; 
import { formatDate , formatMoney } from '../../utils/orderUtils'; 

export const DirectInvoiceDetailsPage = () => { 
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const location = useLocation(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    const isPartnerRoute = location.pathname.includes('/partner/'); 
    
    const [isLoading, setIsLoading] = useState(true); 
    const [orderData, setOrderData] = useState(null); 
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false); 

    // --- Mount: Fetch Data --- 
    const fetchOrderDetails = useCallback(async () => { 
        setIsLoading(true); 
        setIsGlobalLoading(true); 
        try { 
            const apiUrl = isPartnerRoute 
                ? `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/order-details/${id}` 
                : `https://testingbb.trimworldwide.com/api/v1/admin/order-details/${id}`; 
                
            const res = await axios.get(apiUrl, getAuthConfig()); 
            
            if (res.data?.status === 'success' && res.data.data?.order) { 
                setOrderData(res.data.data.order); 
            } else { 
                toast.error("Failed to load invoice data."); 
            } 
        } catch (error) { 
            console.error("Fetch error:", error); 
            toast.error("Error fetching invoice details."); 
        } finally { 
            setIsLoading(false); 
            setIsGlobalLoading(false); 
        } 
    }, [id, isPartnerRoute, setIsGlobalLoading]); 

    useEffect(() => { 
        setTitle(`Invoice / INV00${id}`); 
        setShowProfile(false); 
        fetchOrderDetails(); 
        
        return () => {
            setTitle(''); 
            setShowProfile(true);
        };
    }, [id, setTitle, fetchOrderDetails, setShowProfile]); 

    // --- Top Navbar Actions --- 
    useEffect(() => { 
        if (!orderData) return; 
        
        const reminderButtonLabel = !orderData.invoiceDate ? "Send Invoice" : "Invoice reminder"; 
        
        const handleSendReminder = async () => { 
            const loadingId = toast.loading("Sending..."); 
            try { 
                const payload = isPartnerRoute 
                    ? { order: { partnerOrderId: id, reminder: true, invoiceReminder: Date.now() }, successUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success", cancelUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure" } 
                    : { order: { orderId: id, reminder: true, invoiceReminder: Date.now() }, successUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success", cancelUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure" }; 
                    
                const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/admin/order-management/send-invoice/${id}`, payload, getAuthConfig()); 
                
                if (res.data?.status === 'success') { 
                    const successMsg = res.data?.message || "Sent successfully!"; 
                    toast.update(loadingId, { render: successMsg, type: "success", isLoading: false, autoClose: 3000 }); 
                    await fetchOrderDetails(); 
                } else { 
                    throw new Error(res.data?.message || "Failed to send."); 
                } 
            } catch (err) { 
                const errorMsg = err.response?.data?.message || err.message || "Failed to send."; 
                toast.update(loadingId, { render: errorMsg, type: "error", isLoading: false, autoClose: 3000 }); 
            } 
        }; 

        const handleViewPDF = () => { 
            navigate(isPartnerRoute ? `/direct-invoices/partner/${id}/invoice` : `/direct-invoices/${id}/invoice`); 
        }; 

        setActions( 
            <div className="flex items-center gap-6"> 
                <button onClick={handleSendReminder} className="text-[#3b82f6] hover:text-blue-800 text-[13px] font-medium transition-colors capitalize"> 
                    {reminderButtonLabel} 
                </button> 
                <button onClick={handleViewPDF} className="text-[#3b82f6] hover:text-blue-800 text-[13px] font-medium transition-colors"> 
                    View PDF 
                </button> 
            </div> 
        ); 
        
        return () => setActions(null); 
    }, [orderData, id, setActions, navigate, isPartnerRoute, fetchOrderDetails]); 

    // --- Handlers --- 
    const handlePaymentStatusChange = async (e) => { 
        const newStatus = e.target.value; 
        const mappedStatus = newStatus === 'Paid' ? 'done' : 'pending'; 
        setIsUpdatingPayment(true); 
        const loadingId = toast.loading("Updating payment status..."); 
        
        try { 
            const apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/edit-order'; 
            const payload = isPartnerRoute 
                ? { partnerOrderId: id, orderData: { paymentStatus: mappedStatus } } 
                : { orderId: id, orderData: { paymentStatus: mappedStatus } }; 
                
            const res = await axios.patch(apiUrl, payload, getAuthConfig()); 
            
            if (res.data?.status === 'success' || res.status === 200) { 
                toast.update(loadingId, { render: "Payment status updated!", type: "success", isLoading: false, autoClose: 2000 }); 
                await fetchOrderDetails(); 
            } else { 
                throw new Error("Failed"); 
            } 
        } catch (error) { 
            console.error(error); 
            toast.update(loadingId, { render: "Error updating payment status.", type: "error", isLoading: false, autoClose: 3000 }); 
        } finally { 
            setIsUpdatingPayment(false); 
        } 
    }; 

    const handleUpdateNavigation = () => { 
        navigate(isPartnerRoute ? `/direct-invoices/partner/${id}/add-invoice` : `/direct-invoices/${id}/add-invoice`); 
    }; 

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-sans">Loading Invoice Details...</div>; 
    if (!orderData) return <div className="p-8 text-center text-red-500 font-sans">Invoice not found.</div>; 

    // --- Core Data Variables (CRITICAL FOR RENDER) ---
    const currentPaymentValue = (orderData.paymentStatus === 'done' || orderData.paymentStatus === 'paid') ? 'Paid' : 'Unpaid'; 
    const isBankCheck = orderData.paymentMethod?.toLowerCase() === 'bank check'; 
    const productsList = (orderData.items || []).filter(item => item.type !== 'charges'); 
    const chargesList = (orderData.items || []).filter(item => item.type === 'charges'); 
    
    const companyLabel = isPartnerRoute ? 'Local Partner Name' : 'Company Name'; 
    const companyName = isPartnerRoute ? (orderData.salesRep?.srName || orderData.salesRepName) : (orderData.companyName || orderData.customerName); 
    const companyLink = isPartnerRoute ? `/sale-representative/details/${orderData.salesRep?.id}` : `/customers/${orderData.user?.id}`; 

    // --- Dynamic Address Extraction Logic ---
    let deliverToAddr = {};
    let invoiceToAddr = {};
    let deliverToPhone = '';
    let invoiceToPhone = '';
    let invoiceToEmail = '';
    let deliverToEmail = '';

    if (isPartnerRoute) {
        // Partner Logic
        deliverToAddr = orderData.salesRep?.billingAddresses?.[0] || {};
        invoiceToAddr = orderData.salesRep || {}; // Contains address, city, state, country
        const formattedPhone = `${orderData.salesRep?.countryCode || ''} ${orderData.salesRep?.phoneNumber || ''}`.trim();
        deliverToPhone = formattedPhone;
        invoiceToPhone = formattedPhone;
    } else {
        // Customer Logic
        deliverToAddr = orderData.address || {};
        invoiceToAddr = orderData.address || {};
        deliverToPhone = orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber || '';
        invoiceToPhone = orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber || '';
        deliverToEmail = orderData.user?.email || orderData.salesRep?.email || '';
        invoiceToEmail = orderData.user?.emailToSendInvoices || orderData.user?.email || orderData.salesRep?.email || '';
    }

    // --- Helper to Hide Null Rows ---
    const DetailRow = ({ label, value, isLink = false, linkUrl = "#", capitalize = false }) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <div className={`flex items-center gap-5 border-b ${capitalize ? 'capitalize' : ''}`}> 
                <p className="w-28 text-gray-900">{label}</p> 
                {isLink ? (
                    <Link to={linkUrl} className="text-blue-500 cursor-pointer">{value}</Link> 
                ) : (
                    <p className="text-gray-900">{value}</p> 
                )}
            </div>
        );
    };

 // --- UPDATED Dynamic Status Image Logic --- 
const renderStatusImage = () => { 
    const { invoiceDate, orderCurrentStatus, paymentStatus, invoiceNumber, dispatchDate } = orderData; 
    
    const isInvoiceSent = !!invoiceDate; 
    const isPaid = paymentStatus === 'done' || paymentStatus === 'paid'; 
    const isDispatched = orderCurrentStatus === 'Dispatched' || orderCurrentStatus === 'Shipped'; 
    
    if (!isInvoiceSent && !isDispatched) return null; 
    
    // Notice the empty <> fragment here instead of a flex div!
    return ( 
        <> 
            {isInvoiceSent && ( 
                <div className="max-w-32 flex flex-col items-center text-xs text-gray-500 mt-6 "> 
                    <img 
                        src={isPaid ? '/Images/invoicePaid.png' : '/Images/invoiceUnpaid.png'} 
                        alt={isPaid ? "Invoice Paid" : "Invoice Unpaid"} 
                        className="w-[120px] h-[120px] object-contain mb-2" 
                        onError={(e) => { e.target.style.display='none' }} 
                    /> 
                    <span className="font-medium"> 
                        {invoiceNumber || '-'} 
                    </span> 
                    <span> 
                        {formatDate(invoiceDate)} 
                    </span> 
                </div> 
            )} 

            {isDispatched && ( 
                <div className="max-w-32 flex flex-col items-center text-xs text-gray-500 mt-6 mx-auto"> 
                    <img 
                        src="/Images/dispatch.png" 
                        alt={orderCurrentStatus} 
                        className="w-[120px] h-[120px] object-contain mb-2" 
                        onError={(e) => { e.target.style.display='none' }} 
                    /> 
                    <span className="font-medium "> 
                        Dispatched 
                    </span> 
                    <span> 
                        {dispatchDate ? formatDate(dispatchDate) : formatDate(invoiceDate)} 
                    </span> 
                </div> 
            )} 
        </> 
    ); 
};

    const isInvoiceAvailable = !!orderData.invoiceDate;
    const isDispatchedAvailable = orderData.orderCurrentStatus === 'Dispatched' || orderData.orderCurrentStatus === 'Shipped';
    const bothAvailable = isInvoiceAvailable && isDispatchedAvailable;

    return ( 
        <div className="w-full max-w-[1200px] mx-auto p-8 font-sans text-[14px] text-gray-800 bg-white"> 
            
            <div className="flex justify-end mb-6"> 
                <button onClick={handleUpdateNavigation} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm" > 
                    {orderData.invoiceDate ? "Update Invoice" : "Add Invoice"} 
                </button> 
            </div> 
            
            {/* Banner Section */}
            <div className="w-full bg-blue-50 flex flex-col md:flex-row justify-between rounded-md px-4 lg:px-6 py-6 mb-8 font-sans text-sm"> 
                <div className="flex gap-x-2"> 
                    <div className="space-y-4"> 
                        <p className="text-gray-900">Optional actions:</p> 
                        <div className="flex gap-x-2 items-center"> 
                            <p className="font-semibold text-gray-900">Record a payment:</p> 
                            <div className="flex"> 
                                {isBankCheck ? ( 
                                    <div className="relative border border-gray-300 rounded-[4px] bg-white w-[140px] flex items-center h-[38px] cursor-pointer hover:border-gray-400 transition-colors">
                                        <select 
                                            value={currentPaymentValue} 
                                            onChange={handlePaymentStatusChange} 
                                            disabled={isUpdatingPayment} 
                                            className="appearance-none w-full h-full bg-transparent px-3 outline-none text-gray-800 text-[15px] cursor-pointer z-10" 
                                        > 
                                            <option value="Unpaid">Unpaid</option> 
                                            <option value="Paid">Paid</option> 
                                        </select> 
                                        <div className="absolute right-0 flex items-center pr-2 text-gray-400 pointer-events-none border-l border-gray-200 h-[70%] pl-2 ">
                                            <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="text-gray-400">
                                                <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" fill="currentColor"></path>
                                            </svg>
                                        </div>
                                    </div>
                                ) : ( 
                                    <div className="bg-[#FDE24F] text-black rounded-lg py-2 px-4 font-medium outline-none"> 
                                        {currentPaymentValue} 
                                    </div> 
                                )} 
                            </div> 
                        </div> 
                    </div> 
                </div> 

                <div className="flex flex-col gap-1 text-left md:text-right mt-4 md:mt-0"> 
                    <p className="font-semibold text-gray-900"> 
                        Invoice: {orderData.invoiceDate ? formatDate(orderData.invoiceDate) : "Not Sent"} 
                    </p> 
                    {(orderData.invoiceDate && orderData.invoiceReminder) && ( 
                        <p className="font-semibold text-gray-900">
                            Invoice Reminder: {formatDate(orderData.invoiceReminder)}
                        </p> 
                    )} 
                </div> 
            </div> 

            {/* Address and Details Section */}
            <div className="w-full grid xl:grid-cols-2 gap-10 xl:gap-20 py-4 px-4 2xl:px-8 space-y-4 font-sans border border-gray-200 bg-white shadow-sm rounded-sm mb-8"> 
                <div className="w-full [&>div]:h-10 text-sm"> 
                    <DetailRow label="Ordered On" value={orderData.on || orderData.createdAt ? formatDate(orderData.on || orderData.createdAt) : null} />
                    <DetailRow label={companyLabel} value={companyName} isLink={true} linkUrl={companyLink} capitalize={true} />
                    <DetailRow label="Created By" value={orderData.createdBy} capitalize={true} />
                    
                    {!isPartnerRoute && orderData.salesRep && (
                        <DetailRow 
                            label="Local Partner" 
                            value={orderData.salesRep.srName} 
                            isLink={true} 
                            linkUrl={`/sale-representative/details/${orderData.salesRep.id}`} 
                            capitalize={true} 
                        />
                    )}

                    <DetailRow label="P.O. #" value={orderData.poNumber} />
                    <DetailRow label="Invoice No" value={orderData.invoiceNumber} />
                    
                    {orderData.paymentIntentId && (
                        <div className="flex items-center gap-2 border-b">
                            <p className="w-32 text-gray-900">Payment Intent ID</p>
                            <div className="flex items-center gap-2">
                                <button type="button" className="underline text-blue-600 hover:text-blue-800 transition">
                                    {orderData.paymentIntentId}
                                </button>
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer text-gray-500 hover:text-black" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </div>
                        </div>
                    )}

                    <DetailRow label="Shipping Company" value={orderData.shippingCompany} />
                    <DetailRow label="Frequency:" value={orderData.frequency ? orderData.frequency.replace('-', ' ') : null} capitalize={true} />
                    <DetailRow label="Invoice Date:" value={orderData.invoiceDate ? formatDate(orderData.invoiceDate) : null} />
                    <DetailRow label="Invoice Paid Date:" value={orderData.invoicePaidDate ? formatDate(orderData.invoicePaidDate) : null} />
                    <DetailRow label="Pullout Date:" value={orderData.pulloutDate ? formatDate(orderData.pulloutDate) : null} />
                </div> 

                <div className="w-full grid grid-cols-2 gap-10 text-xs lg:text-sm"> 
                    <div> 
                        <h6 className="font-semibold text-gray-900">Deliver To</h6> 
                        <div className="items-center uppercase text-gray-900"> 
                            {deliverToAddr.addressLineOne && <p>{deliverToAddr.addressLineOne}</p>}
                            {deliverToAddr.addressLineTwo && <p>{deliverToAddr.addressLineTwo}</p>}
                            {(deliverToAddr.town || deliverToAddr.state || deliverToAddr.zipCode) && (
                                <p>
                                    {deliverToAddr.town ? deliverToAddr.town + (deliverToAddr.state || deliverToAddr.zipCode ? ', ' : '') : ''}
                                    {deliverToAddr.state ? deliverToAddr.state + ' ' : ''}
                                    {deliverToAddr.zipCode || ''}
                                </p>
                            )}
                            <p>{deliverToAddr.country || 'United States'}</p> 
                            {deliverToPhone && <p>Phone: {deliverToPhone}</p>}
                        </div> 
                        {deliverToEmail && <div className="lowercase break-all text-gray-900">{deliverToEmail}</div>}
                        <span className="text-blue-500 text-xs cursor-pointer">Edit</span> 
                    </div> 

                    <div className="uppercase"> 
                        <div className="font-bold capitalize text-gray-900">Invoice To</div> 
                        {companyName && <div className="text-gray-900">{companyName}</div>}
                        <div className="text-gray-900">
                        {isPartnerRoute ? (
                            <>
                                {invoiceToAddr.address && <div>{invoiceToAddr.address}</div>}
                                {(invoiceToAddr.city || invoiceToAddr.state || invoiceToAddr.zipCode) && (
                                    <div>
                                        {invoiceToAddr.city ? invoiceToAddr.city + (invoiceToAddr.state || invoiceToAddr.zipCode ? ', ' : '') : ''}
                                        {invoiceToAddr.state ? invoiceToAddr.state + (invoiceToAddr.zipCode ? ', ' : '') : ''}
                                        {invoiceToAddr.zipCode || ''}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {(invoiceToAddr.addressLineOne || invoiceToAddr.addressLineTwo) && (
                                    <div>
                                        {invoiceToAddr.addressLineOne || ''}{invoiceToAddr.addressLineTwo ? ', ' + invoiceToAddr.addressLineTwo : ''}
                                    </div>
                                )}
                                {(invoiceToAddr.town || invoiceToAddr.state || invoiceToAddr.zipCode) && (
                                    <div>
                                        {invoiceToAddr.town ? invoiceToAddr.town + (invoiceToAddr.state || invoiceToAddr.zipCode ? ', ' : '') : ''}
                                        {invoiceToAddr.state ? invoiceToAddr.state + (invoiceToAddr.zipCode ? ', ' : '') : ''}
                                        {invoiceToAddr.zipCode || ''}
                                    </div>
                                )}
                            </>
                        )}
                        <div>{invoiceToAddr.country || 'United States'}</div> 
                        {invoiceToPhone && <div>{invoiceToPhone}</div>}
                        </div>
                        {invoiceToEmail && <div className="lowercase break-all text-gray-900">{invoiceToEmail}</div>}
                        <span className="text-blue-500 text-xs cursor-pointer capitalize">Edit</span> 
                    </div> 

                        {renderStatusImage()} 
                
                </div> 
            </div> 


            {/* Bottom Table Section */}
            <div className="w-full overflow-auto border border-gray-200 bg-white shadow-sm rounded-sm"> 
                
            {(orderData.note || orderData.comments) && ( 
                <div className="w-[97%] bg-[#e9c607] rounded p-3 mb-6 flex items-center mt-4 mx-4"> 
                    <span className="text-black font-medium">{orderData.note || orderData.comments}</span> 
                </div> 
            )} 
                <table className="w-full border border-gray-200 text-sm border-collapse min-w-[750px] font-sans"> 
                    <thead className="bg-gray-100"> 
                        <tr> 
                            <th className="py-2 px-2 text-left border border-gray-200 text-gray-900">Code</th> 
                            <th className="py-2 px-2 text-left border border-gray-200 text-gray-900">SKU</th> 
                            <th className="py-2 px-2 text-left border border-gray-200 text-gray-900">Name</th> 
                            <th className="py-2 px-2 text-left border border-gray-200 text-gray-900">Grind</th> 
                            <th className="py-2 px-2 text-center border border-gray-200 text-gray-900">Qty.</th> 
                            <th className="py-2 px-2 text-center border border-gray-200 text-gray-900">Discount</th> 
                            <th className="py-2 px-2 text-center border border-gray-200 text-gray-900">Invoiced</th> 
                            <th className="py-2 px-2 text-center border border-gray-200 text-gray-900">Paid</th> 
                            <th className="py-2 px-2 text-center border border-gray-200 text-gray-900">Dispatched</th> 
                            <th className="py-2 px-2 text-right border border-gray-200 text-gray-900">Unit $</th> 
                            <th className="py-2 px-2 text-right border border-gray-200 text-gray-900">Total $</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        {productsList.map(item => ( 
                            <tr key={item.id} className="bg-white"> 
                                <td className="py-2 px-2 border border-gray-200 text-gray-800">{item.productCode || ''}</td> 
                                <td className="py-2 px-2 border border-gray-200 text-gray-800">{item.supplierSku || item.sku || ''}</td> 
                                <td className="py-2 px-2 font-semibold border border-gray-200 text-black">{item.product || item.productName || ''}</td> 
                                <td className="py-2 px-2 border border-gray-200 text-gray-800">{item.grind || ''}</td> 
                                <td className="py-2 px-2 text-center border border-gray-200 text-gray-800">{item.qty || '1'}</td> 
                                <td className="py-2 px-2 text-center border border-gray-200 text-gray-800">{item.discount || '0.00'}</td> 
                                <td className="py-2 px-2 text-center border border-gray-200 text-gray-800">{orderData.invoicePdf ? 'Yes' : 'No'}</td> 
                                <td className="py-2 px-2 text-center border border-gray-200 text-gray-800 capitalize">{orderData.paymentStatus === 'done' ? 'Paid' : 'Unpaid'}</td> 
                                <td className="py-2 px-2 text-center border border-gray-200 text-gray-800">{orderData.orderCurrentStatus === 'Dispatched' ? 'Yes' : 'Not Yet'}</td> 
                                <td className="py-2 px-2 text-right border border-gray-200 text-gray-800">{formatMoney(item.price)}</td> 
                                <td className="py-2 px-2 text-right border border-gray-200 text-gray-800">{formatMoney(parseFloat(item.price || 0) * parseInt(item.qty || 1))}</td> 
                            </tr> 
                        ))} 
                        {chargesList.map(charge => ( 
                            <tr key={`charge-${charge.id}`} className="bg-orange-50/30"> 
                                <td className="py-2 px-2 border border-gray-200 text-gray-500 italic" colSpan="2"></td> 
                                <td className="py-2 px-2 font-semibold border border-gray-200 text-gray-800">{charge.productName || charge.product || ''}</td> 
                                <td className="py-2 px-2 border border-gray-200 text-center">-</td> 
                                <td className="py-2 px-2 text-center border border-gray-200 text-gray-800">{charge.qty || '1'}</td> 
                                <td colSpan="4" className="border border-gray-200"></td> 
                                <td className="py-2 px-2 text-right border border-gray-200 text-gray-800">{formatMoney(charge.price)}</td> 
                                <td className="py-2 px-2 text-right border border-gray-200 text-gray-800">{formatMoney(parseFloat(charge.price || 0) * parseInt(charge.qty || 1))}</td> 
                            </tr> 
                        ))} 
                        <tr className="bg-white"> 
                            <td colSpan="9" className="border border-gray-200"></td> 
                            <td className="py-2 px-2 text-right font-semibold border border-gray-200 text-black">Sub-Total</td> 
                            <td className="py-2 px-2 text-right font-semibold border border-gray-200 text-black">{formatMoney(orderData.subTotal)}</td> 
                        </tr> 
                        <tr className="bg-white"> 
                            <td colSpan="9" className="border border-gray-200"></td> 
                            <td className="py-2 px-2 text-right border border-gray-200 text-black">Shipping Charges</td> 
                            <td className="py-2 px-2 text-right border border-gray-200 text-black">{formatMoney(orderData.shippingCharges)}</td> 
                        </tr> 
                        <tr className="bg-white"> 
                            <td colSpan="9" className="border border-gray-200"></td> 
                            <td className="py-2 px-2 text-right font-bold border border-gray-200 text-black whitespace-nowrap">Total USD ({orderData.items?.length || 0} items)</td> 
                            <td className="py-2 px-2 text-right font-bold border border-gray-200 text-black">{formatMoney(orderData.totalBill)}</td> 
                        </tr> 
                        <tr className="bg-white"> 
                            <td colSpan="8" className="py-2 px-2 text-left font-medium border border-gray-200 text-gray-800"> 
                                Total weight: {orderData.totalWeight || '0.00'} lbs 
                            </td> 
                        </tr> 
                        {orderData.paymentMethod && ( 
                            <tr className="bg-white"> 
                                <td colSpan="8" className="py-2 px-2 text-left font-medium border border-gray-200 text-gray-800"> 
                                    Payment Method: <span className="uppercase"> {orderData.paymentMethod}</span> 
                                </td> 
                            </tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

        </div> 
    ); 
}; 

export default DirectInvoiceDetailsPage;