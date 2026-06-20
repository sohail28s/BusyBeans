import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader'; 
import { exportToCSV } from '../../utils/csvHelper';
import { PurchasedSubscriptionsTable } from '../../ComponentsTemp/MachineSubscriptions/Purchased/PurchasedSubscriptionTable';
import {CancelSubscriptionModal} from '../../ComponentsTemp/MachineSubscriptions/Purchased/CancelSubscriptionModal'
const API_URL = "https://testingbb.trimworldwide.com/api/v1/subscription/list";

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const PurchasedSubscriptions = () => {
    const navigate = useNavigate();
    // --- Top Navbar Hooks ---
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
     const setShowProfile = useStore((state) => state.setShowProfile);
     const setIsGlobalLoading = useStore((state)=>state.setIsGlobalLoading);

    // --- Data States ---
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);

    // Set Page Title cleanly
    useEffect(() => {
        setTitle('Purchased Subscriptions');
        setActions(null);
        setShowProfile(false);
        

        return () => {
            setTitle('');
            setShowProfile(true);
        };
    }, [setTitle, setActions , setShowProfile]);

    // --- Fetch Data ---
    const fetchSubscriptions = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const response = await axios.get(API_URL, getAuthConfig());
            if (response.data?.success) {
                setSubscriptions(response.data.subscriptions || []);
            } else {
                toast.error("Failed to fetch subscriptions.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred fetching data.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // --- Global Search Filter ---
    const filteredSubscriptions = useMemo(() => {
        if (!searchQuery.trim()) return subscriptions;
        const lowerQuery = searchQuery.toLowerCase();

        return subscriptions.filter(sub => {
            return (
                sub.customerEmail?.toLowerCase().includes(lowerQuery) ||
                sub.userName?.toLowerCase().includes(lowerQuery) ||
                sub.machine?.name?.toLowerCase().includes(lowerQuery) ||
                sub.stripeCustomerId?.toLowerCase().includes(lowerQuery) ||
                sub.status?.toLowerCase().includes(lowerQuery)
            );
        });
    }, [subscriptions, searchQuery]);

    // --- Actions ---
    const handleDownloadCSV = () => {
        // Flatten nested data (like machine.name) for clean CSV export
        const csvData = filteredSubscriptions.map(sub => ({
            "ID": sub.id,
            "Customer Email": sub.customerEmail,
            "Customer Name": sub.userName,
            "Machine Name": sub.machine?.name || 'N/A',
            "Machine Price ($)": sub.machinePrice,
            "Products Total ($)": sub.productsTotal,
            "Addons Total ($)": sub.addonsTotal,
            "Total Price ($)": sub.totalPrice,
            "Subscription Days": sub.subscriptionDays,
            "Status": sub.status,
            "Period Start": new Date(sub.currentPeriodStart).toLocaleDateString(),
            "Period End": new Date(sub.currentPeriodEnd).toLocaleDateString(),
            "Created At": new Date(sub.createdAt).toLocaleDateString()
        }));

        exportToCSV(csvData, "purchased_subscriptions.csv");
        toast.success("CSV Downloaded Successfully");
    };

const handleViewDetails = (subscription) => {
        // Navigates to /purchased/{subscription.id}
        navigate(`/purchased/${subscription.id}`);
    };
    const handleDelete = (subscription) => {
        setSubscriptionToCancel(subscription.id);
        setIsCancelModalOpen(true);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans pb-16">
            <div className="px-8 pt-8">
                <PageStatsHeader
                    cardTitle="Total Subscriptions"
                    totalValue={subscriptions.length}
                />
                <PurchasedSubscriptionsTable
                    data={filteredSubscriptions}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onDownloadCSV={handleDownloadCSV}
                    onViewDetails={handleViewDetails}
                    onDelete={handleDelete}
                />



                <CancelSubscriptionModal
                    isOpen={isCancelModalOpen}
                    onClose={() => {
                        setIsCancelModalOpen(false);
                        setSubscriptionToCancel(null);
                    }}
                    subscriptionId={subscriptionToCancel}
                    onSuccess={fetchSubscriptions} // Pass your fetch function to reload data automatically
                />

            </div>
        </div>
    );
};

export default PurchasedSubscriptions;