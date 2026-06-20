import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore'; // Added useStore import
import { CancelSubscriptionModal } from '../../Components/MachineSubscriptions/Purchased/CancelSubscriptionModal';
import { getAuthConfig } from '../../utils/orderUtils';
export const SubscriptionDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // 1. Top Navbar Zustand Hooks
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
        const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);


    // 2. State Management
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // 3. API Fetching Logic
    const fetchSubscriptionDetails = useCallback(async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `https://testingbb.trimworldwide.com/api/v1/subscription/${id}`,
                getAuthConfig()
            );
            if (response.data?.success) {
                setSubscription(response.data.subscription);
            } else {
                throw new Error(response.data?.message || "Failed to fetch details.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            const errMsg = err.response?.data?.message || err.message || "An error occurred.";
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchSubscriptionDetails();
        }
    }, [id, fetchSubscriptionDetails]);

    // Derived logic for status
    const isActive = subscription?.status?.toLowerCase() === 'active';


    // 4. Update Top Navbar dynamically
    useEffect(() => {
        // Set Title with integrated Back Button
        setTitle(
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black mt-1 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <span className="text-[24px] font-bold text-[#111827]">Subscription Details</span>
            </div>
        );
        setShowProfile(false);

        // Set Actions (Cancel Button) if subscription is active
        // Set Actions (Cancel Button) ALWAYS visible for admin if data is loaded
        if (subscription) {
            setActions(
                <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="h-[42px] px-6 bg-[#ef4444] text-white text-[14px] font-semibold rounded-[6px] hover:bg-[#dc2626] transition-colors shadow-sm"
                >
                    Cancel Subscription
                </button>
            );
        } else {
            setActions(null);
        }

        // Cleanup on unmount
        return () => {
            setTitle('');
            setShowProfile(true);
            setActions(null);
        };
    }, [navigate, setTitle, setActions, subscription  , setShowProfile]); // <-- Note 'subscription' here instead of 'canCancel'

    // 5. Helper for Date Formatting
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        });
    };

    // 6. Shared classes for data display pairs
    const DataPair = ({ label, value }) => (
        <div className="flex flex-col gap-1.5">
            <span className="text-[14px] text-[#6b7280] font-sans">{label}</span>
            <span className="text-[16px] text-[#111827] font-medium font-sans break-all">
                <span className=''></span>
                {value || '-'}
            </span>
        </div>
    );

    // 7. Common Card wrapper
    const Card = ({ children, className = "" }) => (
        <div className={`bg-white p-8 rounded-[12px] border border-[#e5e7eb] shadow-sm ${className}`}>
            {children}
        </div>
    );

    // 8. Render Loading & Error States
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-[#f9fafb] gap-4">
                <svg className="animate-spin h-10 w-10 text-[#86644c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="text-gray-500 font-medium">Loading details...</span>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-[#f9fafb] gap-6 p-4">
                <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200 text-center max-w-md">
                    <h3 className="font-bold text-lg mb-2">Error Loading Subscription</h3>
                    <p>{error || "Subscription not found."}</p>
                </div>
            </div>
        );
    }

    // --- MAIN RENDER ---
    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#f9fafb] p-6 md:p-10 font-sans">
            
            {/* Main Content Area */}
            <div className="flex flex-col gap-6 max-w-[1200px] mx-auto mt-2">
                
                {/* Subscription Information Card */}
                <Card>
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-[20px] font-bold text-[#111827]">Subscription Information</h2>
                        <span className={`px-4 py-1.5 text-[12px] font-bold uppercase rounded-full ${isActive ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-gray-100 text-gray-700'}`}>
                            {subscription.status || 'UNKNOWN'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <DataPair label="Customer Email" value={subscription.customerEmail} />
                        <DataPair label="Customer Name" value={subscription.userName} />
                        <DataPair label="Subscription ID" value={subscription.id} />
                        <DataPair label="Stripe Subscription ID" value={subscription.stripeSubscriptionId} />
                        <DataPair label="Current Period Start" value={formatDate(subscription.currentPeriodStart)} />
                        <DataPair label="Current Period End" value={formatDate(subscription.currentPeriodEnd)} />
                        <DataPair label="Subscription Days" value={`${subscription.subscriptionDays} days`} />
                        
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[14px] text-[#6b7280]">Total Price</span>
                            <span className="text-[20px] text-[#86644c] font-bold">
                                ${parseFloat(subscription.totalPrice || 0).toFixed(2)}/mo
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Machine Information Card */}
                {subscription.machine && (
                    <Card>
                        <h2 className="text-[20px] font-bold text-[#111827] mb-8">Machine Information</h2>
                        <div className="flex flex-col gap-3">
                            <span className="text-[22px] font-bold text-[#111827]">
                                {subscription.machine.name}
                            </span>
                            <span className="text-[16px] text-[#6b7280]">
                                {subscription.machine.tag || subscription.machine.type || 'Service'}
                            </span>
                            <span className="text-[20px] text-[#86644c] font-bold mt-2">
                                ${parseFloat(subscription.machinePrice || subscription.machine.price || 0).toFixed(2)}/month
                            </span>
                        </div>
                    </Card>
                )}

                {/* Products Card */}
                {subscription.products && subscription.products.length > 0 && (
                    <Card className="p-0 overflow-hidden">
                        <div className="p-8 pb-4">
                            <h2 className="text-[20px] font-bold text-[#111827]">Products</h2>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {subscription.products.map((prod) => {
                                const subProd = prod.subscriptionProduct || {};
                                const quantity = subProd.quantity || prod.quantity || 1;
                                const unitPrice = subProd.unitPrice || prod.price || 0;
                                const rowTotal = subProd.totalPrice || (quantity * unitPrice);

                                return (
                                    <div key={prod.id} className="p-8 flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[18px] font-semibold text-[#111827]">
                                                {prod.name}
                                            </span>
                                            <span className="text-[14px] text-[#6b7280]">
                                                SKU: {prod.sku || '-'}
                                            </span>
                                            <span className="text-[14px] text-[#6b7280]">
                                                Quantity: {quantity} × ${parseFloat(unitPrice).toFixed(2)}
                                            </span>
                                        </div>
                                        <span className="text-[18px] font-semibold text-[#111827] whitespace-nowrap">
                                            ${parseFloat(rowTotal).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-[#fafafa]">
                            <span className="text-[18px] font-bold text-[#111827]">Products Total</span>
                            <span className="text-[22px] font-bold text-[#111827]">
                                ${parseFloat(subscription.productsTotal || 0).toFixed(2)}
                            </span>
                        </div>
                    </Card>
                )}

                {/* Add-ons Section */}
                {subscription.addons && subscription.addons.length > 0 && (
                    <Card className="p-0 overflow-hidden">
                        <div className="p-8 pb-4">
                            <h2 className="text-[20px] font-bold text-[#111827]">Add-ons</h2>
                        </div>
                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                            {subscription.addons.map((addon) => (
                                <div key={addon.id} className="p-8 flex items-center justify-between">
                                    <span className="text-[18px] font-semibold text-[#111827]">{addon.name}</span>
                                    <span className="text-[18px] font-semibold text-[#111827]">
                                        ${parseFloat(addon.price || 0).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-[#fafafa]">
                            <span className="text-[18px] font-bold text-[#111827]">Add-ons Total</span>
                            <span className="text-[22px] font-bold text-[#111827]">
                                ${parseFloat(subscription.addonsTotal || 0).toFixed(2)}
                            </span>
                        </div>
                    </Card>
                )}

                {/* Payment Information Card */}
                <Card>
                    <h2 className="text-[20px] font-bold text-[#111827] mb-8">Payment Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <DataPair label="Payment Method ID" value={subscription.paymentMethodId || "-"} />
                        <DataPair label="Stripe Customer ID" value={subscription.stripeCustomerId} />
                    </div>
                </Card>

                {/* Total Monthly Amount */}
                <div className="bg-[#f3f4f6] p-8 rounded-[12px] border border-[#e5e7eb] flex justify-between items-center mb-10">
                    <span className="text-[20px] font-bold text-[#111827]">Total Monthly Amount</span>
                    <span className="text-[32px] font-bold text-[#86644c]">
                        ${parseFloat(subscription.totalPrice || 0).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Modal */}
            <CancelSubscriptionModal 
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                subscriptionId={subscription?.id}
                onSuccess={() => {
                    fetchSubscriptionDetails();
                    setIsCancelModalOpen(false);
                }} 
            />
        </div>
    );
};

export default SubscriptionDetailsPage;