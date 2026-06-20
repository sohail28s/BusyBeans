import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../../utils/orderUtils'; 

const DeleteInvoiceModal = ({ isOpen, onClose, invoiceData, activeTab, onSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    

    if (!isOpen || !invoiceData) return null;

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
          let payloadOrderType = 'customer';
            
           if (activeTab === 'Partner Invoices' || invoiceData.salesRepName || invoiceData.orderType === 'local-partner') {
    payloadOrderType = 'local-partner';
}

            const payload = {
                orderType: payloadOrderType,
                id: invoiceData.id
            };

            const res = await axios.post(
                'https://testingbb.trimworldwide.com/api/v1/admin/order-management/delete-invoice',
                payload,
                getAuthConfig()
            );

            if (res.data.status === 'success' || res.status === 200) {
                toast.success(`Invoice ${invoiceData.invoiceNumber || invoiceData.id} deleted successfully!`);
                if (onSuccess) onSuccess(); // Trigger list refresh in parent
                onClose();
            } else {
                toast.error(res.data.message || "Failed to delete invoice.");
            }
        } catch (error) {
            console.error("Failed to delete invoice:", error);
            toast.error(error.response?.data?.message || "An error occurred while deleting the invoice.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40  flex items-center justify-center transition-all">
            <div className="bg-white rounded-[10px] w-[500px] shadow-2xl relative flex flex-col font-sans animate-fadeIn p-8">
                
                {/* Close "X" Button */}
                <button 
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Text Content */}
                <div className="text-left mt-2">
                    <h2 className="text-[24px] font-semibold text-[#2d3748] mb-4">
                        Delete Invoice
                    </h2>
                    <p className="text-[#4a5568] text-[16px] mb-8 leading-relaxed">
                        Are you sure you want to delete Invoice  
                        This action cannot be undone.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-[130px] h-[45px] border border-[#86644c] rounded-[6px] text-[15px] font-medium text-[#86644c] bg-white hover:bg-[#faf8f6] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={executeDelete}
                        disabled={isDeleting}
                        className="w-[130px] h-[45px] bg-[#86644c]  text-white text-[15px] font-medium rounded-[6px] hover:bg-[#735541] hover:text-white transition-colors flex items-center justify-center"
                    >
                        Delete
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DeleteInvoiceModal;