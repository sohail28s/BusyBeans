import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import { InvoiceItemsSection } from '../../Components/InvoiceManagement/CreateInvoice/InvoiceItemsSection';
import { AddProductModal } from '../../Components/InvoiceManagement/CreateInvoice/AddProductModal';
import { getAuthConfig } from '../../utils/orderUtils';

const initialFormData = {
    invoiceNumber: '',
    poNumberBottom: '',
    invoiceDate: '',
    termDays: '30',
    dueDate: '',
    comments: '',
    emailCustomer: false,
    items: [],
    extraCharges: [],
    shippingCharges: 0,
    calcMode: 'manual',
    selectedCardId: '',
    attemptImmediatePayment: false,
    otherPaymentOptions: ''
};

export const UpdateInvoicePage = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const isPartnerRoute = location.pathname.includes('/partner');
    const isRegularOrder = location.pathname.includes('/orders/');

    const [isLoading, setIsLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);
    const [paymentCards, setPaymentCards] = useState([]);
    const [shippingTiers, setShippingTiers] = useState([]);
    const [invoiceToAddress, setInvoiceToAddress] = useState('');
    const [formData, setFormData] = useState(initialFormData);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    useEffect(() => {
        const idDisplay = isRegularOrder ? id : `INV00${id}`;
        const typeLabel = isRegularOrder ? 'Order' : 'Invoice';

        setTitle(`${typeLabel} / ${idDisplay} / Loading...`);
        setShowProfile(false);

        const fetchAllData = async () => {
            setIsLoading(true);
            setIsGlobalLoading(true);

            try {
                // 1. Fetch Shipping Tiers
                axios.get('https://testingbb.trimworldwide.com/api/v1/admin/shipping-charges-list', getAuthConfig())
                    .then(res => {
                        if (res.data?.status === 'success') {
                            setShippingTiers(res.data.data.data || []);
                        }
                    })
                    .catch(err => console.error("Tiers fetch error:", err));

                // 2. Fetch Order Details
                const apiUrl = isPartnerRoute 
                    ? `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/order-details/${id}` 
                    : `https://testingbb.trimworldwide.com/api/v1/admin/order-details/${id}`;

                const res = await axios.get(apiUrl, getAuthConfig());

                if (res.data?.status === 'success' && res.data.data?.order) {
                    const order = res.data.data.order;
                    setOrderData(order);

                    const actionLabel = order.invoiceDate ? 'Update Invoice' : 'New Invoice';
                    setTitle(`${typeLabel} / ${idDisplay} / ${actionLabel}`);

                    // 3. FETCH PAYMENT CARDS (Only for Customer/Non-Partner Routes)
                    let fetchedCards = [];
                    if (!isPartnerRoute && (order.userId || order.user?.id)) {
                        const customerId = order.userId || order.user?.id;
                        try {
                            const cardsUrl = `https://testingbb.trimworldwide.com/api/v1/admin/customer-management/payment-cards/${customerId}`;
                            const cardsRes = await axios.get(cardsUrl, getAuthConfig());
                            if (cardsRes.data?.status === 'success') {
                                fetchedCards = cardsRes.data.data.cards || [];
                            }
                        } catch (err) {
                            console.error("Failed to fetch customer cards:", err);
                        }
                    }
                    setPaymentCards(fetchedCards);

                    // Separate products and extra charges from the fetched items
                    const fetchedItems = order.items || [];
                    const productsList = fetchedItems
                        .filter(item => item.type !== 'charges')
                        .map(item => ({
                            ...item,
                            id: item.productId || item.id,
                            name: item.product || item.productName || item.name,
                            selected: true 
                        }));

                    const extraChargesList = fetchedItems
                        .filter(item => item.type === 'charges')
                        .map(charge => ({
                            ...charge,
                            id: charge.id || Date.now() + Math.random(),
                            name: charge.product || charge.name,
                            selected: true 
                        }));

                    const safeFormatDate = (dateString) => {
                        if (!dateString) return '';
                        const d = new Date(dateString);
                        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
                    };

                    // Inject API data into formData
                    setFormData(prev => ({
                        ...prev,
                        invoiceNumber: order.invoiceNumber || '',
                        poNumberBottom: order.poNumber || '',
                        invoiceDate: safeFormatDate(order.invoiceDate),
                        termDays: order.termDays?.toString() || '30',
                        dueDate: safeFormatDate(order.dueDate),
                        comments: order.note || '',
                        emailCustomer: order.emailInvoiceToCustomer || false,
                        shippingCharges: order.shippingCharges || 0,
                        items: productsList,
                        extraCharges: extraChargesList,
                        
                        // New fields for Payment API
                        attemptImmediatePayment: order.attemptImmediatePayment || false,
                        otherPaymentOptions: order.otherPayment || '',
                        selectedCardId: order.paymentCardId || ''
                    }));
                }
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Failed to load invoice data.");
            } finally {
                setIsLoading(false);
                setIsGlobalLoading(false);
            }
        };

        fetchAllData();

        return () => {
            setTitle('');
            setShowProfile(true);
        };
    }, [id, isPartnerRoute, isRegularOrder, setTitle, setShowProfile, setIsGlobalLoading]);

    // --- Calculations ---
    useEffect(() => {
        if (formData.calcMode === 'auto') {
            const activeItems = formData.items.filter(item => item.selected !== false);
            const totalWeight = activeItems.reduce((acc, item) => acc + (parseFloat(item.weight || 0) * item.qty), 0);

            if (totalWeight === 0) {
                setFormData(p => ({ ...p, shippingCharges: 0 }));
                return;
            }

            const matchingTier = shippingTiers.find(tier => 
                totalWeight >= parseFloat(tier.weightFrom) && totalWeight <= parseFloat(tier.weightTo)
            );

            if (matchingTier) {
                setFormData(p => ({ ...p, shippingCharges: parseFloat(matchingTier.charges) }));
            }
        }
    }, [formData.items, formData.calcMode, shippingTiers]);

    const handleSelectProduct = (product) => {
        const existingIndex = formData.items.findIndex(i => i.id === product.id);
        if (existingIndex >= 0) {
            const newItems = [...formData.items];
            newItems[existingIndex].qty += 1;
            setFormData(p => ({ ...p, items: newItems }));
        } else {
            setFormData(p => ({ ...p, items: [...p.items, { ...product, qty: 1, selected: true }] }));
        }
        setIsProductModalOpen(false);
        toast.success(`${product.name} added`);
    };

    const handleUpdateInvoice = async () => {
        const activeItems = formData.items.filter(item => item.selected !== false);
        const activeExtras = formData.extraCharges.filter(charge => charge.selected !== false);

        if (activeItems.length === 0 && activeExtras.length === 0) {
            return toast.warning("Please add and check at least one item.");
        }

        const loadingId = toast.loading("Saving...");

        const idKey = (isRegularOrder && isPartnerRoute) ? 'partnerOrderId' : 'orderId';

        const payloadItems = activeItems.map(item => ({
            [idKey]: parseInt(id),
            productId: item.id,
            product: item.name,
            productCode: item.productCode || '',
            qty: parseInt(item.qty),
            price: parseFloat(item.price || 0).toFixed(2),
            discount: "0.00",
            wholesalePrice: parseFloat(item.wholesalePrice || 0).toFixed(2)
        }));

        const payloadTypeCharges = activeExtras.map(charge => ({
            type: "charges",
            code: "",
            name: charge.name || "Extra Charge",
            qty: parseInt(charge.qty),
            price: parseFloat(charge.price || 0).toString(),
            total: (parseFloat(charge.price || 0) * charge.qty)
        }));

        // Final payload generation including payment data
        const orderObj = {
            invoiceNumber: formData.invoiceNumber,
            poNumber: formData.poNumberBottom,
            proforma: false,
            termDays: formData.termDays === 'intermediate' ? "0" : formData.termDays,
            dueDate: formData.dueDate,
            note: formData.comments,
            otherPayment: formData.otherPaymentOptions || "",
            
            // Appending Payment API Flags
            attemptImmediatePayment: formData.attemptImmediatePayment,
            paymentCardId: formData.selectedCardId || null,

            emailInvoiceToCustomer: formData.emailCustomer,
            invoiceDate: formData.invoiceDate,
            reminder: false,
            discountPercentage: 0,
            invoiceReminder: Date.now()
        };

        const payload = { 
            items: payloadItems, 
            order: orderObj, 
            typeCharges: payloadTypeCharges 
        };

        const apiUrl = isPartnerRoute 
            ? `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/update-order/${id}` 
            : `https://testingbb.trimworldwide.com/api/v1/admin/order-management/update-order/${id}`;

        try {
            const res = await axios.patch(apiUrl, payload, getAuthConfig());

            if (res.data?.status === 'success') {
                toast.update(loadingId, { render: "Saved successfully!", type: "success", isLoading: false, autoClose: 2000 });

                if (isRegularOrder) {
                    navigate(isPartnerRoute ? `/orders/partnerOrders/detail/${id}` : `/orders/details/${id}`);
                } else {
                    navigate(isPartnerRoute ? `/direct-invoices/partner/${id}` : `/direct-invoices/${id}`);
                }
            } else {
                throw new Error("Failed to save.");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.update(loadingId, { render: error.response?.data?.message || "Error saving.", type: "error", isLoading: false, autoClose: 4000 });
        }
    };

    if (isLoading) {
        return <div className="w-full p-8 text-center text-gray-500 font-sans">Loading Details...</div>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans p-6 md:p-8 flex flex-col gap-6 mx-auto">
            <InvoiceItemsSection
                selectedCompanyData={orderData}
                viewProductsToggle="admin"
                invoiceTypeToggle="Customers"
                formData={formData}
                setFormData={setFormData}
                onGenerate={handleUpdateInvoice}
                onOpenModal={() => setIsProductModalOpen(true)}
                isUpdateMode={true}
                invoiceToAddress={invoiceToAddress}
                paymentCards={paymentCards} 
                isPartnerRoute={isPartnerRoute}
                isRegularOrder={isRegularOrder}
            />

            <AddProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSelectProduct={handleSelectProduct}
                viewProductsToggle="admin"
                invoiceTypeToggle={isPartnerRoute ? 'Partners' : 'Customers'}
                selectedCompanyData={orderData?.salesRep || orderData?.user}
            />
        </div>
    );
};

export default UpdateInvoicePage;











