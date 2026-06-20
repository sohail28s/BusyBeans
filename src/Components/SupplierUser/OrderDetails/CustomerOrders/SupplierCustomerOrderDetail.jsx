import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../../../Hooks/useStore';
import { ProgressTracker } from '../../../Shared/OrderDetails/ProgressTracker';

const SupplierCustomerOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const setStoreTitle = useStore(state => state.setTitle);
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);
    const userRole = useStore(state => state.userRole);

    // Initial state can come from the router if they clicked from the table, 
    // but we will fetch the deep details anyway to get the full histories & items.
    const [order, setOrder] = useState(location.state?.orderData || null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        setStoreTitle(`Order Details / ${id}`);
        return () => setStoreTitle('');
    }, [id, setStoreTitle]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/order-details/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            
            if (res.data.status === 'success') {
                setOrder(res.data.data.order);
            } else {
                toast.error("Failed to load order details.");
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
            toast.error("Error loading order details.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const handleStatusUpdate = async (newStatusId) => {
        setIsUpdatingStatus(true);
        try {
            const payload = {
                orderId: Number(id), 
                orderData: {
                    statusId: newStatusId
                }
            };

            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/supplier-acknowledgement`, 
                payload,
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );

            if (res.data.status === 'success') {
                toast.success("Order status updated successfully!");
                fetchOrderDetails(); 
            } else {
                toast.error(res.data.message || "Failed to update status.");
            }
        } catch (error) {
            toast.error("An error occurred while updating the status.");
            console.error(error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (isLoading && !order) return null;
    if (!order) return <div className="p-8 text-center text-gray-500">Order not found.</div>;

    const addr = order.address || {};
    const formattedAddress = `${addr.addressLineOne || ''} ${addr.addressLineTwo || ''} ${addr.town || ''}, ${addr.state || ''} ${addr.zipCode || ''} ${addr.country || ''}`.trim();
    const currentStatusId = order.statusId;

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-[#f9fafb] p-6 md:p-8 font-sans">
            
            {/* Header Area */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Order / {order.id}
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            currentStatusId === 2 ? 'bg-blue-100 text-blue-700' :
                            currentStatusId === 3 ? 'bg-yellow-100 text-yellow-700' :
                            currentStatusId === 5 ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {order.orderCurrentStatus}
                        </span>
                    </h1>
                </div>

                {/* Conditional Action Button */}
                {userRole === 'supplier' && (
                    <div className="flex gap-3">
                        {currentStatusId === 2 && (
                            <button 
                                onClick={() => handleStatusUpdate(3)} // Move to Acknowledged
                                disabled={isUpdatingStatus}
                                className="bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Acknowledge order'}
                            </button>
                        )}
                        {currentStatusId === 3 && (
                            <button 
                                onClick={() => handleStatusUpdate(5)} // Move to Shipped
                                disabled={isUpdatingStatus}
                                className="bg-[#86644c] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#6b4e3b] transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Mark as Shipped'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Deliver To Section */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-bold text-gray-900">Deliver To</h2>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded uppercase tracking-wider">
                            {order.shippingCompany || "N/A"}
                        </span>
                    </div>
                    <p className="text-gray-600 text-[15px] uppercase">
                        {formattedAddress} 
                        {order.user?.phoneNumber && <span className="ml-2">PHONE: {order.user.countryCode} {order.user.phoneNumber}</span>}
                    </p>
                </div>

                {/* Progress Tracker Area */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    {/* Make sure your OrderProgressTracker component accepts these props */}
                    <ProgressTracker 
                        currentStatusId={order.statusId} 
                        histories={order.orderHistories || []} 
                    />
                </div>

                {/* Items Table */}
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 font-bold text-gray-900 text-sm bg-gray-50 first:rounded-tl-lg">SKU</th>
                                    <th className="py-3 px-4 font-bold text-gray-900 text-sm bg-gray-50">Name</th>
                                    <th className="py-3 px-4 font-bold text-gray-900 text-sm bg-gray-50">Grind</th>
                                    <th className="py-3 px-4 font-bold text-gray-900 text-sm bg-gray-50 text-center">Qty.</th>
                                    <th className="py-3 px-4 font-bold text-gray-900 text-sm bg-gray-50 text-center">Paid</th>
                                    <th className="py-3 px-4 font-bold text-gray-900 text-sm bg-gray-50 text-center last:rounded-tr-lg">Dispatched</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-sm text-gray-600">{item.supplierSku || "—"}</td>
                                            <td className="py-4 px-4 text-sm text-gray-900 font-medium">{item.product || "—"}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{item.grind || "—"}</td>
                                            <td className="py-4 px-4 text-sm text-gray-900 font-medium text-center">{item.qty || 0}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600 text-center capitalize">{order.paymentStatus || "Unpaid"}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600 text-center">
                                                {currentStatusId >= 5 ? "Yes" : "No"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500 italic">No items found for this order.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="6" className="py-4 px-4 text-sm font-semibold text-gray-900 bg-gray-50 rounded-b-lg">
                                        Total weight: {order.totalWeight || "0.00"} lbs
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupplierCustomerOrderDetail;