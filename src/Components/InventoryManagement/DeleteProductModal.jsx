import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; 
const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const DeleteProductModal = ({ isOpen, onClose, productId, onSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;
    const handleDelete = async () => {
        if (!productId || isDeleting) return;

        setIsDeleting(true);
        const loadingToast = toast.loading("Deleting product...");

        try {
            const response = await axios.delete(`https://testingbb.trimworldwide.com/api/v1/admin/product/${productId}`, getAuthConfig());
            
            if (response.data?.status === 'success' || response.status === 200) {
                toast.update(loadingToast, { render: "Product deleted successfully.", type: "success", isLoading: false, autoClose: 2000 });
                onSuccess();
                onClose();
            } else {
                throw new Error("Deletion failed on server.");
            }
        } catch (error) {
            console.error("Deletion error:", error);
            // Show error toast on failure
            toast.update(loadingToast, { render: error.response?.data?.message || "An error occurred during deletion.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            // Reset loading state
            setIsDeleting(false);
        }
    };

    return (
        // Modal Overlay with backdrop blur for similarity to your screenshots
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            
            {/* Modal Container: SMALL size and rounded corners matching */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-scaleIn">
                
                {/* Header section with centered Title and close icon as in */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 relative">
                    <h3 className="text-[20px] font-semibold text-[#374151] w-full text-center">Delete Stock/ Inventory</h3>
                    
                    {/* Replicated Close 'X' icon from */}
                    <button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body section with centered text */}
                <div className="p-6 text-center">
                    {/* USER INSTRUCTION: Use text exact like that in the image */}
                    <p className="text-[16px] text-[#4b5563] mb-6">Are you sure you want to delete this Stock ?</p>
                </div>

                {/* Footer section with centered action buttons matching */}
                <div className="px-6 py-4 flex gap-2 justify-center border-t border-gray-100 bg-gray-50">
                    
                    {/* USER INSTRUCTION: Cancel Button style is light with brown/tan text & border */}
                    <button 
                        onClick={onClose} 
                        className="h-[40px] px-6 border border-[#8C6D4F] text-[#8C6D4F] text-[14px] font-medium rounded-[4px] hover:bg-gray-100 transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    
                    {/* USER INSTRUCTION: Primary primary (Delete) style is brown/tan background with white text */}
                    <button 
                        onClick={handleDelete} 
                        className="h-[40px] px-6 bg-[#8C6D4F] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#7a5e42] transition-colors flex items-center justify-center gap-1.5"
                        disabled={isDeleting}
                    >
                        {/* Loading spinner during deletion */}
                        {isDeleting && (
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        Delete Stock
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DeleteProductModal;