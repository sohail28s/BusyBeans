import React from 'react';

export const ActionModalOrders = ({ isOpen, onClose, onConfirm, title, warningText, confirmText, buttonText, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-md w-full max-w-[450px] shadow-2xl flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                   
                    <h3 className="text-[18px] font-bold text-[#374151] w-full text-center pl-6">{title}</h3>
                    <button 
                        onClick={onClose} 
                        disabled={isLoading} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 flex flex-col items-center text-center gap-3">
                    <p className="text-[#dc2626] text-[14px] font-medium">{warningText}</p>
                    <p className="text-gray-700 text-[15px]">{confirmText}</p>
                    
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={onClose} 
                            disabled={isLoading}
                            className="px-6 py-2 bg-white border border-[#86644C] text-[#86644C] text-[14px] font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm} 
                            disabled={isLoading}
                            className="px-6 py-2 bg-[#86644C] text-white text-[14px] font-medium rounded shadow-sm hover:bg-[#6c4f3b] transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionModalOrders;