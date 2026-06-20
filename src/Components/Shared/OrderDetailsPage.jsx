import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';

import { InvoiceActivityModal } from './OrderDetails/InvoiceActivityModel';
import { ActionModalOrders } from './OrderDetails/Actionmodal';
import { InfoRow } from './OrderDetails/InfoRow';
import { ProgressTracker } from './OrderDetails/ProgressTracker';
import { OrderHeaderActions } from './OrderDetails/OrderHeaderActions';
import { OrderBanner } from './OrderDetails/OrderBanner';
import { EmailLogsAccordion } from './OrderDetails/EmailLogsAccordion';
import { OrderInfoSection } from './OrderDetails/OrderInfoSection';
import { OrderItemsTable } from './OrderDetails/OrderItemsTable';
import { ShipOrderModal } from './OrderDetails/ShipOrderModal';
import { getAuthConfig, formatDate, formatDateWithTime, formatMoney } from '../../utils/orderUtils';


export const RegularOrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Global Store Actions
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const isPartnerRoute = location.pathname.includes('/partnerOrders/');

    const [isLoading, setIsLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);
    const [emailLogs, setEmailLogs] = useState([]);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [showEmailsAccordion, setShowEmailsAccordion] = useState(false);

    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [shipData, setShipData] = useState({ companyName: 'UPS', trackingNumber: '' });
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    useEffect(() => {
        setShowProfile(false);
        setIsGlobalLoading(true);
        return () => {
            setShowProfile(true);
            setIsGlobalLoading(false);
        };
    }, [setShowProfile, setIsGlobalLoading]);

    const fetchOrderDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiUrl = isPartnerRoute
                ? `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/order-details/${id}`
                : `https://testingbb.trimworldwide.com/api/v1/admin/order-details/${id}`;
            const res = await axios.get(apiUrl, getAuthConfig());

            if (res.data?.status === 'success' && res.data.data?.order) {
                setOrderData(res.data.data.order);
            } else {
                toast.error("Failed to load order data.");
            }

            const logUrl = isPartnerRoute
                ? `https://testingbb.trimworldwide.com/api/v1/admin/order-management/email-log?partnerOrderId=${id}`
                : `https://testingbb.trimworldwide.com/api/v1/admin/order-management/email-log?orderId=${id}`;
            const logRes = await axios.get(logUrl, getAuthConfig());

            if (logRes.data?.status === 'success') {
                setEmailLogs(logRes.data.data?.emailLogs || []);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching order details.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    }, [id, isPartnerRoute, setIsGlobalLoading]);

    useEffect(() => {
        if (orderData) {
            const titleNode = (
                <div className="text-lg font-sans font-semibold flex items-center gap-2 [&>p]:cursor-pointer [&>p]:whitespace-nowrap">
                    <p  onClick={() => navigate('/orders/all-orders')}>Order /</p>
                    <span>{id}</span>
                    <p className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${orderData.orderCurrentStatus === 'Cancelled' ? 'bg-red-500' : 'bg-[#219653]'}`}>
                        {orderData.orderCurrentStatus}
                    </p>
                </div>
            );
            setTitle(titleNode);

            const isPaid = orderData.paymentStatus === 'done' || orderData.paymentStatus === 'paid';
            const isShipped = orderData.statusId >= 4;
            const showSendReceipt = isPaid && isShipped;
            const hasInvoice = !!orderData.invoiceDate;
            let invoiceActionLabel = hasInvoice ? "Send Reminder" : "Send Invoice";
            if (showSendReceipt) invoiceActionLabel = "Send Receipt";
            const showPulloutButton = isPartnerRoute && !isPaid;
            const handlePulloutPayment = async () => {
                const loadingId = toast.loading("Pulling payment from bank...");
                try {
                    const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/admin/partner-order/pull-payment-from-bank/${id}`, {}, getAuthConfig());
                    if (res.data?.status === 'success') {
                        toast.update(loadingId, { render: res.data?.message || "Payment pulled successfully!", type: "success", isLoading: false, autoClose: 2000 });
                        fetchOrderDetails();
                    } else {
                        throw new Error(res.data?.message || "Failed to pull payment.");
                    }
                } catch (error) {
                    toast.update(loadingId, { render: error.response?.data?.message || error.message || "Failed to pull payment.", type: "error", isLoading: false, autoClose: 3000 });
                }
            };

            const handleEmailAction = async () => {
                const loadingId = toast.loading("Sending...");
                try {
                    if (showSendReceipt) {
                        const payload = {
                            orderId: String(id),
                            orderType: isPartnerRoute ? "local-partner" : "customer",
                            emailType: "paid-invoice"
                        };
                        const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/admin/order-management/email-helper`, payload, getAuthConfig());
                        if (res.data?.status === 'success') {
                            toast.update(loadingId, { render: "Receipt sent successfully!", type: "success", isLoading: false, autoClose: 2000 });
                            fetchOrderDetails();
                        } else throw new Error(res.data?.message || "Failed to send receipt.");
                    } else {
                        const dateKey = hasInvoice ? "invoiceReminder" : "invoiceDate";
                        const payload = isPartnerRoute ? {
                            order: { partnerOrderId: id, reminder: false, [dateKey]: Date.now() },
                            successUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success",
                            cancelUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure"
                        } : {
                            order: { orderId: id, reminder: false, [dateKey]: Date.now() },
                            successUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success",
                            cancelUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure"
                        };
                        const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/admin/order-management/send-invoice/${id}`, payload, getAuthConfig());
                        if (res.data?.status === 'success') {
                            toast.update(loadingId, { render: res.data?.message || "Sent successfully!", type: "success", isLoading: false, autoClose: 2000 });
                            fetchOrderDetails();
                        } else throw new Error(res.data?.message || "Failed to send.");
                    }
                } catch (error) {
                    toast.update(loadingId, { render: error.response?.data?.message || error.message || "Failed to send.", type: "error", isLoading: false, autoClose: 3000 });
                }
            };

            const handleViewPdf = () => navigate(isPartnerRoute ? `/orders/partnerOrders/detail/${id}/invoice` : `/orders/details/${id}/invoice`);

            setActions(
                <div className="flex items-center gap-4 text-[#3b82f6] text-[13px] font-medium">
                    {/* Only show Pullout if it's a partner order AND unpaid */}
                    {showPulloutButton && (
                        <>
                            <button onClick={handlePulloutPayment} className="hover:underline">Pullout</button>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    <button onClick={handleEmailAction} className="hover:underline">{invoiceActionLabel}</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={handleViewPdf} className="hover:underline">View PDF</button>
                </div>
            );
        } else {
            setTitle(`Order / ${id}`);
        }

        return () => {
            setTitle('');
            setActions(null);
        };
    }, [id, orderData, setTitle, setActions, isPartnerRoute, fetchOrderDetails, navigate]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // --- Handlers ---
    const handleAssignSupplier = async () => {
        const loadingId = toast.loading("Dispatching to Supplier...");
        try {
            const suppId = orderData.supplier?.id || 16;
            const payload = isPartnerRoute
                ? { partnerOrderId: id, orderData: { supplierId: suppId, statusId: 2 } }
                : { orderId: id, orderData: { supplierId: suppId, statusId: 2 } };

            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/assign-supplier`, payload, getAuthConfig());
            if (res.data?.status === 'success') {
                toast.update(loadingId, { render: res.data?.message || "Dispatched to Supplier!", type: "success", isLoading: false, autoClose: 2000 });
                fetchOrderDetails();
            } else throw new Error(res.data?.message || "Failed");
        } catch (error) {
            toast.update(loadingId, { render: error.response?.data?.message || error.message || "Failed to dispatch.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleAcknowledgeSupplier = async () => {
        const loadingId = toast.loading("Acknowledging Supplier...");
        try {
            const payload = isPartnerRoute
                ? { partnerOrderId: parseInt(id), orderData: { statusId: 3 } }
                : { orderId: parseInt(id), orderData: { statusId: 3 } };

            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/supplier-acknowledgement`, payload, getAuthConfig());
            if (res.data?.status === 'success') {
                toast.update(loadingId, { render: res.data?.message || "Supplier Acknowledged!", type: "success", isLoading: false, autoClose: 2000 });
                fetchOrderDetails();
            } else throw new Error(res.data?.message || "Failed");
        } catch (error) {
            toast.update(loadingId, { render: error.response?.data?.message || error.message || "Failed to acknowledge.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleShipOrder = async () => {
        if (!shipData.trackingNumber || !shipData.companyName) return toast.warning("Please fill all shipping fields.");

        const loadingId = toast.loading("Shipping Order...");
        setIsShipModalOpen(false);

        try {
            const dispatchPayload = isPartnerRoute
                ? { partnerOrderId: parseInt(id), orderData: { statusId: 4, trackingNumber: shipData.trackingNumber, shippingCompany: shipData.companyName } }
                : { orderId: parseInt(id), orderData: { statusId: 4, trackingNumber: shipData.trackingNumber, shippingCompany: shipData.companyName } };

            await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/order-dispatch`, dispatchPayload, getAuthConfig());

            const deliverPayload = isPartnerRoute
                ? { partnerOrderId: parseInt(id), orderData: { statusId: 5, orderStatus: "Acknowledged" } }
                : { orderId: parseInt(id), orderData: { statusId: 5, orderStatus: "Acknowledged" } };

            await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/order-deliver`, deliverPayload, getAuthConfig());

            toast.update(loadingId, { render: "Order Shipped Successfully!", type: "success", isLoading: false, autoClose: 2000 });
            fetchOrderDetails();
        } catch (error) {
            toast.update(loadingId, { render: error.response?.data?.message || "Failed to ship order.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleCancelOrder = async () => {
        setIsProcessingAction(true);
        const loadingId = toast.loading("Canceling Order...");

        try {
            const payload = isPartnerRoute
                ? { partnerOrderId: String(id), orderData: { statusId: 6, paymentStatus: "pending", totalBill: String(orderData.totalBill || "0.00") } }
                : { orderId: String(id), orderData: { statusId: 6, paymentStatus: "pending", totalBill: String(orderData.totalBill || "0.00") } };

            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/order-cancel`, payload, getAuthConfig());
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Order Cancelled!", type: "success", isLoading: false, autoClose: 2000 });
                setIsCancelModalOpen(false);
                fetchOrderDetails();
            } else throw new Error("Failed");
        } catch (error) {
            toast.update(loadingId, { render: `Cancel Failed`, type: "error", isLoading: false, autoClose: 4000 });
        } finally {
            setIsProcessingAction(false);
        }
    };

    const handleDeleteOrder = async () => {
        setIsProcessingAction(true);
        const loadingId = toast.loading("Deleting Order...");

        try {
            const res = await axios.delete(`https://testingbb.trimworldwide.com/api/v1/admin/order-management/delete-order/${id}`, getAuthConfig());
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Order Deleted!", type: "success", isLoading: false, autoClose: 2000 });
                setIsDeleteModalOpen(false);
                navigate(isPartnerRoute ? '/orders/partnerOrders' : '/orders');
            } else throw new Error("Failed");
        } catch (error) {
            toast.update(loadingId, { render: `Delete Failed`, type: "error", isLoading: false, autoClose: 4000 });
            setIsProcessingAction(false);
        }
    };

    const handlePaymentStatusChange = async (e) => {
        const mappedStatus = e.target.value === 'Paid' ? 'done' : 'pending';
        setIsUpdatingPayment(true);
        const loadingId = toast.loading("Updating payment status...");

        try {
            const payload = isPartnerRoute
                ? { partnerOrderId: id, orderData: { paymentStatus: mappedStatus } }
                : { orderId: id, orderData: { paymentStatus: mappedStatus } };

            const res = await axios.patch('https://testingbb.trimworldwide.com/api/v1/admin/edit-order', payload, getAuthConfig());
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Status updated!", type: "success", isLoading: false, autoClose: 2000 });
                fetchOrderDetails();
            } else throw new Error("Failed");
        } catch (error) {
            toast.update(loadingId, { render: "Error updating status.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    const handleInvoiceNavigation = () => navigate(isPartnerRoute ? `/orders/partnerOrders/detail/${id}/add-invoice` : `/orders/detail/${id}/add-invoice`);

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-sans">Loading Order Details...</div>;
    if (!orderData) return <div className="p-8 text-center text-red-500 font-sans">Order not found.</div>;

    // --- Data Variables ---
    const currentPaymentValue = (orderData.paymentStatus === 'done' || orderData.paymentStatus === 'paid') ? 'Paid' : 'Unpaid';
    const isShippedOrBeyond = orderData.statusId >= 4;
    const isCancelled = orderData.statusId === 6;

    const supplierName = orderData.supplier?.supplierName || orderData.supplier?.name;
    const localPartnerName = orderData.salesRep?.srName || orderData.salesRepName;
    const companyName = orderData.companyName || orderData.customerName;

    const productsList = (orderData.items || []).filter(item => item.type !== 'charges');
    const chargesList = (orderData.items || []).filter(item => item.type === 'charges');

    return (
        <div className="w-full mx-auto py-8 px-12 font-sans text-[14px] text-gray-800 bg-white relative">
            <OrderHeaderActions
                orderData={orderData}
                isCancelled={isCancelled}
                isShippedOrBeyond={isShippedOrBeyond}
                handleAssignSupplier={handleAssignSupplier}
                handleAcknowledgeSupplier={handleAcknowledgeSupplier}
                setIsShipModalOpen={setIsShipModalOpen}
                handleInvoiceNavigation={handleInvoiceNavigation}
                setIsCancelModalOpen={setIsCancelModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
            />

            <OrderBanner
                orderData={orderData}
                currentPaymentValue={currentPaymentValue}
                handlePaymentStatusChange={handlePaymentStatusChange}
                isUpdatingPayment={isUpdatingPayment}
                setIsLogModalOpen={setIsLogModalOpen}
                isPartnerRoute={isPartnerRoute}
            />

            <EmailLogsAccordion
                emailLogs={emailLogs}
                showEmailsAccordion={showEmailsAccordion}
                setShowEmailsAccordion={setShowEmailsAccordion}
            />

            <OrderInfoSection
                orderData={orderData}
                supplierName={supplierName}
                localPartnerName={localPartnerName}
                companyName={companyName}
                isPartnerRoute={isPartnerRoute}
            />

            {/* <ProgressTracker histories={orderData.orderHistories || []} /> */}

            <ProgressTracker 
    histories={orderData.orderHistories} 
    currentStatus={orderData.orderCurrentStatus} 
/>

            <OrderItemsTable
                orderData={orderData}
                productsList={productsList}
                chargesList={chargesList}
                isPartnerRoute={isPartnerRoute}
            />

            {/* Modals */}
            <InvoiceActivityModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                orderInfo={orderData}
            />

            <ActionModalOrders
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelOrder}
                title="Cancel Order"
                warningText="This action is permanent."
                confirmText="Are you sure you want to permanently cancel this Order?"
                buttonText="Cancel Order"
                isLoading={isProcessingAction}
            />

            <ActionModalOrders
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteOrder}
                title="Delete Order"
                warningText="This action is permanent."
                confirmText="Are you sure you want to permanently delete this Order?"
                buttonText="Delete Order"
                isLoading={isProcessingAction}
            />

            <ShipOrderModal
                isOpen={isShipModalOpen}
                onClose={() => setIsShipModalOpen(false)}
                shipData={shipData}
                setShipData={setShipData}
                handleShipOrder={handleShipOrder}
            />
        </div>
    );
};

export default RegularOrderDetailsPage;