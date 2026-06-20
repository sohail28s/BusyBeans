import React, { useRef, useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { getAuthConfig } from '../../../utils/orderUtils'; 

export const CancelSubscriptionModal = ({ isOpen, onClose, subscriptionId, onSuccess }) => { 
    const modalRef = useRef(null); 
    const [isCanceling, setIsCanceling] = useState(false); 

    // Close on outside click 
    useEffect(() => { 
        const handleOutsideClick = (e) => { 
            if (modalRef.current && !modalRef.current.contains(e.target)) { 
                if (!isCanceling) onClose(); 
            } 
        }; 
        if (isOpen) document.addEventListener('mousedown', handleOutsideClick); 
        return () => document.removeEventListener('mousedown', handleOutsideClick); 
    }, [isOpen, onClose, isCanceling]); 

    const handleCancelSubscription = async () => { 
        if (!subscriptionId) return; 
        setIsCanceling(true); 
        const loadingId = toast.loading("Canceling subscription..."); 
        
        try { 
            const response = await axios.post( 
                `https://testingbb.trimworldwide.com/api/v1/subscription/${subscriptionId}/cancel`, 
                {}, // Send empty body so auth config is correctly placed in headers
                getAuthConfig() 
            ); 
            
            // Check if successful based on standard API response patterns 
            if (response.data?.success || response.data?.status === 'success' || response.status === 200) { 
                toast.update(loadingId, { render: response.data?.message || "Subscription canceled successfully!", type: "success", isLoading: false, autoClose: 3000 }); 
                if (onSuccess) onSuccess(); // Trigger re-fetch on the main page 
                onClose(); 
            } else { 
                throw new Error(response.data?.message || "Failed to cancel subscription."); 
            } 
        } catch (error) { 
            toast.update(loadingId, { render: error.response?.data?.message || error.message || "An error occurred while canceling.", type: "error", isLoading: false, autoClose: 4000 }); 
        } finally { 
            setIsCanceling(false); 
        } 
    }; 

    if (!isOpen) return null; 

    return ( 
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"> 
            <div 
                ref={modalRef} 
                className="bg-white w-full max-w-[500px] rounded-lg shadow-xl flex flex-col font-sans animate-fadeIn" 
            > 
                {/* Header */} 
                <div className="flex items-center justify-between p-5 md:p-6"> 
                    <h2 className="text-lg font-semibold text-gray-900"> 
                        Cancel Subscription 
                    </h2> 
                    <button 
                        onClick={onClose} 
                        disabled={isCanceling} 
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 outline-none" 
                    > 
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"> 
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> 
                        </svg> 
                    </button> 
                </div> 

                {/* Body Content */} 
                <div className="px-5 md:px-6 pb-6 space-y-4"> 
                    <p className="text-gray-700 text-[15px]"> 
                        Are you sure you want to cancel this subscription? This action cannot be undone. 
                    </p> 
                    
                    {/* Footer Buttons */} 
                    <div className="flex justify-end gap-3 pt-4"> 
                        <button 
                            onClick={onClose} 
                            disabled={isCanceling} 
                            className="px-4 py-2 border border-gray-300 bg-white rounded text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 outline-none" 
                        > 
                            No, Keep Subscription 
                        </button> 
                        <button 
                            onClick={handleCancelSubscription} 
                            disabled={isCanceling} 
                            className="px-4 py-2 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[180px] outline-none" 
                        > 
                            {isCanceling ? ( 
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> 
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> 
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> 
                                </svg> 
                            ) : ( 
                                "Yes, Cancel Subscription" 
                            )} 
                        </button> 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
};