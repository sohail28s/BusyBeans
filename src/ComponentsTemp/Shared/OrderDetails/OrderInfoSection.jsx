import { InfoRow } from "./InfoRow";
import { formatDate } from '../../../utils/orderUtils';
import { toast } from 'react-toastify';
import { useState } from 'react';
// import { EditAddressModal } from 'YOUR_PATH_HERE';
import { useNavigate } from "react-router-dom";
export const OrderInfoSection = ({ orderData, supplierName, localPartnerName, companyName, isPartnerRoute }) => {
  const navigate = useNavigate();
    const addr = orderData.address || {};
    const invoiceSent = !!orderData.invoiceDate;
    const isPaid = orderData.paymentStatus === 'done' || orderData.paymentStatus === 'paid';
    const isDispatched = orderData.orderCurrentStatus === 'Dispatched' || orderData.orderCurrentStatus === 'Shipped';

    // Fallbacks for common date and session field names
    const paidDate = orderData.invoicePaidDate;

    // IDs
    const sessionId = orderData.invoiceId || orderData.checkoutSessionId;
    const pullouttransferId = orderData.pulloutIntentId;
    const paymentIntentId = orderData.paymentIntentId;

    // Helper function to truncate IDs nicely
    const truncateId = (id) => {
        if (!id) return '';
        if (id.length > 20) {
            return `${id.substring(0, 10)}...${id.slice(-4)}`;
        }
        return id;
    };

    // Reusable Copy Icon perfectly matched to your reference
    const CopyIcon = () => (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer text-gray-500 hover:text-black transition-colors" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    );

    return (
        <div className="w-full flex flex-col lg:flex-row gap-10 xl:gap-20 mb-8 py-4 px-4 2xl:px-8 font-sans border border-borderColor bg-white shadow-[0px_8px_13px_-3px_#00000012] rounded-sm">

            {/* --- Left Side: Order Info (No custom CSS wrapper hacks, relies purely on InfoRow styling) --- */}
            <div className="flex-1 max-w-[50%] w-full">

                {/* 1. Ordered On */}
                {(orderData.on || orderData.createdAt) && (
                    <InfoRow label="Ordered On" value={formatDate(orderData.on || orderData.createdAt)} />
                )}

                {/* 2. Company Name (CUSTOMER ONLY) */}
                {!isPartnerRoute && companyName && (
                    <InfoRow label="Company Name" value={companyName} isLink={true} linkValue={`/customers/${orderData.user?.id}`} />
                )}

                {/* 3. Created By */}
                {orderData.createdBy && (
                    <InfoRow label="Created By" value={orderData.createdBy} />
                )}

                {/* 4. Supplier */}
                {supplierName && (
                    <InfoRow label="Supplier" value={supplierName} isLink={true} linkValue={`/suppliers/detail/${orderData.supplier?.id}`} />
                )}

                {/* 5. Local Partner (PARTNER ONLY) */}
                { localPartnerName && (
                    <InfoRow label="Local Partner" value={localPartnerName} isLink={true} linkValue={`/sale-representative/details/${orderData.salesRep?.id}`} />
                )}

                {/* 6. PO Number (Safely Lowercased) */}
                {orderData.poNumber && (
                    <InfoRow label="P.O. #" value={<span className="lowercase">{String(orderData.poNumber).toLowerCase()}</span>} />
                )}

                {/* 7. Invoice No */}
                {orderData.invoiceNumber && (
                    <InfoRow label="Invoice No" value={orderData.invoiceNumber} />
                )}

                {/* 8. Checkout Session ID (CUSTOMER ONLY) */}
                {!isPartnerRoute && sessionId && (
                    <div className="flex py-3 border-b border-gray-200 text-[13px]">
                        <span className="w-1/3 text-black">Checkout Session ID</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <a
                                href={`https://dashboard.stripe.com/login?redirect=%2Fpayments%2F${sessionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#3b82f6] hover:underline normal-case truncate transition"
                                title={sessionId}
                            >
                                {truncateId(sessionId)}
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(sessionId); toast.success("Copied!"); }} title="Copy">
                                <CopyIcon />
                            </button>
                        </div>
                    </div>
                )}

                {/* 9. Payment Intent ID (CUSTOMER ONLY) */}
                {!isPartnerRoute && paymentIntentId && (
                    <div className="flex py-3 border-b border-gray-200 text-[13px]">
                        <span className="w-1/3 text-black">Payment Intent ID</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <a
                                href={`https://dashboard.stripe.com/login?redirect=%2Fpayments%2F${paymentIntentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#3b82f6] hover:underline normal-case truncate transition"
                                title={paymentIntentId}
                            >
                                {truncateId(paymentIntentId)}
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(paymentIntentId); toast.success("Copied!"); }} title="Copy">
                                <CopyIcon />
                            </button>
                        </div>
                    </div>
                )}

                {isPartnerRoute && pullouttransferId && (
                    <InfoRow label="Pullout Transfer ID" value={pullouttransferId} />
                )}
                {isPartnerRoute && pullouttransferId && (
                    <div className="flex py-3 border-b border-gray-200 text-[13px]">
                        <span className="w-1/3 text-black">Payment Intent ID</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[#2563eb] underline normal-case truncate" title={pullouttransferId}>
                                {truncateId(pullouttransferId)}
                            </span>
                            <button onClick={() => { navigator.clipboard.writeText(pullouttransferId); toast.success("Copied!"); }} title="Copy">
                                <CopyIcon />
                            </button>
                        </div>
                    </div>
                )}

                {/* 11. Shipping Company */}
                {orderData.shippingCompany && (
                    <InfoRow label="Shipping Company" value={orderData.shippingCompany} />
                )}

                {/* 12. Tracking No */}
                {orderData.trackingNumber && (
                    <InfoRow label="Tracking No:" value={orderData.trackingNumber} />
                )}

                {/* 13. Frequency */}
                {orderData.frequency && (
                    <InfoRow label="Frequency:" value={orderData.frequency.replace('-', ' ')} />
                )}

                {/* 14. Pullout Date (PARTNER ONLY) */}
                {isPartnerRoute && orderData.pulloutDate && (
                    <InfoRow label="Pullout Date:" value={formatDate(orderData.pulloutDate)} />
                )}

                {/* 15. Invoice Date */}
                {orderData.invoiceDate && (
                    <InfoRow label="Invoice Date:" value={formatDate(orderData.invoiceDate)} />
                )}

                {/* 16. Invoice Paid Date */}
                {paidDate && (
                    <InfoRow label="Invoice Paid Date:" value={formatDate(paidDate)} />
                )}
            </div>

            {/* --- Right Side: Addresses --- */}
         
            <div className="flex-1 w-full grid grid-cols-2 gap-x-10 gap-y-6 text-[13px] text-gray-900 pt-4">

                {/* Deliver To */}
                <div data-testid="deliver-to" className="flex flex-col">
                    <h6 className="font-semibold mb-1 capitalize text-[14px] text-black">Deliver To</h6>
                    <div className="uppercase space-y-0.5">
                        {!isPartnerRoute ? (
                            /* --- CUSTOMER Deliver To --- */
                            <>
                                {addr.addressLineOne && <p>{addr.addressLineOne}</p>}
                                {addr.addressLineTwo && <p>{addr.addressLineTwo}</p>}
                                {(addr.town || addr.state) && <p>{[addr.town, addr.state].filter(Boolean).join(', ')}</p>}
                                {addr.zipCode && <p>{addr.zipCode}</p>}
                                <p>{addr.country || 'United States'}</p>

                                {(orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber) && (
                                    <p>PHONE: {orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber}</p>
                                )}
                                {(orderData.user?.emailToSendInvoices || orderData.user?.email) && (
                                    <p className="lowercase mt-0.5">{orderData.user?.emailToSendInvoices || orderData.user?.email}</p>
                                )}
                            </>
                        ) : (
                            /* --- PARTNER Deliver To (Stacked mapped from API) --- */
                            <>
                                {addr.addressLineOne && <p>{addr.addressLineOne}</p>}
                                {addr.addressLineTwo && <p>{addr.addressLineTwo}</p>}
                                {addr.town && <p>{addr.town}</p>}
                                {addr.state && <p>{addr.state}</p>}
                                {addr.zipCode && <p>{addr.zipCode}</p>}
                                <p>{addr.country || 'United States'}</p>
                            </>
                        )}
                    </div>
                    {/* Edit Button (Customer Only) */}
                    {!isPartnerRoute && (
                        <button onClick={() => navigate(`/orders/details/${orderData.id}/edit`)} className="text-blue-500 hover:underline text-left mt-1 w-max">Edit</button>
                    )}
                </div>

                {/* Invoice To */}
                <div data-testid="invoice-to" className="flex flex-col">
                    <h6 className="font-bold mb-1 capitalize text-[14px] text-black">Invoice To</h6>
                    <div className="uppercase space-y-0.5">
                        {!isPartnerRoute ? (
                            /* --- CUSTOMER Invoice To --- */
                            <>
                                {companyName && <p>{companyName}</p>}
                                {(() => {
                                    const bAddr = orderData.user?.billingAddresses?.[0] || {};
                                    return (
                                        <>
                                            {(bAddr.addressLineOne || bAddr.addressLineTwo) && (
                                                <p>{[bAddr.addressLineOne, bAddr.addressLineTwo].filter(Boolean).join(', ')}</p>
                                            )}
                                            {(bAddr.town || bAddr.state) && (
                                                <p>{[bAddr.town, bAddr.state].filter(Boolean).join(', ')}</p>
                                            )}
                                            {bAddr.zipCode && <p>{bAddr.zipCode}</p>}
                                            <p>{bAddr.country || 'United States'}</p>
                                        </>
                                    );
                                })()}
                                {(orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber) && (
                                    <p>{orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber}</p>
                                )}
                                {(orderData.user?.emailToSendInvoices || orderData.user?.email) && (
                                    <p className="lowercase mt-0.5">{orderData.user?.emailToSendInvoices || orderData.user?.email}</p>
                                )}
                            </>
                        ) : (
                            /* --- PARTNER Invoice To (Mapped from orderData.salesRep) --- */
                            <>
                                {orderData.salesRep?.address && <p>{orderData.salesRep.address}</p>}
                                {orderData.salesRep?.city && <p>{orderData.salesRep.city}</p>}
                                {orderData.salesRep?.state && <p>{orderData.salesRep.state}</p>}
                                {orderData.salesRep?.country && <p>{orderData.salesRep.country}</p>}
                                {orderData.salesRep?.phoneNumber && (
                                    <p>
                                        {orderData.salesRep.countryCode ? `${orderData.salesRep.countryCode} ` : ''}
                                        {orderData.salesRep.phoneNumber}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    {/* Edit Button (Customer Only) */}
                    {!isPartnerRoute && (
                        <button onClick={() => navigate(`/orders/details/${orderData.id}/edit`)} className="text-blue-500 hover:underline text-left mt-1 w-max">Edit</button>
                    )}
                </div>

                {/* Invoice Image Status */}
                {invoiceSent && (
                    <div className="max-w-32 flex flex-col items-center text-xs text-gray-500 mt-2">
                        <img
                            src={isPaid ? '/Images/invoicePaid.png' : '/Images/invoiceUnpaid.png'}
                            alt={isPaid ? "Paid" : "Unpaid"}
                            className="w-full object-contain mb-1"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <p className="text-[#6b7280]">{orderData.invoiceNumber || '-'}</p>
                        <p>{formatDate(orderData.invoiceDate)}</p>
                    </div>
                )}

                {/* Dispatch Image Status */}
                {isDispatched && (
                    <div className="max-w-32 flex flex-col items-center text-xs text-gray-500 mt-2" data-testid="dispatched-card">
                        <img
                            src="/Images/dispatch.png"
                            alt="dispatch image"
                            className="w-full object-contain mb-1"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <p className="text-[#6b7280]">Dispatched</p>
                        <p>{formatDate(orderData.pulloutDate)}</p>
                    </div>
                )}

                {/* --- Place Modal Component Here --- */}
                {/* <EditAddressModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    orderData={orderData}
                /> */}
            </div>
        </div>
    );
};
