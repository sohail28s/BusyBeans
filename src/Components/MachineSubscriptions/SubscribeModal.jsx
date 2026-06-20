import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ADMIN_API_BASE_URL = "https://testingbb.trimworldwide.com/api/v1/admin";
const SUBSCRIPTION_API_BASE_URL = "https://testingbb.trimworldwide.com/api/v1/subscription";

export const SubscribeModal = ({ isOpen, onClose, machineId }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  // --- Step Management ---
  const [step, setStep] = useState(1);

  // --- Machine State ---
  const [machineData, setMachineData] = useState(null);

  // --- Step 1 Data States ---
  const [salesReps, setSalesReps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoadingReps, setIsLoadingReps] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // --- Step 1 Selection States ---
  const [selectedRep, setSelectedRep] = useState('admin');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // --- Step 2 Data & Selection States ---
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});

  // --- Step 3 Data & Selection States ---
  const [addons, setAddons] = useState([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState({});

  // --- Step 4 Data & States ---
  const [subscriptionDays, setSubscriptionDays] = useState('365');
  const [extraItems, setExtraItems] = useState([]);
  const [isExtraFormOpen, setIsExtraFormOpen] = useState(false);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraQuantity, setNewExtraQuantity] = useState('1');
  const [newExtraPrice, setNewExtraPrice] = useState('');
  const quickSelectDays = [7, 14, 30, 60, 90, 180, 365];

  // --- Step 6: Payment States ---
  const [savedCards, setSavedCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // --- Step 7: Result State ---
  const [orderResult, setOrderResult] = useState(null); // { success: bool, message: string, data: any }

  // --- Dropdown Toggles ---
  const [isRepDropdownOpen, setIsRepDropdownOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const repDropdownRef = useRef(null);
  const customerDropdownRef = useRef(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  });

  // --- Reset & Fetch Initial Data on Open ---
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedRep('admin');
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setSelectedProducts({});
      setSelectedAddons({});
      setSubscriptionDays('365');
      setExtraItems([]);
      setIsExtraFormOpen(false);
      setProductSearchQuery('');
      setSavedCards([]);
      setSelectedCard(null);
      setOrderResult(null);
      fetchSalesReps();
      if (machineId) fetchMachineDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, machineId]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers(selectedRep);
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRep, isOpen]);

  useEffect(() => {
    if (step === 2 && products.length === 0) fetchProducts();
    else if (step === 3 && addons.length === 0) fetchAddons();
    else if (step === 6 && selectedCustomer) fetchSavedCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isRepDropdownOpen && repDropdownRef.current && !repDropdownRef.current.contains(e.target)) {
        setIsRepDropdownOpen(false);
      }
      if (isCustomerDropdownOpen && customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
      if (!isRepDropdownOpen && !isCustomerDropdownOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose, isRepDropdownOpen, isCustomerDropdownOpen]);

  // --- API Calls ---
  const fetchMachineDetails = async () => {
    try {
      const res = await axios.get(`${ADMIN_API_BASE_URL}/coffee-machine`, getAuthConfig());
      if (res.data?.status === 'success') {
        const machine = res.data.data.data.find(m => m.id === machineId);
        if (machine) setMachineData(machine);
      }
    } catch (error) {
      console.error("Failed to load machine details");
    }
  };

  const fetchSalesReps = async () => {
    setIsLoadingReps(true);
    try {
      const res = await axios.get(`${ADMIN_API_BASE_URL}/sales-rep`, getAuthConfig());
      if (res.data?.status === 'success') setSalesReps(res.data.data.data || []);
    } catch (error) {
      toast.error("Failed to load partners/sales reps.");
    } finally {
      setIsLoadingReps(false);
    }
  };

  const fetchCustomers = async (repId) => {
    setIsLoadingCustomers(true);
    try {
      const endpoint = repId === 'admin'
        ? `${ADMIN_API_BASE_URL}/customer-management/customer-list/not-assigned?page=1&limit=30`
        : `${ADMIN_API_BASE_URL}/customer-management/customer-list/sale-rep-id/${repId}?page=1&limit=30`;
      const res = await axios.get(endpoint, getAuthConfig());
      if (res.data?.status === 'success') setCustomers(res.data.data.data || []);
    } catch (error) {
      toast.error("Failed to load customers.");
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const endpoint = selectedRep === 'admin'
        ? `${ADMIN_API_BASE_URL}/product?status=1`
        : `${ADMIN_API_BASE_URL}/products/sales-rep?salesRepId=${selectedRep}&page=1&limit=500`;
      const res = await axios.get(endpoint, getAuthConfig());
      if (res.data?.status === 'success') setProducts(res.data.data.data || []);
    } catch (error) {
      toast.error("Failed to load products.");
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchAddons = async () => {
    setIsLoadingAddons(true);
    try {
      const res = await axios.get(`${SUBSCRIPTION_API_BASE_URL}/addons`, getAuthConfig());
      if (res.data?.success) setAddons(res.data.addons || []);
    } catch (error) {
      toast.error("Failed to load add-ons.");
      setAddons([]);
    } finally {
      setIsLoadingAddons(false);
    }
  };

  const fetchSavedCards = async () => {
    if (!selectedCustomer?.id) return;
    setIsLoadingCards(true);
    try {
      const res = await axios.get(
        `${ADMIN_API_BASE_URL}/customer-management/payment-cards/${selectedCustomer.id}`,
        getAuthConfig()
      );
      if (res.data?.status === 'success') {
        const cards = res.data.data?.cards || [];
        setSavedCards(cards);
        if (cards.length > 0) setSelectedCard(cards[0]);
      }
    } catch (error) {
      console.error("Failed to load saved cards");
      setSavedCards([]);
    } finally {
      setIsLoadingCards(false);
    }
  };

  // --- Computed Values ---
  const productsSubtotal = Object.entries(selectedProducts).reduce(
    (acc, [_, data]) => acc + (data.quantity * parseFloat(data.unitPrice || 0)), 0
  );
  const addonsSubtotal = Object.entries(selectedAddons).reduce(
    (acc, [_, data]) => acc + (data.quantity * parseFloat(data.unitPrice || 0)), 0
  );
  const extraItemsSubtotal = extraItems.reduce(
    (acc, item) => acc + (item.quantity * parseFloat(item.price || 0)), 0
  );
  const machinePrice = parseFloat(machineData?.price || 0);
  const totalSubtotal = productsSubtotal + addonsSubtotal + extraItemsSubtotal;
  const grandTotal = machinePrice + totalSubtotal;

  // --- Navigation Handlers ---
  const handleNextToProducts = () => {
    if (!selectedCustomer) return toast.warning("Please select a customer first.");
    setStep(2);
  };
  const handleNextToAddons = () => {
    if (Object.keys(selectedProducts).length === 0) return toast.warning("Please select at least one product.");
    setStep(3);
  };
  const handleNextToExtraItems = () => setStep(4);
  const handleNextToReview = () => setStep(5);
  const handleNextToPayment = () => setStep(6);

  // --- Build Order Payload ---
  const buildOrderPayload = (paymentMethodId) => {
    const productsArr = Object.keys(selectedProducts).map(id => {
      const prod = products.find(p => p.id === parseInt(id));
      const data = selectedProducts[id];
      return {
        productId: parseInt(id),
        sku: prod?.sku || '',
        quantity: data.quantity,
        unitPrice: parseFloat(data.unitPrice),
        totalPrice: data.quantity * parseFloat(data.unitPrice),
      };
    });

    const addonsArr = Object.keys(selectedAddons).map(id => {
      const addon = addons.find(a => a.id === parseInt(id));
      const data = selectedAddons[id];
      return {
        addonId: parseInt(id),
        name: addon?.name || '',
        quantity: data.quantity,
        unitPrice: parseFloat(data.unitPrice),
        totalPrice: data.quantity * parseFloat(data.unitPrice),
      };
    });

    return {
      customerEmail: selectedCustomer?.email || '',
      userName: selectedCustomer?.name || '',
      paymentMethodId: paymentMethodId || null,
      stripeCustomerId: selectedCard?.stripeCustomerId || '',
      machineId: machineData?.id || machineId,
      machineName: machineData?.name || '',
      machinePrice: machinePrice,
      userId: selectedCustomer?.id,
      subscriptionDays: parseInt(subscriptionDays),
      products: productsArr,
      productsTotal: productsSubtotal,
      addons: addonsArr,
      addonsTotal: addonsSubtotal,
      totalAmount: grandTotal,
    };
  };

  // --- Submit Order ---
  const handlePayWithCard = async () => {
    if (!selectedCard) return toast.warning("Please select a card.");
    setIsSubmittingOrder(true);
    try {
      const payload = buildOrderPayload(selectedCard.id);
      const res = await axios.post(`${SUBSCRIPTION_API_BASE_URL}/create`, payload, getAuthConfig());
      setOrderResult({ success: true, message: res.data?.message || 'Subscription created successfully!', data: res.data });
      setStep(7);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create subscription. Please try again.';
      setOrderResult({ success: false, message: msg });
      setStep(7);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleSendInvoice = async () => {
    setIsSubmittingOrder(true);
    try {
      const payload = buildOrderPayload(null);
      const res = await axios.post(`${SUBSCRIPTION_API_BASE_URL}/create`, payload, getAuthConfig());
      setOrderResult({ success: true, message: res.data?.message || 'Invoice sent successfully!', data: res.data });
      setStep(7);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send invoice. Please try again.';
      setOrderResult({ success: false, message: msg });
      setStep(7);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // --- Item Handlers ---
  const toggleProductSelection = (prod) => {
    setSelectedProducts(prev => {
      const next = { ...prev };
      if (next[prod.id]) delete next[prod.id];
      else next[prod.id] = { quantity: 1, unitPrice: prod.price || "0" };
      return next;
    });
  };

  const toggleAddonSelection = (addon) => {
    setSelectedAddons(prev => {
      const next = { ...prev };
      if (next[addon.id]) delete next[addon.id];
      else next[addon.id] = { quantity: 1, unitPrice: addon.price || "0" };
      return next;
    });
  };

  const updateItemData = (type, id, field, value) => {
    const setter = type === 'product' ? setSelectedProducts : setSelectedAddons;
    setter(prev => {
      const next = { ...prev };
      if (!next[id]) return prev;
      next[id][field] = value;
      return next;
    });
  };

  const handleAddExtraItem = () => {
    if (!newExtraName || !newExtraPrice) return toast.warning("Please provide name and price.");
    const qty = parseInt(newExtraQuantity, 10) || 1;
    setExtraItems(prev => [...prev, {
      id: Date.now(),
      name: newExtraName,
      price: parseFloat(newExtraPrice).toFixed(2),
      quantity: Math.max(1, qty)
    }]);
    setNewExtraName('');
    setNewExtraPrice('');
    setNewExtraQuantity('1');
    setIsExtraFormOpen(false);
  };

  const updateExtraField = (id, field, value) => {
    setExtraItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const getRepName = (id) => {
    if (id === 'admin') return 'Admin customers';
    const rep = salesReps.find(r => r.id === id);
    return rep ? rep.srName : 'Select Partner...';
  };

  const resolveImagePath = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/80";
    if (imgPath.startsWith('http')) return imgPath;
    return `https://testingbb.trimworldwide.com/${imgPath.startsWith('/') ? imgPath.slice(1) : imgPath}`;
  };

  // --- Reusable Components ---
  const TrashIcon = () => (
    <svg className="w-[18px] h-[18px] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  const getBrandColor = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return '#1a1f71';
      case 'mastercard': return '#eb001b';
      case 'amex': return '#2e77bc';
      default: return '#374151';
    }
  };

  const VisaLogo = ({ color = '#fff' }) => (
    <svg viewBox="0 0 48 16" width="42" height="14" fill={color}>
      <text x="0" y="14" fontFamily="Arial" fontWeight="bold" fontSize="16" letterSpacing="-1">VISA</text>
    </svg>
  );

  const CardBrandBadge = ({ brand }) => (
    <div className="w-[52px] h-[34px] rounded-[5px] flex items-center justify-center" style={{ background: getBrandColor(brand) }}>
      <span className="text-white font-black text-[13px] tracking-tight uppercase">{brand || 'CARD'}</span>
    </div>
  );

  const OrderSummary = () => (
    <div className="border border-[#e5e7eb] rounded-[8px] mb-5">
      <div className="px-4 py-3 bg-gray-50 border-b border-[#e5e7eb]">
        <h4 className="text-[15px] font-bold text-[#374151]">Order Summary</h4>
      </div>
      <div className="divide-y divide-[#f3f4f6]">
        {/* Machine */}
        {machineData && (
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-[14px] font-semibold text-[#374151]">Monthly Service</span>
              <span className="ml-2 text-[12px] text-gray-400 font-medium">Machine</span>
              <p className="text-[12px] text-gray-500 mt-0.5">{machineData.name}</p>
            </div>
            <span className="text-[14px] font-bold text-[#1f2937]">${machinePrice.toFixed(2)}</span>
          </div>
        )}

        {Object.keys(selectedProducts).length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Products</p>
            {Object.keys(selectedProducts).map(id => {
              const prod = products.find(p => p.id === parseInt(id));
              const data = selectedProducts[id];
              const sub = data.quantity * parseFloat(data.unitPrice);
              return (
                <div key={id} className="flex items-start justify-between mb-2 last:mb-0">
                  <div>
                    <p className="text-[14px] font-semibold text-[#374151]">
                      {prod?.name}
                      {prod?.sku && <span className="ml-2 text-[11px] text-gray-400 font-mono">({prod.sku})</span>}
                    </p>
                    <p className="text-[12px] text-gray-500">Quantity: {data.quantity} × ${parseFloat(data.unitPrice).toFixed(2)}</p>
                  </div>
                  <span className="text-[14px] font-bold text-[#1f2937]">${sub.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Add-ons */}
        {Object.keys(selectedAddons).length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Add-ons</p>
            {Object.keys(selectedAddons).map(id => {
              const addon = addons.find(a => a.id === parseInt(id));
              const data = selectedAddons[id];
              const sub = data.quantity * parseFloat(data.unitPrice);
              return (
                <div key={id} className="flex items-start justify-between mb-2 last:mb-0">
                  <div>
                    <p className="text-[14px] font-semibold text-[#374151]">{addon?.name}</p>
                    <p className="text-[12px] text-gray-500">Quantity: {data.quantity} × ${parseFloat(data.unitPrice).toFixed(2)}</p>
                  </div>
                  <span className="text-[14px] font-bold text-[#1f2937]">${sub.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Extra Items */}
        {extraItems.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Extra Items</p>
            {extraItems.map(item => {
              const sub = item.quantity * parseFloat(item.price);
              return (
                <div key={item.id} className="flex items-start justify-between mb-2 last:mb-0">
                  <div>
                    <p className="text-[14px] font-semibold text-[#374151]">{item.name}</p>
                    <p className="text-[12px] text-gray-500">Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className="text-[14px] font-bold text-[#1f2937]">${sub.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <span className="text-[15px] font-bold text-[#374151]">Total Amount</span>
          <span className="text-[18px] font-black text-[#1f2937]">${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 py-10">
      <div
        ref={modalRef}
        className="bg-white w-full rounded-[6px] shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] flex flex-col font-nunito transition-all duration-300 max-h-[90vh] max-w-[700px] h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e5e7eb] shrink-0">
          <h2 className="text-[20px] font-bold text-[#374151]">Subscribe to Plan</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#374151]"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
              <path d="M 8.01186 7.00933 L 12.27 2.75116 C 12.341 2.68501 12.398 2.60524 12.4375 2.51661 C 12.4769 2.42798 12.4982 2.3323 12.4999 2.23529 C 12.5016 2.13827 12.4838 2.0419 12.4474 1.95194 C 12.4111 1.86197 12.357 1.78024 12.2884 1.71163 C 12.2198 1.64302 12.138 1.58893 12.0481 1.55259 C 11.9581 1.51625 11.8617 1.4984 11.7647 1.50011 C 11.6677 1.50182 11.572 1.52306 11.4834 1.56255 C 11.3948 1.60204 11.315 1.65898 11.2488 1.72997 L 6.99067 5.98814 L 2.7325 1.72997 C 2.59553 1.60234 2.41437 1.53286 2.22718 1.53616 C 2.03999 1.53946 1.8614 1.61529 1.72901 1.74767 C 1.59663 1.88006 1.5208 2.05865 1.5175 2.24584 C 1.5142 2.43303 1.58368 2.61419 1.71131 2.75116 L 5.96948 7.00933 L 1.71131 11.2675 C 1.576 11.403 1.5 11.5866 1.5 11.7781 C 1.5 11.9696 1.576 12.1532 1.71131 12.2887 C 1.84679 12.424 2.03043 12.5 2.2219 12.5 C 2.41338 12.5 2.59702 12.424 2.7325 12.2887 L 6.99067 8.03052 L 11.2488 12.2887 C 11.3843 12.424 11.568 12.5 11.7594 12.5 C 11.9509 12.5 12.1346 12.424 12.27 12.2887 C 12.4053 12.1532 12.4813 11.9696 12.4813 11.7781 C 12.4813 11.5866 12.4053 11.403 12.27 11.2675 L 8.01186 7.00933 Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">


          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fadeIn font-sans">

              {/* --- Top Container: Show customers for --- */}
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4" ref={repDropdownRef}>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Show customers for</label>
                <p className="text-xs text-gray-500 mb-3">Admin customers or pick a partner to see their customers</p>

                <div
                  onClick={() => !isLoadingReps && setIsRepDropdownOpen(!isRepDropdownOpen)}
                  className="relative flex items-center justify-between h-[38px] px-3 border border-gray-300 rounded-[4px] cursor-pointer hover:border-gray-400 bg-white"
                >
                  <span className="text-[14px] text-gray-800 truncate">
                    {isLoadingReps ? 'Loading partners...' : (selectedRep === 'admin' ? 'Admin customers' : getRepName(selectedRep))}
                  </span>

                  <div className="flex items-center text-gray-400">
                    <span className="w-[1px] h-[20px] bg-gray-200 mr-2"></span>
                    <svg className={`w-5 h-5 transition-transform ${isRepDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4.516 7.548C4.952 7.102 5.559 7.067 6.092 7.548L10 11.295L13.908 7.548C14.441 7.067 15.049 7.102 15.482 7.548C15.918 7.993 15.89 8.745 15.482 9.163C15.076 9.581 10.787 13.665 10.787 13.665C10.57 13.888 10.285 14 10 14S9.43 13.888 9.211 13.665C9.211 13.665 4.924 9.581 4.516 9.163S4.08 7.993 4.516 7.548Z" />
                    </svg>
                  </div>

                  {isRepDropdownOpen && (
                    <div className="absolute top-[42px] left-0 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg z-50 max-h-[200px] overflow-y-auto py-1">
                      <div
                        onClick={() => { setSelectedRep('admin'); setIsRepDropdownOpen(false); }}
                        className={`px-3 py-2 text-[14px] cursor-pointer ${selectedRep === 'admin' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Admin customers
                      </div>
                      {salesReps.map(rep => (
                        <div
                          key={rep.id}
                          onClick={() => { setSelectedRep(rep.id); setIsRepDropdownOpen(false); }}
                          className={`px-3 py-2 text-[14px] cursor-pointer border-t border-gray-50 ${selectedRep === rep.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {rep.srName} <span className="text-gray-400 text-xs ml-1">({rep.partnerType})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4" ref={customerDropdownRef}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block">Select customer</label>
                    <p className="text-xs text-gray-500 mt-0.5">Search by name or email</p>
                  </div>
                  <button
                    onClick={() => navigate(`/customers/add?returnTo=subscription`)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#86644c] border border-[#86644c] rounded-lg hover:bg-[#86644c]/5 transition-colors shrink-0"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                    </svg>
                    Add New User
                  </button>
                </div>

                <div className="relative flex items-center justify-between h-[38px] px-3 border border-gray-300 rounded-[4px] bg-white focus-within:border-[#86644c] focus-within:ring-1 focus-within:ring-[#86644c]">
                  <input
                    type="text"
                    placeholder={isLoadingCustomers ? "Loading customers..." : "Search for a user..."}
                    value={customerSearchQuery}
                    onChange={(e) => { setCustomerSearchQuery(e.target.value); setIsCustomerDropdownOpen(true); }}
                    onClick={() => setIsCustomerDropdownOpen(true)}
                    disabled={isLoadingCustomers}
                    className="w-full h-full bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-400"
                  />

                  <div className="flex items-center text-gray-400">
                    <span className="w-[1px] h-[20px] bg-gray-200 mr-2"></span>
                    <svg
                      className={`w-5 h-5 transition-transform cursor-pointer ${isCustomerDropdownOpen ? 'rotate-180' : ''}`}
                      onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4.516 7.548C4.952 7.102 5.559 7.067 6.092 7.548L10 11.295L13.908 7.548C14.441 7.067 15.049 7.102 15.482 7.548C15.918 7.993 15.89 8.745 15.482 9.163C15.076 9.581 10.787 13.665 10.787 13.665C10.57 13.888 10.285 14 10 14S9.43 13.888 9.211 13.665C9.211 13.665 4.924 9.581 4.516 9.163S4.08 7.993 4.516 7.548Z" />
                    </svg>
                  </div>

                  {isCustomerDropdownOpen && (
                    <div className="absolute z-[999999] top-[42px] left-0 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg  max-h-[250px] overflow-y-auto py-1">
                      {customers.filter(c => {
                        if (!customerSearchQuery) return true;
                        const q = customerSearchQuery.toLowerCase();
                        return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
                      }).length > 0 ? (
                        customers.filter(c => {
                          if (!customerSearchQuery) return true;
                          const q = customerSearchQuery.toLowerCase();
                          return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
                        }).map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => { setSelectedCustomer(customer); setCustomerSearchQuery(`${customer.name} (${customer.email})`); setIsCustomerDropdownOpen(false); }}
                            className="px-3 py-2 text-[14px] cursor-pointer hover:bg-blue-50 flex flex-col"
                          >
                            <span className="font-semibold text-gray-800">
                              {customer.name}
                              <span className="text-gray-400 font-normal ml-1">| {customer.companyName || 'No Company'}</span>
                            </span>
                            <span className="text-gray-500 text-[12px]">{customer.email} • {customer.phoneNumber}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-[14px] text-gray-500 italic text-center">
                          {isLoadingCustomers ? 'Loading...' : 'No customers found.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>



            </div>
          )}







          {step === 2 && (
            <div className="flex flex-col animate-fadeIn h-full font-sans space-y-4">

              {/* --- Header & Selected User --- */}
              <h3 className="font-semibold text-lg text-gray-900">Select Products</h3>
              <div className="bg-blue-50 p-2 rounded text-sm text-blue-800 mb-2">
                User: <strong>{selectedCustomer?.name} ({selectedCustomer?.email})</strong>
              </div>

              <div className="space-y-3">

                <div className="relative flex-shrink-0">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <input
                    placeholder="Search products by name, SKU..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] transition-all bg-white text-gray-900"
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoadingProducts ? (
                    <div className="text-center py-10 text-gray-500 text-sm italic">Loading products...</div>
                  ) : products.filter(p => {
                    if (!productSearchQuery) return true;
                    const q = productSearchQuery.toLowerCase();
                    return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                  }).length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm italic">No products found.</div>
                  ) : (
                    products.filter(p => {
                      if (!productSearchQuery) return true;
                      const q = productSearchQuery.toLowerCase();
                      return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                    }).map((prod) => {
                      const isSelected = !!selectedProducts[prod.id];
                      const prodData = selectedProducts[prod.id] || {};
                      const subtotal = (prodData.quantity || 0) * parseFloat(prodData.unitPrice || 0);

                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProductSelection(prod)}
                          className={`border rounded-xl p-4 transition-all ${isSelected
                              ? 'border-[#86644c] bg-[#fef1d8] shadow-md' // Matched the exact reference HTML color
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-start gap-4 cursor-pointer">
                            {/* Image */}
                            <img
                              alt={prod.name}
                              className="w-20 h-20 object-cover rounded-lg bg-white border border-gray-200 flex-shrink-0"
                              src={resolveImagePath(prod.image)}
                              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80"; }}
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 leading-tight">{prod.name}</h4>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                                      SKU: {prod.sku || 'N/A'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                                    {prod.desc || 'No description available'}
                                  </p>
                                </div>

                                {/* Custom Checkbox */}
                                <div
                                  role="checkbox"
                                  aria-checked={isSelected}
                                  // Explicitly added bg-white when not selected
                                  className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${isSelected ? 'bg-[#86644c] border-[#86644c]' : 'bg-white border-gray-300'
                                    }`}
                                >
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Default Price View (Hidden if selected) */}
                              {!isSelected && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-sm font-bold text-[#86644c]">${parseFloat(prod.price || 0).toFixed(2)}</span>
                                  <span className="text-xs text-gray-400">/ {prod.unit || 'lbs'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expanded Selection Controls */}
                          {isSelected && (
                            <div className="mt-4 pt-4 border-t border-gray-300 space-y-3" onClick={e => e.stopPropagation()}>

                              <div className="flex items-center justify-between gap-4">
                                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateItemData('product', prod.id, 'quantity', Math.max(1, prodData.quantity - 1))}
                                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors bg-white"
                                  >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M19 11H5V13H19V11Z"></path>
                                    </svg>
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={prodData.quantity}
                                    onChange={(e) => updateItemData('product', prod.id, 'quantity', parseInt(e.target.value) || 1)}
                                    // Explicitly added bg-white and text-gray-900
                                    className="w-16 h-8 text-center border border-gray-300 rounded text-sm font-medium focus:outline-none focus:border-[#86644c] transition-colors bg-white text-gray-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateItemData('product', prod.id, 'quantity', prodData.quantity + 1)}
                                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors bg-white"
                                  >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <label className="text-sm font-medium text-gray-700">Unit Price:</label>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={prodData.unitPrice}
                                    onChange={(e) => updateItemData('product', prod.id, 'unitPrice', e.target.value)}
                                    // Explicitly added bg-white and text-gray-900
                                    className="w-24 h-8 px-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:border-[#86644c] transition-colors bg-white text-gray-900"
                                  />
                                  <span className="text-xs text-gray-500">/ {prod.unit || 'lbs'}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <span className="font-bold text-[#86644c]">${subtotal.toFixed(2)}</span>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}









          {step === 3 && (
            <div className="flex flex-col animate-fadeIn h-full font-sans">
        
              <style>{`
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type='number'] {
                -moz-appearance: textfield;
            }
        `}</style>

              <h3 className="text-[18px] font-bold text-[#374151] mb-4">Recommended Add-ons</h3>

              <div className="flex flex-col gap-4 pb-4">
                {isLoadingAddons ? (
                  <div className="text-center py-10 text-gray-500 text-sm italic">Loading add-ons...</div>
                ) : addons.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm italic">No add-ons found.</div>
                ) : (
                  addons.map((addon) => {
                    const isSelected = !!selectedAddons[addon.id];
                    const addonData = selectedAddons[addon.id] || {};
                    const subtotal = (addonData.quantity || 0) * parseFloat(addonData.unitPrice || 0);

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddonSelection(addon)}
                        className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition-all duration-200 ${isSelected
                            ? 'border-[#86644c] bg-[#fef7e8] shadow-md'
                            : 'border-[#e5e7eb] bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="text-[16px] font-bold text-[#1f2937] leading-tight truncate">
                              {addon.name}
                            </h4>
                            {addon.description && (
                              <p className="text-[13px] text-[#6b7280] line-clamp-1 leading-relaxed">
                                {addon.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {!isSelected && (
                              <div className="flex items-baseline gap-1">
                                <span className="text-[16px] font-bold text-[#86644c]">
                                  ${parseFloat(addon.price || 0).toFixed(2)}
                                </span>
                                <span className="text-[13px] font-bold text-[#86644c]">/mo</span>
                              </div>
                            )}
                            {/* Custom Checkbox */}
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#86644c] border-[#86644c]' : 'bg-white border-gray-300'
                              }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Selection Controls */}
                        {isSelected && (
                          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-300" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[14px] font-medium text-gray-700">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateItemData('addon', addon.id, 'quantity', Math.max(1, addonData.quantity - 1))}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={addonData.quantity}
                                  onChange={(e) => updateItemData('addon', addon.id, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-center border border-gray-300 rounded bg-white text-gray-900 text-[14px] outline-none focus:border-black transition-colors appearance-none"
                                  min="1"
                                />
                                <button
                                  onClick={() => updateItemData('addon', addon.id, 'quantity', addonData.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[14px] font-medium text-gray-700">Unit Price:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={addonData.unitPrice}
                                  onChange={(e) => updateItemData('addon', addon.id, 'unitPrice', e.target.value)}
                                  className="w-24 h-8 px-2 border border-gray-300 rounded bg-white text-gray-900 text-[14px] outline-none focus:border-black transition-colors appearance-none"
                                />
                                <span className="text-[13px] text-gray-500">/ mo</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[14px] text-gray-600">Subtotal:</span>
                              <span className="text-[16px] font-bold text-[#86644c]">${subtotal.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}







          {step === 4 && (
            <div className="flex flex-col animate-fadeIn h-full font-sans space-y-4">
              <style>{`
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type='number'] {
                -moz-appearance: textfield;
            }
        `}</style>

              <h3 className="font-semibold text-lg text-gray-900">Additional Items</h3>

              <div className="space-y-6 pb-4">

                {/* --- Subscription Days --- */}
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">Subscription Days</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={subscriptionDays}
                      onChange={(e) => setSubscriptionDays(e.target.value)}
                      className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] transition-all appearance-none"
                    />
                    <span className="text-sm text-gray-600">days</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-1.5 pt-1">Quick select:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSelectDays.map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSubscriptionDays(String(days))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${parseInt(subscriptionDays) === days
                            ? 'bg-[#86644c] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* --- Extra Items --- */}
                <div className="space-y-4">

                  {/* Header & Toggle Button */}
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">Extra Items</label>
                    <button
                      onClick={() => setIsExtraFormOpen(!isExtraFormOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#86644c] text-white rounded-lg hover:bg-[#735541] transition-colors text-sm font-medium"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                      </svg>
                      ADD EXTRA
                    </button>
                  </div>

                  {/* Extra Item Form (Matches reference bg-gray-50 layout) */}
                  {isExtraFormOpen && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                          type="text"
                          placeholder="Enter item name"
                          value={newExtraName}
                          onChange={e => setNewExtraName(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <input
                            type="number"
                            min="0" step="0.01"
                            placeholder="0.00"
                            value={newExtraPrice}
                            onChange={e => setNewExtraPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] transition-all appearance-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={newExtraQuantity}
                            onChange={e => setNewExtraQuantity(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] transition-all appearance-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleAddExtraItem}
                          className="px-4 py-2 bg-[#86644c] text-white rounded hover:bg-[#735541] text-sm font-medium transition-colors"
                        >
                          Add Item
                        </button>
                        <button
                          onClick={() => setIsExtraFormOpen(false)}
                          className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Added Items List (Converted to reference 4-column grid) */}
                  <div className="space-y-3">
                    {extraItems.length === 0 ? (
                      <p className="text-[14px] text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No extra items added yet.
                      </p>
                    ) : (
                      extraItems.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between gap-4 shadow-sm">
                          <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Name</label>
                              {/* Using readOnly inputs to perfectly match the reference design without breaking logic */}
                              <input readOnly value={item.name} className="w-full border border-gray-200 bg-gray-50 rounded px-2 py-1 text-sm text-gray-900 outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Price</label>
                              <input readOnly value={`$${parseFloat(item.price).toFixed(2)}`} className="w-full border border-gray-200 bg-gray-50 rounded px-2 py-1 text-sm text-gray-900 outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                              <input readOnly value={item.quantity} className="w-full border border-gray-200 bg-gray-50 rounded px-2 py-1 text-sm text-gray-900 outline-none appearance-none" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                              <p className="text-sm font-semibold text-gray-900">${(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setExtraItems(prev => prev.filter(i => i.id !== item.id))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors mt-4"
                            title="Remove item"
                          >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                              <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}



          {step === 5 && (
    <div className="flex flex-col animate-fadeIn h-full font-sans space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {/* Style tag to hide number input arrows globally for this component */}
        <style>{`
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type='number'] {
                -moz-appearance: textfield;
            }
        `}</style>

        {/* Calculate Grand Total dynamically */}
        {(() => {
            let grandTotal = 0;
            if (machineData) grandTotal += parseFloat(machineData.price || 0);
            
            Object.values(selectedProducts).forEach(data => {
                grandTotal += (data.quantity || 0) * parseFloat(data.unitPrice || 0);
            });
            
            Object.values(selectedAddons).forEach(data => {
                grandTotal += (data.quantity || 0) * parseFloat(data.unitPrice || 0);
            });
            
            extraItems.forEach(item => {
                grandTotal += (item.quantity || 0) * parseFloat(item.price || 0);
            });

            return (
                <>
                    <h3 className="font-semibold text-lg text-gray-900">Review & Confirm</h3>

                    {/* --- Machine Section --- */}
                    {machineData && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-semibold mb-3 text-sm text-gray-800 border-b border-gray-200 pb-2">Machine</h4>
                            <div className="flex gap-4 items-center">
                                <img 
                                    src={resolveImagePath(machineData.image)} 
                                    alt={machineData.name} 
                                    className="w-20 h-20 object-contain mix-blend-multiply" 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/80" }} 
                                />
                                <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900">{machineData.name}</h5>
                                    <p className="text-sm text-gray-600">{machineData.type || 'Commercial'}</p>
                                    <p className="font-semibold mt-1 text-[#86644c]">${parseFloat(machineData.price || 0).toFixed(2)}/month</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Products Section --- */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h4 className="font-semibold mb-3 text-sm text-gray-800 border-b border-gray-100 pb-2">Products</h4>
                        <div className="space-y-3">
                            {Object.keys(selectedProducts).length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No products selected.</p>
                            ) : (
                                Object.keys(selectedProducts).map(id => {
                                    const prod = products.find(p => p.id === parseInt(id));
                                    const data = selectedProducts[id];
                                    const sub = data.quantity * parseFloat(data.unitPrice);
                                    
                                    return (
                                        <div key={id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{prod?.name}</p>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono">{prod?.sku || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => updateItemData('product', id, 'quantity', Math.max(1, data.quantity - 1))} 
                                                            className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M19 11H5V13H19V11Z"></path></svg>
                                                        </button>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value={data.quantity} 
                                                            onChange={e => updateItemData('product', id, 'quantity', parseInt(e.target.value) || 1)} 
                                                            className="w-12 h-6 text-center border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#86644c] appearance-none" 
                                                        />
                                                        <button 
                                                            onClick={() => updateItemData('product', id, 'quantity', data.quantity + 1)} 
                                                            className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
                                                        </button>
                                                    </div>
                                                    {/* Price Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">$</span>
                                                        <input 
                                                            type="number" 
                                                            min="0" step="0.01" 
                                                            value={data.unitPrice} 
                                                            onChange={e => updateItemData('product', id, 'unitPrice', e.target.value)} 
                                                            className="w-20 h-6 px-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#86644c] appearance-none" 
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#86644c]">${sub.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => toggleProductSelection({ id: parseInt(id) })} 
                                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* --- Add-ons Section --- */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h4 className="font-semibold mb-3 text-sm text-gray-800 border-b border-gray-100 pb-2">Add-ons</h4>
                        <div className="space-y-3">
                            {Object.keys(selectedAddons).length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No add-ons selected.</p>
                            ) : (
                                Object.keys(selectedAddons).map(id => {
                                    const addon = addons.find(a => a.id === parseInt(id));
                                    const data = selectedAddons[id];
                                    const sub = data.quantity * parseFloat(data.unitPrice);
                                    
                                    return (
                                        <div key={id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{addon?.name}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => updateItemData('addon', id, 'quantity', Math.max(1, data.quantity - 1))} 
                                                            className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M19 11H5V13H19V11Z"></path></svg>
                                                        </button>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value={data.quantity} 
                                                            onChange={e => updateItemData('addon', id, 'quantity', parseInt(e.target.value) || 1)} 
                                                            className="w-12 h-6 text-center border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#86644c] appearance-none" 
                                                        />
                                                        <button 
                                                            onClick={() => updateItemData('addon', id, 'quantity', data.quantity + 1)} 
                                                            className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
                                                        </button>
                                                    </div>
                                                    {/* Price Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">$</span>
                                                        <input 
                                                            type="number" 
                                                            min="0" step="0.01" 
                                                            value={data.unitPrice} 
                                                            onChange={e => updateItemData('addon', id, 'unitPrice', e.target.value)} 
                                                            className="w-20 h-6 px-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#86644c] appearance-none" 
                                                        />
                                                        <span className="text-xs text-gray-500">/mo</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#86644c]">${sub.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => toggleAddonSelection({ id: parseInt(id) })} 
                                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* --- Extra Items Section --- */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h4 className="font-semibold mb-3 text-sm text-gray-800 border-b border-gray-100 pb-2">Extra Items</h4>
                        <div className="space-y-3">
                            {extraItems.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No extra items added.</p>
                            ) : (
                                extraItems.map(item => {
                                    const sub = item.quantity * parseFloat(item.price);
                                    
                                    return (
                                        <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => updateExtraField(item.id, 'quantity', Math.max(1, item.quantity - 1))} 
                                                            className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M19 11H5V13H19V11Z"></path></svg>
                                                        </button>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value={item.quantity} 
                                                            onChange={e => updateExtraField(item.id, 'quantity', parseInt(e.target.value) || 1)} 
                                                            className="w-12 h-6 text-center border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#86644c] appearance-none" 
                                                        />
                                                        <button 
                                                            onClick={() => updateExtraField(item.id, 'quantity', item.quantity + 1)} 
                                                            className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
                                                        </button>
                                                    </div>
                                                    {/* Price Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">$</span>
                                                        <input 
                                                            type="number" 
                                                            min="0" step="0.01" 
                                                            value={item.price} 
                                                            onChange={e => updateExtraField(item.id, 'price', e.target.value)} 
                                                            className="w-20 h-6 px-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#86644c] appearance-none" 
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#86644c]">${sub.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setExtraItems(prev => prev.filter(i => i.id !== item.id))} 
                                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* --- Summary Block --- */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm mt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-800">
                                <span>Subscription Days:</span>
                                <span className="font-semibold">{subscriptionDays} days</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 text-gray-900">
                                <span>Total:</span>
                                <span className="text-[#86644c]">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </>
            );
        })()}
    </div>
)}












          {step === 6 && (
            <div className="flex flex-col animate-fadeIn">
              {/* Order Summary */}
              <OrderSummary />

              <div>
                <h4 className="text-[16px] font-bold text-[#374151] mb-3">Select Payment Method</h4>

                {isLoadingCards ? (
                  <div className="flex items-center justify-center py-8 text-gray-500 text-[14px]">
                    <svg className="animate-spin w-5 h-5 mr-2 text-[#86644c]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading saved cards...
                  </div>
                ) : savedCards.length === 0 ? (
                  /* No cards state */
                  <div className="flex flex-col items-center justify-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-[10px] text-center">
                    <p className="text-[15px] font-semibold text-gray-700 mb-1">No saved cards found for this user </p>   
                  </div>
                ) : (
                  /* Cards list */
                  <div className="flex flex-col gap-3">
                    {savedCards.map((card) => {
                      const isCardSelected = selectedCard?.id === card.id;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCard(card)}
                          className={`relative flex flex-col p-4 border-2 rounded-[10px] cursor-pointer transition-all duration-200 ${isCardSelected
                            ? 'border-[#86644c] bg-[#fef7e8] shadow-sm'
                            : 'border-[#e5e7eb] bg-white hover:border-gray-300'
                            }`}
                        >
                          {/* Top row: brand badge + label + radio */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <CardBrandBadge brand={card.brand} />
                              <div>
                                <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">{card.funding}</p>
                                <p className="text-[12px] text-gray-400 capitalize">{card.brand}</p>
                              </div>
                            </div>
                            {/* Radio */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCardSelected ? 'border-[#86644c] bg-[#86644c]' : 'border-gray-300 bg-white'}`}>
                              {isCardSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                          </div>

                          {/* Card details */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium mb-0.5">Cardholder Name</p>
                              <p className="text-[14px] font-semibold text-gray-800">{card.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium mb-0.5">Card Number</p>
                              <p className="text-[14px] font-semibold text-gray-800 tracking-wider">•••• •••• •••• {card.last4}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium mb-0.5">Expires</p>
                              <p className="text-[14px] font-semibold text-gray-800">{String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

{step === 7 && orderResult && (
    <div className="flex flex-col animate-fadeIn h-full font-sans">
        <div className="text-center py-10 space-y-4">
            {orderResult.success ? (
                <>
                    {/* Success State */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-4xl text-green-600">✓</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-green-700">Success!</h3>
                    
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        Subscription to <strong>{machineData?.name || 'the selected plan'}</strong> has been successfully created for <strong>{selectedCustomer?.name} ({selectedCustomer?.email})</strong>.
                    </p>
                    
                    <button 
                        onClick={onClose} 
                        className="mt-6 bg-[#86644c] text-white px-8 py-3 rounded-lg hover:bg-[#735541] transition-colors font-medium outline-none"
                    >
                        Done
                    </button>
                </>
            ) : (
                <>
                    {/* Failure State */}
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-4xl text-red-600">✕</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-red-700">Something Went Wrong</h3>
                    
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        {orderResult.message || 'The subscription could not be created. Please check the details and try again.'}
                    </p>
                    
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button 
                            onClick={() => setStep(6)} 
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium outline-none"
                        >
                            Try Again
                        </button>
                        <button 
                            onClick={onClose} 
                            className="px-6 py-3 bg-[#86644c] text-white rounded-lg hover:bg-[#735541] transition-colors font-medium outline-none"
                        >
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
)}

        </div>

        {step !== 7 && (
          <div className="px-6 py-4 border-t border-[#e5e7eb] bg-gray-50/50 rounded-b-[6px] shrink-0">

            {step === 1 && (
              <div className="w-full flex justify-end gap-3">
                <button onClick={onClose} className="h-[40px] px-6 text-[#4b5563] text-[14px] font-bold rounded-[6px] hover:bg-gray-100 transition-colors">Cancel</button>
                <button onClick={handleNextToProducts} disabled={!selectedCustomer} className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50">
                  Next: Select Products
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="w-full flex justify-between items-center">
                <div className="text-[15px] text-gray-700">Subtotal: <span className="font-bold text-[#1f2937]">${totalSubtotal.toFixed(2)}</span></div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="h-[40px] px-5 text-[#4b5563] border border-gray-300 bg-white text-[14px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handleNextToAddons} disabled={Object.keys(selectedProducts).length === 0} className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50">
                    Next: Select Add-ons
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="w-full flex justify-between items-center">
                <div className="text-[15px] text-gray-700">Subtotal: <span className="font-bold text-[#1f2937]">${totalSubtotal.toFixed(2)}</span></div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="h-[40px] px-5 text-[#4b5563] border border-gray-300 bg-white text-[14px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handleNextToExtraItems} className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm">
                    Next: Extra Items
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="w-full flex justify-between items-center">
                <div className="text-[15px] text-gray-700">Total: <span className="font-bold text-[#1f2937]">${totalSubtotal.toFixed(2)}</span></div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="h-[40px] px-5 text-[#4b5563] border border-gray-300 bg-white text-[14px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handleNextToReview} className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm">
                    Next: Review
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-[14px] text-gray-600 font-medium">
                    Subscription Days: <span className="text-gray-900 font-bold">{subscriptionDays} days</span>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-[14px] text-gray-600 font-medium">
                    Total: <span className="text-[18px] font-bold text-[#86644c] ml-1">${grandTotal.toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="h-[40px] px-5 text-[#4b5563] border border-gray-300 bg-white text-[14px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handleNextToPayment} className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm">
                    Next: Payment
                  </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="w-full flex justify-between items-center">
                <div className="text-[14px] text-gray-600 font-medium">
                  Total: <span className="text-[18px] font-bold text-[#86644c] ml-1">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(5)} className="h-[40px] px-5 text-[#4b5563] border border-gray-300 bg-white text-[14px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors" disabled={isSubmittingOrder}>
                    Back
                  </button>

                  {savedCards.length > 0 ? (
                    /* Has cards → Pay button */
                    <button
                      onClick={handlePayWithCard}
                      disabled={!selectedCard || isSubmittingOrder}
                      className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pay ${grandTotal.toFixed(2)}
                        </>
                      )}
                    </button>
                  ) : (
                    /* No cards → Send Invoice button */
                    <button
                      onClick={handleSendInvoice}
                      disabled={isSubmittingOrder}
                      className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-bold rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Invoice
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};