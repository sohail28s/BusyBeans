import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

// --- Static Data ---
const PAYMENT_METHODS = [
    { label: "Bank Check", value: "bank check" },
    { label: "Card", value: "weekly" }
];

const ORDER_FREQUENCIES = [
    { label: "Once", value: "just-onces" },
    { label: "Weekly", value: "weekly" },
    { label: "Every Two Weeks", value: "every-two-weeks" },
    { label: "Every Four Weeks", value: "every-four-weeks" },
];

const getImageUrl = (path) => {
    if (!path) return "https://stageadmin.busybeancoffee.com/images/logocoffee.png";
    if (path.startsWith('http')) return path;
    return `https://testingbb.trimworldwide.com/${path}`;
};

// --- Standard Option Label with Divider and Arrow ---
const SelectLabel = ({ label, isOpen }) => (
    <>
        <span className="truncate text-[15px] text-input-hover">{label}</span>
        <div className="flex items-center flex-shrink-0 ml-2"> 
            <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
            <div className={`p-1 text-input-hover transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}> 
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"> 
                    <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" /> 
                </svg> 
            </div> 
        </div>
    </>
);

const StandardSelect = ({ label, options, value, onChange, placeholder, disabled, zIndexClass = "z-20" }) => {
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
        <div className={`mb-4 relative w-full font-sans ${zIndexClass}`} ref={selectRef}>
            {label && <label className="block text-white text-[15px] font-medium mb-2">{label}</label>}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full min-h-[48px] bg-white border border-gray-300 rounded-[4px] flex items-center justify-between px-3 text-gray-900 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <SelectLabel label={selectedLabel} isOpen={isOpen} />
            </div>
            {isOpen && (
                <div className="absolute top-[105%] left-0 w-full bg-input-brown text-white border border-brand-brown rounded-[4px] shadow-xl z-50 max-h-[250px] overflow-y-auto custom-scrollbar-white">
                    {options.length > 0 ? options.map(opt => (
                        <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className="px-4 py-3 text-[15px] cursor-pointer hover:bg-input-hover last:border-none transition-colors" >
                            {opt.label}
                        </div>
                    )) : <div onClick={() => setIsOpen(false)} className="px-4 py-3 text-[15px] cursor-pointer hover:bg-input-hover transition-colors"> No option </div>}
                </div>
            )}
        </div>
    );
};

const ComboboxSearchSelect = ({ label, options, value, onChange, placeholder, disabled, onSearch, onLoadMore, hasMore, isLoading, zIndexClass = "z-30" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
                if (onSearch) onSearch(''); 
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onSearch]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 10 && hasMore && !isLoading && onLoadMore) {
            onLoadMore();
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className={`mb-4 relative w-full font-sans ${zIndexClass}`} ref={selectRef}>
            {label && <label className="block text-white text-[15px] font-medium mb-2">{label}</label>}
            <div
                onClick={() => {
                    if (!disabled && !isOpen) {
                        setIsOpen(true);
                        setSearchTerm('');
                        if (onSearch) onSearch('');
                    }
                }}
                className={`w-full min-h-[48px] bg-white border border-gray-300 rounded-[4px] flex items-center justify-between px-3 text-gray-900 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
            >
                {isOpen ? (
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full h-full bg-transparent outline-none text-[15px] text-input-hover placeholder-gray-500 py-3"
                    />
                ) : (
                    <span className="truncate text-[15px] text-input-hover cursor-pointer w-full h-full flex items-center py-3">
                        {selectedLabel}
                    </span>
                )}
                
                <div 
                    className="flex items-center flex-shrink-0 cursor-pointer z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) {
                            setIsOpen(!isOpen);
                            if (isOpen) {
                                setSearchTerm('');
                                if (onSearch) onSearch('');
                            }
                        }
                    }}
                > 
                    <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
                    <div className={`p-1 text-input-hover transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}> 
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"> 
                            <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" /> 
                        </svg> 
                    </div> 
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-[105%] left-0 w-full bg-input-brown text-white border border-brand-brown rounded-[4px] shadow-xl z-50 overflow-hidden flex flex-col">
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar-white flex-1" onScroll={handleScroll}>
                        {options.length > 0 ? options.map(opt => (
                            <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); if (onSearch) onSearch(''); }} className="px-4 py-3 text-[15px] cursor-pointer hover:bg-input-hover last:border-none transition-colors truncate" >
                                {opt.label}
                            </div>
                        )) : !isLoading && <div className="px-4 py-3 text-[15px] text-gray-300 italic">No matches found</div>}
                        {isLoading && <div className="px-4 py-3 text-[14px] text-center text-gray-300 italic animate-pulse">Loading more...</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Cart Items Table Row ---
const CartItemRow = ({ item, onUpdateQuantity, handleIncrementQty, onRemoveItem }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const price = parseFloat(item.wholesalePrice || item.price || 0);
    return (
        <div className="font-sans relative flex sm:flex-row items-center h-[88px] text-white py-1.5 mb-2">
            <div className="flex justify-center items-center w-[120px] h-full rounded-lg bg-white p-2 shrink-0">
                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain" onError={(e) => e.target.src = "https://stageadmin.busybeancoffee.com/images/logocoffee.png"} />
            </div>
            <div className="px-4 w-full font-sans flex flex-col justify-center h-full pt-1">
                <h3 className="capitalize font-bold text-[15px] break-words line-clamp-1 text-white">{item.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-[14px] text-white">$ {isNaN(price) ? '0.00' : price.toFixed(2)}</span>
                </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 z-10">
                {!isExpanded ? (
                    <div onClick={() => setIsExpanded(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-black cursor-pointer hover:bg-gray-800 transition-colors shadow-md border border-white/20">
                        <span className="text-lg font-sans font-bold">{item.quantity}</span>
                    </div>
                ) : (
                    <div className="h-[36px] bg-black border border-white/20 rounded-[18px] flex items-center px-2 text-white shadow-lg animate-fade-in gap-x-1">
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full disabled:opacity-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="w-6 text-center font-bold text-[15px]">{item.quantity}</span>
                        <button onClick={() => handleIncrementQty(item)} className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                        <div className="w-[1px] h-4 bg-white/30 mx-1"></div>
                        <button onClick={() => onRemoveItem(item.id)} className="w-6 h-6 flex items-center justify-center text-white hover:text-red-400 hover:bg-white/20 rounded-full transition-colors">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Drawer Component ---
const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart, inventoryView, setInventoryView, selectedPartner }) => {
    const isMainViewPartner = inventoryView === 'partner';
    const [drawerIsPartnerMode, setDrawerIsPartnerMode] = useState(false);
    const [warningType, setWarningType] = useState('');
    const [showWarningModal, setShowWarningModal] = useState(false);

    // --- Entity States ---
    const [customers, setCustomers] = useState([]);
    const [customerPage, setCustomerPage] = useState(1);
    const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
    const [customerSearch, setCustomerSearch] = useState('');
    const [partners, setPartners] = useState([]);
    const [partnerSearch, setPartnerSearch] = useState('');
    const [isFetchingEntities, setIsFetchingEntities] = useState(false);

    // --- Form States ---
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [email, setEmail] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [orderFrequency, setOrderFrequency] = useState('');
    const [supplierNote, setSupplierNote] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [shippingCost, setShippingCost] = useState(null);
    const [shippingError, setShippingError] = useState(null);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

    const fetchCustomers = useCallback(async (page, searchStr, isPartnerView, partnerId, append = false) => {
        setIsFetchingEntities(true);
        try {
            let custUrl = `https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/not-assigned?page=${page}&limit=30`;
            if (isPartnerView && partnerId) {
                custUrl = `https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/sale-rep-id/${partnerId}?page=${page}&limit=30`;
            }
            if (searchStr) custUrl += `&search=${encodeURIComponent(searchStr)}`;
            const res = await axios.get(custUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
            if (res.data.status === 'success') {
                const newCustomers = res.data.data?.data || [];
                setCustomers(prev => append ? [...prev, ...newCustomers] : newCustomers);
                setHasMoreCustomers(newCustomers.length === 30);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setIsFetchingEntities(false);
        }
    }, []);

    const debouncedCustomerSearch = useCallback(
        debounce((query, isPartnerView, partnerId) => {
            setCustomerPage(1);
            fetchCustomers(1, query, isPartnerView, partnerId, false);
        }, 500),
        [fetchCustomers]
    );

    const handleCustomerSearchChange = (val) => {
        setCustomerSearch(val);
        debouncedCustomerSearch(val, isMainViewPartner, selectedPartner?.id);
    };

    const handleLoadMoreCustomers = () => {
        const nextPage = customerPage + 1;
        setCustomerPage(nextPage);
        fetchCustomers(nextPage, customerSearch, isMainViewPartner, selectedPartner?.id, true);
    };

    useEffect(() => {
        if (!isOpen) return;
        setCustomerPage(1);
        setCustomerSearch('');
        setPartnerSearch('');
        fetchCustomers(1, '', isMainViewPartner, selectedPartner?.id, false);

        if (!isMainViewPartner) {
            const fetchPartners = async () => {
                try {
                    const partRes = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/for-order-creation?partnerType=direct-partner', { 
                        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
                    });
                    if (partRes.data.status === 'success') setPartners(partRes.data.data || []);
                } catch (error) { console.error(error); }
            };
            fetchPartners();
        }
        if (isMainViewPartner) setDrawerIsPartnerMode(false);
    }, [isOpen, isMainViewPartner, selectedPartner, fetchCustomers]);

    // Derived Options based on Mode
    let activeList = [];
    if (drawerIsPartnerMode) {
        activeList = partners.filter(p => 
            (p.srName || '').toLowerCase().includes(partnerSearch.toLowerCase()) || 
            (p.territoryName || '').toLowerCase().includes(partnerSearch.toLowerCase())
        );
    } else {
        activeList = customers;
    }
    
    const entityOptions = activeList.map(item => ({
        value: item.id,
        label: drawerIsPartnerMode 
            ? `${item.srName} (${item.territoryName || ''})` 
            : `${item.companyName || 'Unknown Company'} (${item.name || 'Unknown Name'})`
    }));

    // Find the Active Entity explicitly from the raw arrays based on ID
    const activeEntity = drawerIsPartnerMode 
        ? partners.find(item => item.id === selectedEntityId) 
        : customers.find(item => item.id === selectedEntityId);

    const addressOptions = activeEntity?.addresses?.map(addr => ({
        value: addr.id,
        label: `${addr.addressLineOne || ''}, ${addr.town || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim()
    })) || [];

    // FIX: Only trigger field resets when the strictly selectedEntityId changes.
    // This stops the address from disappearing when cartItems causes a re-render.
    useEffect(() => {
        if (selectedEntityId && activeEntity) {
            setEmail(activeEntity.email || '');
            setSelectedAddressId('');
            setShippingCost(null);
            setShippingError(null);
        } else if (!selectedEntityId) {
            setEmail('');
            setSelectedAddressId('');
            setShippingCost(null);
            setShippingError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEntityId]); // ONLY track ID changes to prevent accidental wipes

    // Price/Weight Helpers
    const getItemPrice = (item) => {
        const p = parseFloat(item.wholesalePrice || item.price || 0);
        return isNaN(p) ? 0 : p;
    };
    const getItemWeight = (item) => {
        const w = parseFloat(item.weight || 0);
        return isNaN(w) ? 0 : w;
    };

    const cartSubtotal = cartItems?.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0) || 0;
    const finalTotal = cartSubtotal + (shippingCost || 0);

    // FIX: Calculate Shipping & Weight Validation
    useEffect(() => {
        const calculateShipping = async () => {
            if (!selectedEntityId || cartItems.length === 0 || !selectedAddressId) {
                setShippingCost(null);
                setShippingError(null);
                return;
            }
            setIsCalculatingShipping(true);
            const totalWeight = cartItems.reduce((sum, item) => sum + (getItemWeight(item) * item.quantity), 0);
            
            try {
                const res = await axios.post(
                    `https://testingbb.trimworldwide.com/api/v1/admin/shipping-charges-on-weight/customer/${selectedEntityId}`,
                    { weight: totalWeight },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                
                if (res.data.status === 'success' && res.data.data) {
                    setShippingCost(parseFloat(res.data.data.charges) || 0);
                    setShippingError(null); // Success clears error, enables button
                } else {
                    throw new Error(res.data.message || "Not dealing in such weights.");
                }
            } catch (error) {
                setShippingCost(null);
                const errorMsg = error.response?.data?.message || error.message || "Not dealing in such weights. Contact customer support.";
                
                // Keep the address intact, but set shipping error (disables button)
                setShippingError(errorMsg); 
                toast.error(errorMsg); // Push API response as toast directly
            } finally {
                setIsCalculatingShipping(false);
            }
        };
        
        const timeoutId = setTimeout(() => { calculateShipping(); }, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedEntityId, selectedAddressId, cartItems]);

    // Toggle Mode Logic
    const handleToggleMode = (e) => {
        e.preventDefault();
        if (isMainViewPartner) {
            setWarningType('return-to-admin');
            setShowWarningModal(true);
            return;
        }
        executeDrawerModeSwitch(!drawerIsPartnerMode);
    };

    const executeDrawerModeSwitch = (toPartnerMode) => {
        setDrawerIsPartnerMode(toPartnerMode);
        setSelectedEntityId('');
        setEmail('');
        setSelectedAddressId('');
        setPaymentMethod('');
        setOrderFrequency('');
        setShippingCost(null);
        setShippingError(null);
        setShowWarningModal(false);
    };

    const handleConfirmWarning = () => {
        if (warningType === 'return-to-admin') {
            setInventoryView('admin');
            onClearCart();
            onClose();
        } else {
            onClearCart();
            executeDrawerModeSwitch(!drawerIsPartnerMode);
        }
        setShowWarningModal(false);
    };

    // FIX: Rely entirely on API response for weight checking
    const handleIncrementQty = (item) => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    // --- Submit Order Logic ---
    const executeCreateOrder = async () => {
        if (shippingError || isCalculatingShipping) {
            toast.error(shippingError || "Please wait for shipping calculation.");
            return;
        }
        setIsSubmittingOrder(true);
        try {
            const safeSubtotal = cartItems.reduce((sum, item) => sum + (getItemPrice(item) * (item.quantity || 1)), 0);
            const safeTotalWeight = cartItems.reduce((sum, item) => sum + (getItemWeight(item) * (item.quantity || 1)), 0);
            const safeShipping = isNaN(parseFloat(shippingCost)) ? 0 : parseFloat(shippingCost);
            const safeFinalTotal = safeSubtotal + safeShipping;

            const orderItems = cartItems.map(item => ({
                categoryId: item.categoryId, createdAt: item.createdAt, deleted: item.deleted, desc: item.desc, productId: item.id, image: item.image || null, name: item.name, price: item.price, qty: Number(item.quantity), quantity: String(item.quantity), status: item.status, unit: item.unit || null, updatedAt: item.updatedAt, weight: item.weight, wholesalePrice: item.wholesalePrice,
            }));

            const orderBase = {
                addressId: selectedAddressId, paymentMethod: paymentMethod, frequency: orderFrequency, note: supplierNote, poNumber: poNumber, subTotal: safeSubtotal.toFixed(2), totalBill: safeFinalTotal.toFixed(2), discountPrice: "0.00", discountPercentage: 0, itemsPrice: safeSubtotal.toFixed(2), vat: 0, shippingCharges: safeShipping.toFixed(2), totalWeight: safeTotalWeight,
            };

            const apiUrl = drawerIsPartnerMode ? 'https://testingbb.trimworldwide.com/api/v1/admin/partner-order/book-new-order' : 'https://testingbb.trimworldwide.com/api/v1/admin/book-new-order';
            const payload = {
                order: drawerIsPartnerMode ? { ...orderBase, salesRepId: selectedEntityId } : { ...orderBase, userId: selectedEntityId, salesRepId: null },
                items: orderItems,
            };

            const res = await axios.post(apiUrl, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

            if (res.data.status === 'success') {
                toast.success('Order successfully created!');
                setTimeout(() => {
                    onClearCart();
                    onClose();
                }, 2000);
            } else {
                throw new Error(res.data.message || "Failed to create order.");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error?.original?.sqlMessage || error.message || "Failed to create order. Please check your details.";
            toast.error(errorMsg);
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const createOrderRef = useRef(executeCreateOrder);
    useEffect(() => { createOrderRef.current = executeCreateOrder; }, [executeCreateOrder]);

    const debouncedHandleCreateOrder = useCallback(
        debounce((e) => { createOrderRef.current(); }, 2000, { leading: true, trailing: false }),
        []
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[1100] bg-black/50 transition-opacity" onClick={onClose}></div>
            <div className="fixed top-0 right-0 h-full w-full sm:w-[512px] bg-brand-brown text-white shadow-2xl z-[1105] flex flex-col font-sans rounded-l-[12px] animate-slide-in overflow-hidden">
                <div className="px-8 pt-8 pb-4 flex items-right justify-end shrink-0">
                    <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z"></path>
                        </svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-8 pb-[100px] custom-scrollbar-white space-y-5 z-0">
                    <h2 className="text-[32px] font-black tracking-tight">Create Order</h2>
                    
                    <div className={`flex items-center justify-end gap-x-2 ${isMainViewPartner ? 'opacity-50' : ''}`}>
                        <label className="text-white font-medium text-[15px]">Local Partners</label>
                        <div className="relative inline-block text-left opacity-100 rounded-[14px] transition-opacity cursor-pointer">
                            <div className="relative w-[56px] h-[28px] bg-gray-400 rounded-[14px] transition-colors" onClick={handleToggleMode}></div>
                            <div className={`absolute top-[1px] w-[26px] h-[26px] bg-white rounded-full transition-transform ${drawerIsPartnerMode ? 'translate-x-[29px]' : 'translate-x-[1px]'}`} style={{ pointerEvents: 'none' }}></div>
                        </div>
                    </div>
                    
                    {/* FIX: Explicit Z-Index cascading applied to prevent overlapping components */}
                    <ComboboxSearchSelect 
                        zIndexClass="z-[80]"
                        label={drawerIsPartnerMode ? "Select Partner" : "Company Name"} 
                        placeholder={drawerIsPartnerMode ? "Search Partner..." : "Search Company or Name..."} 
                        options={entityOptions} 
                        value={selectedEntityId} 
                        onChange={setSelectedEntityId} 
                        isLoading={isFetchingEntities}
                        onSearch={drawerIsPartnerMode ? setPartnerSearch : handleCustomerSearchChange}
                        onLoadMore={!drawerIsPartnerMode ? handleLoadMoreCustomers : undefined}
                        hasMore={!drawerIsPartnerMode ? hasMoreCustomers : false}
                    />
                    
                    <div className="flex flex-col gap-y-2 z-10 relative">
                        <input type="text" placeholder="Email" value={email} disabled className="w-full bg-white rounded px-3 py-3 outline-none cursor-not-allowed font-sans placeholder-gray-500 focus:ring-0 min-h-[48px] text-input-hover" />
                    </div>
                    
                    <StandardSelect zIndexClass="z-[70]" label="" placeholder="Select Address" options={addressOptions} value={selectedAddressId} onChange={setSelectedAddressId} />
                    <StandardSelect zIndexClass="z-[60]" label="" placeholder="Select Payment Method" options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
                    <StandardSelect zIndexClass="z-[50]" label="" placeholder="Select Order Frequency" options={ORDER_FREQUENCIES} value={orderFrequency} onChange={setOrderFrequency} />
                    
                    <div className="flex flex-col border border-white rounded-[4px] overflow-hidden z-10 relative">
                        <div className="w-full font-sans font-normal text-base text-white flex items-center gap-3 px-5 py-[5px] duration-300 hover:bg-white/5 focus-within:bg-white/5 border-b border-white relative">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" className="mt-2 text-input-hover"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path></svg>
                            <div className="relative w-full h-[60px]">
                                <input id="courier-note" type="text" value={supplierNote} onChange={(e) => setSupplierNote(e.target.value)} placeholder=" " className="absolute bottom-1 w-full pb-1 focus:outline-none bg-transparent peer text-white z-10" />
                                <label htmlFor="courier-note" className="absolute left-0 transition-all pointer-events-none z-0 top-[6px] text-[12px] text-white peer-placeholder-shown:top-[20px] peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-gray-300 peer-focus:top-[6px] peer-focus:text-[12px] peer-focus:text-white leading-relaxed">Add note for the supplier (optional)</label>
                            </div>
                        </div>
                        <div className="w-full font-sans font-normal text-base text-white flex items-center gap-3 px-5 py-[5px] duration-300 hover:bg-white/5 focus-within:bg-white/5 relative">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" className="mt-2 text-input-hover"><path fill="none" d="M0 0h24v24H0z"></path><path d="M22 10V6a2 2 0 0 0-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"></path></svg>
                            <div className="relative w-full h-[60px]">
                                <input id="poNumber" type="text" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder=" " className="absolute bottom-1 w-full pb-1 focus:outline-none bg-transparent peer text-white z-10" />
                                <label htmlFor="poNumber" className="absolute left-0 transition-all pointer-events-none z-0 top-[6px] text-[12px] text-white peer-placeholder-shown:top-[20px] peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-gray-300 peer-focus:top-[6px] peer-focus:text-[12px] peer-focus:text-white leading-relaxed">Add Purchase Order Number (optional)</label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-bold text-[18px] mb-4 mt-8 leading-relaxed">Order Details</p>
                        {cartItems?.length === 0 ? ( <p className="text-white/50 italic leading-relaxed">Your cart is empty.</p> ) : ( <div className="space-y-4"> {cartItems?.map(item => ( <CartItemRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} handleIncrementQty={handleIncrementQty} onRemoveItem={onRemoveItem} /> ))} </div> )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-x-2">
                            <h5 className="text-[15px] text-white">Subtotal</h5>
                            <h6 className="font-semibold text-[15px]">${cartSubtotal.toFixed(2)}</h6>
                        </div>
                        <div className="flex items-center justify-between gap-x-2">
                            <h5 className="text-[15px] text-white">Shipping Charges</h5>
                            <h6 className="text-[15px] font-semibold"> {shippingCost !== null && !shippingError && !isCalculatingShipping ? `$ ${shippingCost.toFixed(2)}` : '$ 0.00'} </h6>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 py-5 flex flex-col justify-center w-full px-8 bg-brand-brown z-20">
                    <button onClick={debouncedHandleCreateOrder} disabled={cartItems?.length === 0 || !selectedEntityId || !selectedAddressId || !!shippingError || isCalculatingShipping || isSubmittingOrder || !paymentMethod || !orderFrequency} className="bg-input-hover font-bold text-white rounded-[4px] px-5 min-h-[56px] w-full flex items-center justify-between transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-sm active:scale-[0.98]" >
                        <div className="flex space-x-4 items-center">
                            <div className="bg-white text-black text-sm font-bold py-[2px] px-[9px] rounded-full"> {cartItems?.length || 0} </div>
                            <p className="text-[16px] leading-relaxed">{isSubmittingOrder ? 'Processing...' : 'Create Order'}</p>
                        </div>
                        <span className="text-[16px]">${finalTotal.toFixed(2)}</span>
                    </button>
                </div>
            </div>

            {/* Warning Modal */}
             {showWarningModal && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white font-sans rounded-2xl overflow-hidden shadow-xl w-full max-w-[420px] animate-fade-in relative">
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-4">
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {warningType === 'return-to-admin' ? "Return to Admin Mode?" : "Change Partner Mode?"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">This will affect your current order</p>
                            </div>
                            <button onClick={() => setShowWarningModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-4 mt-1" >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="px-6 pb-5">
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                                {warningType === 'return-to-admin'
                                    ? "You are currently in Partner Inventory mode. Switching this will return you to Admin mode and clear your cart. The drawer will close. Do you want to continue?"
                                    : "Changing the partner mode will clear your cart and reset all fields. The drawer will close. Do you want to continue?"}
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
                            <button
                                onClick={() => setShowWarningModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmWarning}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-brown rounded-lg hover:opacity-90 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartDrawer;