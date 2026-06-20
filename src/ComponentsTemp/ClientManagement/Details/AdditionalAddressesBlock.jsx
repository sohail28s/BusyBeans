import React from 'react';

const AdditionalAddressesBlock = ({ addresses, onAddClick, onEditClick, onInvoiceReminderClick }) => {
    return (
        <div className="w-full">
            <div className="w-full flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onAddClick}
                    className="rounded-lg border border-[#86644c] text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors duration-150 shadow-sm px-6 py-3 font-medium text-[14px]"
                >
                    Add New Address
                </button>
                <button
                    type="button"
                    title="Select Order to send invoice"
                    onClick={onInvoiceReminderClick}
                    className="rounded-lg border border-[#86644c] bg-[#86644c] text-white hover:bg-white hover:text-[#86644c] transition-colors duration-150 shadow-sm px-6 py-3 font-medium cursor-pointer text-[14px]"
                >
                    Invoice Reminder
                </button>
            </div>
            <div className="flex items-center justify-between mb-4 px-4">

                <h4 className="text-lg font-bold text-gray-800">Additional Shipping Addresses</h4>

            </div>
            {addresses && addresses.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-[#f9fafb] border border-[#e2e8f0] rounded-[6px] p-5 w-full sm:w-[300px] flex flex-col justify-between">
                            <div className="text-[12px] text-[#4b5563] leading-[1.6] uppercase mb-4 font-medium flex flex-col">
                                {addr.addressLineOne && <span>{addr.addressLineOne}</span>}
                                {addr.addressLineTwo && <span>{addr.addressLineTwo}</span>}
                                <span>{addr.town && `${addr.town},`} {addr.state} {addr.zipCode}</span>
                                {addr.country && <span>{addr.country}</span>}
                            </div>
                            <button onClick={() => onEditClick(addr)} className="w-max px-4 py-1 bg-white border border-gray-200 text-[12px] font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[13px] text-gray-400 italic">No additional addresses found.</p>
            )}
        </div>
    );
};

export default AdditionalAddressesBlock;