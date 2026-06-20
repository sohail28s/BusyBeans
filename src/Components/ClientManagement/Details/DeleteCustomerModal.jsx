import React from 'react';

const DeleteCustomerModal = ({ isOpen, onClose, onDelete, isDeleting, customerName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[480px] rounded-[8px] p-8 shadow-xl flex flex-col font-sans">
                <h2 className="text-[20px] font-bold text-black mb-3">Delete Customer Account</h2>
                <p className="text-[16px] text-[#64748b]">Are you sure you want to delete {customerName}?</p>
                <div className="flex justify-end gap-3 mt-10">
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting} 
                        className="px-6 py-2 border border-gray-200 rounded-[4px] text-[15px] font-medium text-black bg-white hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onDelete} 
                        disabled={isDeleting} 
                        className="px-6 py-2 bg-[#dc2626] text-white text-[15px] font-medium rounded-[4px] hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCustomerModal;