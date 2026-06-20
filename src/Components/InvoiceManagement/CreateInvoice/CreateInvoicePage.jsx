import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useStore from '../../../Hooks/useStore';
import InventoryToggleBar from '../../OrderManagement/InventoryToggleBar'; 
import { InvoiceInfoBanner } from './InvoiceInfoBanner';
import { InvoiceDetailsSection } from './InvoiceDetailsSection';
import { InvoiceItemsSection } from './InvoiceItemsSection';
import { AddProductModal } from './AddProductModal'; 
import { getAuthConfig } from '../../../utils/orderUtils';


const initialFormData = {
    email: '', addressId: '', paymentMethod: 'Bank Check', supplierNote: '', purchaseOrderNumber: '',
    invoiceNumber: '', poNumberBottom: '', invoiceDate: new Date().toISOString().split('T')[0], 
    termDays: '30', dueDate: '', comments: '', emailCustomer: true,
    items: [], extraCharges: [], shippingCharges: 0, calcMode: 'auto'
};

export const CreateInvoicePage = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);


    const navigate = useNavigate(); 
    const [viewProductsToggle, setViewProductsToggle] = useState('admin'); 
    const [selectedTopPartner, setSelectedTopPartner] = useState(null); 
    const [invoiceTypeToggle, setInvoiceTypeToggle] = useState('Customers'); 
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedCompanyData, setSelectedCompanyData] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [customersList, setCustomersList] = useState([]);
    const [partnersList, setPartnersList] = useState([]);
    const [partnerLinkedCustomers, setPartnerLinkedCustomers] = useState([]);
    const [shippingTiers, setShippingTiers] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    useEffect(() => {
        setTitle('Create Invoice');
        setShowProfile(false);
        
        axios.get('https://testingbb.trimworldwide.com/api/v1/admin/shipping-charges-list', getAuthConfig())
            .then(res => { 
                if (res.data?.status === 'success') {
                    setShippingTiers(res.data.data.data || []); 
                } 
            })
            .catch(err => console.error("Failed to fetch shipping tiers:", err));

        return () => 
            setTitle('');
        setShowProfile(true);
        ;
    }, [setTitle , setShowProfile]);

    useEffect(() => {
        setFormData(initialFormData);
        setSelectedCompanyId('');
        setSelectedCompanyData(null);
        fetchDropdownData();
    }, [viewProductsToggle, selectedTopPartner, invoiceTypeToggle]);

    useEffect(() => {
        if (formData.calcMode === 'auto') {
            const activeItems = formData.items.filter(item => item.selected !== false);
            const totalWeight = activeItems.reduce((acc, item) => acc + (parseFloat(item.weight || 0) * item.qty), 0);
            
            if (totalWeight === 0) {
                setFormData(p => ({ ...p, shippingCharges: 0 }));
                return;
            }
            
            const matchingTier = shippingTiers.find(tier => 
                totalWeight >= parseFloat(tier.weightFrom) && 
                totalWeight <= parseFloat(tier.weightTo)
            );

            if (matchingTier) {
                setFormData(p => ({ ...p, shippingCharges: parseFloat(matchingTier.charges) }));
            } else {
                setFormData(p => ({ ...p, shippingCharges: 0 }));
            }
        }
    }, [formData.items, formData.calcMode, shippingTiers]);

    useEffect(() => {
        if (formData.invoiceDate && formData.termDays) {
            const daysToAdd = formData.termDays === 'intermediate' ? 0 : parseInt(formData.termDays, 10);
            if (!isNaN(daysToAdd)) {
                const date = new Date(formData.invoiceDate);
                date.setDate(date.getDate() + daysToAdd);
                setFormData(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }));
            }
        }
    }, [formData.invoiceDate, formData.termDays]);

    // --- Input Sync Handlers ---
    const handleTopPOChange = (val) => setFormData(prev => ({...prev, purchaseOrderNumber: val, poNumberBottom: val}));

    // Autofill bottom comments when top supplier note changes
    const handleSupplierNoteChange = (val) => {
        setFormData(prev => ({
            ...prev,
            supplierNote: val,
            comments: val 
        }));
    };

    const fetchDropdownData = async () => {
        setIsLoadingOptions(true);
        setIsGlobalLoading(true);
        try {
            if (viewProductsToggle === 'partner' && selectedTopPartner) {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/sale-rep-id/${selectedTopPartner.id}?page=1&limit=1000`, getAuthConfig());
                if (res.data?.status === 'success') setPartnerLinkedCustomers(res.data.data.data || []);
            } else if (viewProductsToggle === 'admin') {
                if (invoiceTypeToggle === 'Customers') {
                    const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/not-assigned?page=1&limit=1000', getAuthConfig());
                    if (res.data?.status === 'success') setCustomersList(res.data.data.data || []);
                } else {
                    const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner', getAuthConfig());
                    if (res.data?.status === 'success') setPartnersList(res.data.data || []);
                }
            }
        } catch (error) { console.error(error); } 
        finally { setIsLoadingOptions(false);
            setIsGlobalLoading(false);
         }
    };

    const handleCompanySelection = (id) => {
        setSelectedCompanyId(id);
        let foundData = null;
        if (viewProductsToggle === 'partner') foundData = partnerLinkedCustomers.find(c => c.id === parseInt(id));
        else foundData = invoiceTypeToggle === 'Customers' ? customersList.find(c => c.id === parseInt(id)) : partnersList.find(p => p.id === parseInt(id));
        
        setSelectedCompanyData(foundData);
        if (foundData) {
            const emailToFill = (viewProductsToggle === 'partner' || invoiceTypeToggle === 'Customers') ? foundData.emailToSendInvoices : foundData.email;
            const defaultAddressId = foundData.addresses?.length > 0 ? foundData.addresses[0].id : '';
            setFormData(prev => ({ ...prev, email: emailToFill || '', addressId: defaultAddressId }));
        } else {
            setFormData(prev => ({ ...prev, email: '', addressId: '' }));
        }
    };

    const handleSelectProduct = (product) => {
        const existingIndex = formData.items.findIndex(i => i.id === product.id);
        if (existingIndex >= 0) {
            const newItems = [...formData.items];
            newItems[existingIndex].qty += 1;
            setFormData(p => ({ ...p, items: newItems }));
        } else {
            setFormData(p => ({ 
                ...p, 
                items: [...p.items, { ...product, qty: 1, selected: true }] 
            }));
        }
        setIsProductModalOpen(false);
        toast.success(`${product.name} added to invoice`);
    };

    const handleGenerateInvoice = async () => {
        if (!selectedCompanyData) return toast.warning("Please select a company/partner first.");
        
        const activeItems = formData.items.filter(item => item.selected !== false);
        const activeExtras = formData.extraCharges.filter(charge => charge.selected !== false);

        if (activeItems.length === 0 && activeExtras.length === 0) {
            return toast.warning("Please add and check at least one item.");
        }
        
        const loadingId = toast.loading("Generating Invoice...");

        const totalWeight = activeItems.reduce((acc, item) => acc + (parseFloat(item.weight || 0) * item.qty), 0);
        const subTotalItems = activeItems.reduce((acc, item) => acc + (parseFloat(item.price || 0) * item.qty), 0);
        const subTotalExtras = activeExtras.reduce((acc, charge) => acc + (parseFloat(charge.price || 0) * charge.qty), 0);
        const finalSubTotal = subTotalItems + subTotalExtras;
        const shipping = parseFloat(formData.shippingCharges || 0);
        const totalBill = finalSubTotal + shipping;

        const payloadItems = activeItems.map(item => ({
            deleted: false, productId: item.id, name: item.name,
            price: parseFloat(item.price || 0), qty: item.qty, status: true,
            unit: parseFloat(item.price || 0), 
            weight: parseFloat(item.weight || 0).toFixed(2),
            wholesalePrice: parseFloat(item.wholesalePrice || 0).toFixed(2)
        }));

        const payloadTypeCharges = activeExtras.map(charge => ({
            type: "charges", code: "", name: charge.name || "Extra Charge",
            qty: charge.qty, price: parseFloat(charge.price || 0).toString(),
            total: (parseFloat(charge.price || 0) * charge.qty)
        }));

        const orderObj = {
            totalBill: totalBill.toFixed(2), subTotal: finalSubTotal.toFixed(2),
            discountPrice: "0.00", discountPercentage: 0, itemsPrice: finalSubTotal.toFixed(2),
            vat: 0, totalWeight: totalWeight, shippingCharges: shipping.toFixed(2),
            invoiceNumber: formData.invoiceNumber, poNumber: formData.poNumberBottom,
            termDays: formData.termDays === 'intermediate' ? "0" : formData.termDays,
            dueDate: formData.dueDate, 
            note: formData.supplierNote || formData.comments, // Prioritize supplierNote over comments if contradict
            addressId: parseInt(formData.addressId), paymentMethod: formData.paymentMethod.toLowerCase(),
            invoiceOnly: true, type: "direct-invoice",
            emailInvoiceToCustomer: formData.emailCustomer, invoiceDate: formData.invoiceDate
        };

        let apiUrl = '';
        let payload = { email: [formData.email], order: orderObj, items: payloadItems, typeCharges: payloadTypeCharges };

        if (viewProductsToggle === 'admin') {
            if (invoiceTypeToggle === 'Customers') {
                apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/book-new-order';
                payload.order.userId = selectedCompanyData.id;
            } else {
                apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/partner-order/book-new-order';
                payload.order.salesRepId = selectedCompanyData.id;
            }
        } else {
            apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/book-new-order';
            payload.order.userId = selectedCompanyData.id;
        }

        try {
            const res = await axios.post(apiUrl, payload, getAuthConfig());
            if (res.data?.status === 'success') {
                toast.update(loadingId, { render: "Invoice generated successfully!", type: "success", isLoading: false, autoClose: 2000 });
                
                const newInvoiceId = res.data.data?.id || res.data.order?.id || res.data.data?.order?.id;
                
                if (newInvoiceId) {
                    if (viewProductsToggle === 'admin' && invoiceTypeToggle === 'Partners') {
                        navigate(`/direct-invoices/partner/${newInvoiceId}/add-invoice`);
                    } else {
                        navigate(`/direct-invoices/${newInvoiceId}/add-invoice`);
                    }
                } else {
                    setFormData(initialFormData);
                    setSelectedCompanyId('');
                    setSelectedCompanyData(null);
                }
            } else {
                throw new Error("Failed to generate");
            }
        } catch (error) {
            console.error("Generate error:", error);
            toast.update(loadingId, { render: error.response?.data?.message || "Error generating invoice.", type: "error", isLoading: false, autoClose: 4000 });
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6  mx-auto">
            
            <InventoryToggleBar 
                view={viewProductsToggle} setView={setViewProductsToggle}
                partner={selectedTopPartner} setPartner={setSelectedTopPartner}
                showActionButtons={false} 
            />

            <InvoiceInfoBanner 
                viewProductsToggle={viewProductsToggle} 
                invoiceTypeToggle={invoiceTypeToggle} 
            />

            <InvoiceDetailsSection 
                viewProductsToggle={viewProductsToggle} invoiceTypeToggle={invoiceTypeToggle} setInvoiceTypeToggle={setInvoiceTypeToggle}
                customersList={customersList} partnersList={partnersList} partnerLinkedCustomers={partnerLinkedCustomers}
                selectedCompanyId={selectedCompanyId} handleCompanySelection={handleCompanySelection} selectedCompanyData={selectedCompanyData}
                formData={formData} setFormData={setFormData} handleTopPOChange={handleTopPOChange} 
                handleSupplierNoteChange={handleSupplierNoteChange} // Passed to details section
                isLoading={isLoadingOptions}
            />

            <InvoiceItemsSection 
                selectedCompanyData={selectedCompanyData} viewProductsToggle={viewProductsToggle} invoiceTypeToggle={invoiceTypeToggle}
                formData={formData} setFormData={setFormData} onGenerate={handleGenerateInvoice}
                onOpenModal={() => setIsProductModalOpen(true)}
            />

            <AddProductModal 
                isOpen={isProductModalOpen} 
                onClose={() => setIsProductModalOpen(false)}
                onSelectProduct={handleSelectProduct}
                viewProductsToggle={viewProductsToggle}
                invoiceTypeToggle={invoiceTypeToggle}
                selectedTopPartner={selectedTopPartner}
                selectedCompanyData={selectedCompanyData}
            />

        </div>
    );
};

export default CreateInvoicePage;
