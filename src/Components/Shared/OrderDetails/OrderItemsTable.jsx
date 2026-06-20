import { formatMoney } from '../../../utils/orderUtils';

export const OrderItemsTable = ({ orderData, productsList, chargesList, isPartnerRoute }) => {
    // Check for notes in common API field names
    const orderNotes = orderData.note

    return (
        <div className="flex flex-col gap-6">
           
            {/* --- Table Section --- */}
            <div className="space-y-10 py-6 px-4 2xl:px-6 border border-gray-200 shadow-sm bg-white rounded-md ">




 {/* --- Notes Section (Only for Partner Orders) --- */}
            {isPartnerRoute && orderNotes && (
                <div className="bg-yellownotes text-black font-medium py-2 px-4 rounded-md flex gap-x-4">
                    <p>{orderNotes}</p>
                </div>
            )}




                <div className="w-full overflow-auto">
                    <table className="w-full border border-gray-200 text-[13px] border-collapse min-w-[750px]">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-2 text-left border border-gray-200 font-bold text-gray-900">Code</th>
                                <th className="py-2 px-2 text-left border border-gray-200 font-bold text-gray-900">SKU</th>
                                <th className="py-2 px-2 text-left border border-gray-200 font-bold text-gray-900">Name</th>
                                <th className="py-2 px-2 text-left border border-gray-200 font-bold text-gray-900">Grind</th>
                                <th className="py-2 px-2 text-center border border-gray-200 font-bold text-gray-900">Qty.</th>
                                <th className="py-2 px-2 text-center border border-gray-200 font-bold text-gray-900">Discount</th>
                                <th className="py-2 px-2 text-center border border-gray-200 font-bold text-gray-900">Invoiced</th>
                                <th className="py-2 px-2 text-center border border-gray-200 font-bold text-gray-900">Paid</th>
                                <th className="py-2 px-2 text-center border border-gray-200 font-bold text-gray-900">Dispatched</th>
                                <th className="py-2 px-2 text-right border border-gray-200 font-bold text-gray-900">Unit $</th>
                                <th className="py-2 px-2 text-right border border-gray-200 font-bold text-gray-900">Total $</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* --- Product Rows --- */}
                            {productsList.map(item => (
                                <tr key={item.id} className="text-gray-800">
                                    <td className="py-2 px-2 border border-gray-200">{item.productCode || ''}</td>
                                    <td className="py-2 px-2 border border-gray-200">{item.supplierSku || item.sku || ''}</td>
                                    <td className="py-2 px-2 font-semibold border border-gray-200 text-black">{item.product || item.productName || ''}</td>
                                    <td className="py-2 px-2 border border-gray-200">{item.grind || ''}</td>
                                    <td className="py-2 px-2 text-center border border-gray-200">{item.qty || '1'}</td>
                                    <td className="py-2 px-2 text-center border border-gray-200">{item.discount || '0.00'}</td>
                                    <td className="py-2 px-2 text-center border border-gray-200">{orderData.invoicePdf ? 'Yes' : 'Not Yet'}</td>
                                    <td className="py-2 px-2 text-center border border-gray-200 capitalize">{orderData.paymentStatus === 'done' ? 'Paid' : 'Unpaid'}</td>
                                    <td className="py-2 px-2 text-center border border-gray-200">{['Dispatched', 'Shipped'].includes(orderData.orderCurrentStatus) ? 'Yes' : 'Not Yet'}</td>
                                    <td className="py-2 px-2 text-right border border-gray-200">{formatMoney(item.price)}</td>
                                    <td className="py-2 px-2 text-right border border-gray-200">{formatMoney(parseFloat(item.price || 0) * parseInt(item.qty || 1))}</td>
                                </tr>
                            ))}

                            {/* --- Charges Rows --- */}
                            {chargesList.map(charge => (
                                <tr key={`charge-${charge.id}`} className="text-gray-800">
                                    <td className="py-2 px-2 border border-gray-200" colSpan="2"></td>
                                    <td className="py-2 px-2 font-semibold border border-gray-200 text-black">{charge.productName || charge.product || ''}</td>
                                    <td className="py-2 px-2 text-center border border-gray-200">-</td>
                                    <td className="py-2 px-2 text-center border border-gray-200">{charge.qty || '1'}</td>
                                    <td className="py-2 px-2 border border-gray-200" colSpan="4"></td>
                                    <td className="py-2 px-2 text-right border border-gray-200">{formatMoney(charge.price)}</td>
                                    <td className="py-2 px-2 text-right border border-gray-200">{formatMoney(parseFloat(charge.price || 0) * parseInt(charge.qty || 1))}</td>
                                </tr>
                            ))}

                            {/* --- Sub-Total --- */}
                            <tr className="text-gray-900">
                                <td colSpan="9" className="border border-gray-200"></td>
                                <td className="py-2 px-2 text-right font-semibold border border-gray-200">Sub-Total</td>
                                <td className="py-2 px-2 text-right font-semibold border border-gray-200">{formatMoney(orderData.subTotal)}</td>
                            </tr>

                            {/* --- Shipping Charges --- */}
                            <tr className="text-gray-900">
                                <td colSpan="9" className="border border-gray-200"></td>
                                <td className="py-2 px-2 text-right border border-gray-200">Shipping Charges</td>
                                <td className="py-2 px-2 text-right border border-gray-200">{formatMoney(orderData.shippingCharges)}</td>
                            </tr>

                            {/* --- Total USD --- */}
                            <tr className="text-black">
                                <td colSpan="9" className="border border-gray-200"></td>
                                <td className="py-2 px-2 text-right font-bold border border-gray-200">Total USD ({orderData.items?.length || 0} items)</td>
                                <td className="py-2 px-2 text-right font-bold border border-gray-200">{formatMoney(orderData.totalBill)}</td>
                            </tr>

                            {/* --- Total Weight --- */}
                            <tr className="text-gray-900">
                                <td colSpan="8" className="py-2 px-2 text-left font-medium border border-gray-200">
                                    Total weight: {orderData.totalWeight || '0.00'} lbs
                                </td>
                                <td colSpan="3" rowSpan="2" className="border border-gray-200 bg-white"></td>
                            </tr>

                            {/* --- Payment Method --- */}
                            <tr className="text-gray-900">
                                <td colSpan="8" className="py-2 px-2 text-left font-medium border border-gray-200">
                                    Payment Method: <span className="uppercase">{orderData.paymentMethod || '—'}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};