import React, { useState } from 'react';

const InfoRow = ({ label, value, isLink, linkType, linkValue, isActionable }) => {
    const renderValue = () => {
        if (isLink) {
            return (
                <a href={`${linkType}:${linkValue}`} className="hover:underline text-blue-500">
                    {value}
                </a>
            );
        }
        if (isActionable) {
            return <div className="text-blue-500 cursor-pointer">{value}</div>;
        }
        
        const isPlain = value === '---' || value === 'Not Assigned';
        return <div className={!isPlain ? 'font-semibold text-black' : ' text-black '}>{value}</div>;
    };

    return (
        <div className="flex items-center h-12 border-b border-gray-200 [&>span]:w-44 last:border-0">
            <span className="text-gray-500 font-medium">{label}</span>
            {renderValue()}
        </div>
    );
};

const AddressCard = ({ title, address }) => (
    <div>
        <h3 className="text-sm font-bold text-gray-700 mb-1 uppercase">{title}</h3>
        {!address ? (
            <p className="text-[13px] text-gray-400 italic">No address provided.</p>
        ) : (
            <div className="text-sm text-gray-700 space-y-1 uppercase">
                {address.addressLineOne && <div>{address.addressLineOne}</div>}
                {address.addressLineTwo && <div>{address.addressLineTwo}</div>}
                <div>
                    {address.town && `${address.town}, `}
                    {address.state} {address.zipCode}
                </div>
                <div>{address.country}</div>
                {address.email && <div className="lowercase break-all text-blue-500">{address.email}</div>}
            </div>
        )}
    </div>
);

const CustomerProfileBlock = ({ customer }) => {
    // State to handle the "Show More" expansion for discounts
    const [showAllDiscounts, setShowAllDiscounts] = useState(false);

    const discounts = customer.userDiscounts || [];
    const hasMoreDiscounts = discounts.length > 2;
    const visibleDiscounts = showAllDiscounts ? discounts : discounts.slice(0, 2);

    return (
        <div className="w-full bg-white p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Info Rows */}
                <div>
                    <InfoRow label="Company Name" value={customer.companyName || "—"} />
                    <InfoRow label="User Name" value={customer.name || "—"} />
                    <InfoRow 
                        label="Email" 
                        value={customer.emailToSendInvoices || customer.email} 
                        isLink 
                        linkType="mailto" 
                        linkValue={customer.email} 
                    />
                    <InfoRow label="Created On" value="---" />
                    <InfoRow label="Last Seen" value="---" />
                    <InfoRow 
                        label="Phone" 
                        value={customer.phoneNumber ? `${customer.countryCode || '+1'} ${customer.phoneNumber}` : "—"} 
                        isLink 
                        linkType="tel" 
                        linkValue={`${customer.countryCode || '+1'}${customer.phoneNumber}`} 
                    />
                    <InfoRow label="Local Partner" value={customer.salesRepName || "Not Assigned"} isActionable />
                    <InfoRow label="Employee" value={customer.employee || "Not Assigned"} isActionable />
                    <InfoRow label="Price List" value={`${customer.totalOrderAmount || '0.00'} (USD)`} />
                </div>
                
                {/* Right Column: Addresses & Discounts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-1 h-fit">
                    
                    <AddressCard title="SHIPPING" address={customer.addresses?.[0]} />
                    <AddressCard title="BILLING" address={customer.billingAddresses?.[0]} />

                    {/* User Discounts Implementation */}
                    <div className="md:col-span-2 mt-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">User Discounts</h2>
                        {discounts.length > 0 ? (
                            <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {visibleDiscounts.map((discount, idx) => (
                                        <div key={idx} className="flex items-center justify-between px-4 py-2">
                                            <span className="text-sm text-gray-700 whitespace-pre-line">
                                                {discount.categoryName?.trim()}
                                            </span>
                                            <span className="text-sm font-semibold text-black">
                                                {parseInt(discount.percentage)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Show More / Show Less Button */}
                                {hasMoreDiscounts && (
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAllDiscounts(!showAllDiscounts)}
                                        className="w-full text-sm text-brand-brown py-2 hover:bg-gray-50 transition-colors border-t border-gray-200"
                                    >
                                        {showAllDiscounts ? 'Show less' : `Show ${discounts.length - 2} more`}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-[13px] text-gray-400 italic">No user discounts.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerProfileBlock;