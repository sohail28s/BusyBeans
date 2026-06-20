import React from 'react';

export const InvoiceInfoBanner = ({ viewProductsToggle, invoiceTypeToggle }) => {
    
    const inventoryOwner = viewProductsToggle === 'admin' ? 'Admin' : 'Local Partner';
    const targetEntity = invoiceTypeToggle;

    return (
        <div className="w-full bg-[#fdf8f0] border border-[#f5e5ce] rounded-[8px] p-5 shadow-sm text-[14px] text-gray-800 font-sans leading-relaxed">
            <span className="text-[#86644C]">You are viewing <strong>{inventoryOwner} inventory.</strong></span>
            <br/>
            <span className="text-[#86644C]">The invoice will be created for {inventoryOwner.toLowerCase()} <strong>{targetEntity}</strong>. Select company below, add items, then Generate Invoice.</span>
        </div>
    );
};