import React from 'react';
import { debounce } from 'lodash';

// --- Local Sub-components ---
export const CustomCheckbox = ({ checked, onChange }) => (
    <div className="relative inline-flex items-center justify-center w-[18px] h-[18px] cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        />
        <span className={`flex items-center justify-center w-full h-full border-[1.5px] rounded-[4px] transition-colors pointer-events-none ${checked ? 'bg-[#1f2937] border-[#1f2937]' : 'bg-white border-gray-300'}`}></span>
        <svg className={`absolute w-3 h-3 pointer-events-none transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L6 10.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

export const InvoiceItemsSection = ({
    selectedCompanyData,
    viewProductsToggle,
    invoiceTypeToggle,
    formData,
    setFormData,
    onGenerate,
    onOpenModal,
    isUpdateMode = false,
    invoiceToAddress = "",
    paymentCards = [],
    isPartnerRoute = false,
}) => {
    let invoiceToName = 'Not selected';
    if (selectedCompanyData) {
        invoiceToName = selectedCompanyData.companyName || selectedCompanyData.customerName || selectedCompanyData.salesRepName || selectedCompanyData.srName || 'Unknown Name';
    }

    // --- Checkbox Handlers ---
    const toggleItemSelection = (index) => {
        const updated = [...formData.items];
        updated[index].selected = updated[index].selected === false ? true : false;
        setFormData(p => ({ ...p, items: updated }));
    };

    const toggleExtraSelection = (index) => {
        const updated = [...formData.extraCharges];
        updated[index].selected = updated[index].selected === false ? true : false;
        setFormData(p => ({ ...p, extraCharges: updated }));
    };

    // --- Select All Logic ---
    const allSelected =
        (formData.items.length > 0 || formData.extraCharges.length > 0) &&
        formData.items.every(i => i.selected !== false) &&
        formData.extraCharges.every(c => c.selected !== false);

    const handleSelectAll = (checked) => {
        setFormData(p => ({
            ...p,
            items: p.items.map(item => ({ ...item, selected: checked })),
            extraCharges: p.extraCharges.map(charge => ({ ...charge, selected: checked }))
        }));
    };

    // --- Data Input Handlers ---
    const handleItemQtyChange = (index, newQty) => {
        const updatedItems = [...formData.items];
        updatedItems[index].qty = Math.max(1, parseInt(newQty) || 1);
        setFormData(p => ({ ...p, items: updatedItems }));
    };

    const addExtraCharge = () => {
        setFormData(p => ({ ...p, extraCharges: [...p.extraCharges, { name: '', qty: 1, price: 0, selected: true }] }));
    };

    const updateExtraCharge = (index, field, value) => {
        const updated = [...formData.extraCharges];
        if (field === 'qty') updated[index][field] = Math.max(1, parseInt(value) || 1);
        else if (field === 'price') updated[index][field] = parseFloat(value) || 0;
        else updated[index][field] = value;
        setFormData(p => ({ ...p, extraCharges: updated }));
    };

    // --- Active Calculations ---
    const activeItems = formData.items.filter(item => item.selected !== false);
    const activeExtras = formData.extraCharges.filter(charge => charge.selected !== false);

    const totalWeight = activeItems.reduce((acc, item) => acc + (parseFloat(item.weight || 0) * item.qty), 0);
    const subTotalItems = activeItems.reduce((acc, item) => acc + (parseFloat(item.price || 0) * item.qty), 0);
    const subTotalExtras = activeExtras.reduce((acc, charge) => acc + (parseFloat(charge.price || 0) * charge.qty), 0);
    const totalUSD = subTotalItems + subTotalExtras + parseFloat(formData.shippingCharges || 0);
    const totalItemCount = activeItems.reduce((acc, item) => acc + item.qty, 0) + activeExtras.reduce((acc, c) => acc + c.qty, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 font-sans">

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Items & Invoice Details</h2>
            </div>
            {!isPartnerRoute && (
                <div className="mb-6">
                    <p className="font-semibold text-gray-700">Invoice To</p>
                    <p className="text-sm text-gray-900">{invoiceToName}</p>
                    {invoiceToAddress && (
                        <p className="text-sm text-gray-500 mt-1">{invoiceToAddress}</p>
                    )}
                </div>
            )}

            {/* Inputs Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-5 gap-5 2xl:gap-10 mb-6">
                <div className="flex flex-col gap-y-2">
                    <label className="text-gray-700 font-medium font-satoshi">Invoice Number</label>
                    <input
                        type="text"
                        placeholder="INV-000"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))}
                        className="bg-white border border-gray-300 text-gray-900 focus:border-black placeholder:text-gray-400 rounded-[4px] outline-none px-2.5 py-3 transition-colors"
                    />
                </div>
                <div className="flex flex-col gap-y-2">
                    <label className="text-gray-700 font-medium font-satoshi">P.O. Number</label>
                    <input
                        type="text"
                        placeholder=""
                        value={formData.poNumberBottom}
                        onChange={(e) => setFormData(p => ({ ...p, poNumberBottom: e.target.value }))}
                        className="bg-white border border-gray-300 text-gray-900 focus:border-black placeholder:text-gray-400 rounded-[4px] outline-none px-2.5 py-3 transition-colors"
                    />
                </div>
                <div className="flex flex-col gap-y-2">
                    <label className="text-gray-700 font-medium font-satoshi">Invoice Date</label>
                    <input
                        type="date"
                        value={formData.invoiceDate}
                        onChange={(e) => setFormData(p => ({ ...p, invoiceDate: e.target.value }))}
                        className="bg-white border border-gray-300 text-gray-900 focus:border-black placeholder:text-gray-400 rounded-[4px] outline-none px-2.5 py-3 transition-colors cursor-text appearance-none"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                    <label className="text-gray-700 font-medium font-satoshi">Terms (days)</label>
                    <select
                        value={formData.termDays}
                        onChange={(e) => setFormData(p => ({ ...p, termDays: e.target.value }))}
                        className="w-full h-full bg-white border border-gray-300 text-gray-900 focus:border-black placeholder:text-gray-400 rounded-[4px] outline-none px-2.5 py-3 transition-colors cursor-pointer appearance-none"
                    >
                        <option value="intermediate">Intermediate (0)</option>
                        <option value="15">15</option>
                        <option value="21">21</option>
                        <option value="30">30</option>
                    </select>
                </div>
                <div className="flex flex-col gap-y-2">
                    <label className="text-gray-700 font-medium font-satoshi">Due Date</label>
                    <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                        className="bg-white border border-gray-300 text-gray-900 focus:border-black placeholder:text-gray-400 rounded-[4px] outline-none px-2.5 py-3 transition-colors cursor-text appearance-none"
                        style={{ colorScheme: 'light' }}
                    />
                </div>
            </div>

            {/* Items Table */}
            <div className="w-full overflow-x-auto mb-6">
                <table className="w-full border border-gray-200 text-sm border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-2 text-center border border-gray-200 w-10">
                                <CustomCheckbox
                                    checked={allSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="py-2 px-2 text-left border border-gray-200 text-gray-900 font-bold w-[150px]">Code</th>
                            <th className="py-2 px-2 text-left border border-gray-200 text-gray-900 font-bold">Name</th>
                            <th className="py-2 px-2 text-center border border-gray-200 text-gray-900 font-bold w-[100px]">Qty.</th>
                            <th className="py-2 px-2 text-right border border-gray-200 text-gray-900 font-bold w-[120px]">Unit $</th>
                            <th className="py-2 px-2 text-right border border-gray-200 text-gray-900 font-bold w-[120px]">Total $</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Standard Items */}
                        {formData.items.map((item, idx) => {
                            const isChecked = item.selected !== false;
                            return (
                                <tr key={`item-${idx}`} className={`transition-colors ${isChecked ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                                    <td className="py-2 px-2 text-center border border-gray-200">
                                        <CustomCheckbox
                                            checked={isChecked}
                                            onChange={() => toggleItemSelection(idx)}
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-left border border-gray-200 text-gray-800 font-medium">
                                        {item.productCode || item.sku || '-'}
                                    </td>
                                    <td className="py-2 px-2 text-left border border-gray-200 font-medium text-gray-900">
                                        {item.name || item.productName || item.product}
                                    </td>
                                    <td className="py-2 px-2 text-center border border-gray-200">
                                        <input
                                            type="number"
                                            min="1"
                                            disabled={!isChecked}
                                            value={item.qty}
                                            onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-center outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-right border border-gray-200 font-medium text-gray-900">
                                        ${parseFloat(item.price).toFixed(2)}
                                    </td>
                                    <td className="py-2 px-2 text-right border border-gray-200 font-bold text-gray-900">
                                        ${(parseFloat(item.price) * item.qty).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Extra Charges */}
                        {formData.extraCharges.map((charge, idx) => {
                            const isChecked = charge.selected !== false;
                            return (
                                <tr key={`extra-${idx}`} className={`transition-colors ${isChecked ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                                    <td className="py-2 px-2 text-center border border-gray-200">
                                        <CustomCheckbox
                                            checked={isChecked}
                                            onChange={() => toggleExtraSelection(idx)}
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-left border border-gray-200">
                                        <input
                                            type="text"
                                            value="CODE"
                                            disabled
                                            className="w-full bg-gray-100 text-gray-500 border border-gray-300 rounded px-2 py-1 text-xs font-medium text-center cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-left border border-gray-200">
                                        <input
                                            type="text"
                                            disabled={!isChecked}
                                            placeholder="Charge Name"
                                            value={charge.name || charge.productName}
                                            onChange={(e) => updateExtraCharge(idx, 'name', e.target.value)}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-center border border-gray-200">
                                        <input
                                            type="number"
                                            min="1"
                                            disabled={!isChecked}
                                            value={charge.qty}
                                            onChange={(e) => updateExtraCharge(idx, 'qty', e.target.value)}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-center outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-right border border-gray-200">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            disabled={!isChecked}
                                            placeholder="0.00"
                                            value={charge.price}
                                            onChange={(e) => updateExtraCharge(idx, 'price', e.target.value)}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-right outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-right border border-gray-200 font-bold text-gray-900">
                                        ${(parseFloat(charge.price || 0) * charge.qty).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Add Buttons */}
                        <tr>
                            <td colSpan="6" className="py-2 px-2 border border-gray-200 bg-white">
                                <div className="flex items-center gap-2">
                                    <button onClick={onOpenModal} className="border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-gray-900 font-medium">Add Item</button>
                                    <button onClick={addExtraCharge} className="border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-gray-900 font-medium">Add Extra Charges</button>
                                </div>
                            </td>
                        </tr>

                        {/* Calculations */}
                        <tr className="bg-white">
                            <td colSpan="4" className="border border-gray-200"></td>
                            <td className="py-2 px-2 text-right font-bold border border-gray-200 text-gray-900">Total weight (lbs)</td>
                            <td className="py-2 px-2 text-right font-bold border border-gray-200 text-gray-900">{totalWeight.toFixed(2)}</td>
                        </tr>

                        <tr className="bg-white">
                            <td colSpan="4" className="border border-gray-200 w-max py-2 px-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, calcMode: 'auto' }))}
                                        className={`border px-3 py-1.5 rounded transition-colors font-medium ${formData.calcMode === 'auto' ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        Auto Calculate
                                    </button>
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, calcMode: 'manual' }))}
                                        className={`border px-3 py-1.5 rounded transition-colors font-medium ${formData.calcMode === 'manual' ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        Manual Calculate
                                    </button>
                                </div>
                            </td>
                            <td className="py-2 px-2 text-right font-bold border border-gray-200 text-gray-900">Shipping Charges</td>
                            <td className="py-2 px-2 text-right font-bold border border-gray-200">
                                <input
                                    type="number"
                                    value={formData.shippingCharges}
                                    onChange={(e) => setFormData(p => ({ ...p, shippingCharges: e.target.value }))}
                                    disabled={formData.calcMode === 'auto'}
                                    className="w-24 bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-right outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-bold"
                                />
                            </td>
                        </tr>

                        <tr className="bg-gray-50">
                            <td colSpan="4" className="border border-gray-200"></td>
                            <td className="py-3 px-2 text-right font-bold border border-gray-200 text-gray-900">Total USD ({totalItemCount} items)</td>
                            <td className="py-3 px-2 text-right font-bold border border-gray-200 text-[#86644c] text-base">${totalUSD.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Bottom Actions Area */}
            <div className="w-full space-y-5">

                {/* Comments */}
                <div className="space-y-2">
                    <p className="font-medium text-gray-700">Comments</p>
                    <textarea
                        value={formData.comments}
                        onChange={(e) => setFormData(p => ({ ...p, comments: e.target.value }))}
                        className="w-full h-32 bg-white text-gray-900 border resize-none border-gray-300 focus:border-black placeholder:text-gray-400 rounded-[4px] outline-none px-3 py-3 transition-colors"
                    ></textarea>
                </div>

                {/* --- PAYMENT OPTIONS SECTION --- */}
                
                   {/* --- PAYMENT OPTIONS SECTION (Always Visible for both routes) --- */}
<div className="space-y-2 mt-6 border-t pt-6 text-black font-sans"> 
    <p className="text-[16px]">Payment Options</p> 
    
    <div className="flex items-center gap-2"> 
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="25" width="25" xmlns="http://www.w3.org/2000/svg"> 
            <path d="M32 416a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V222H32zm66-138a8 8 0 0 1 8-8h92a8 8 0 0 1 8 8v64a8 8 0 0 1-8 8h-92a8 8 0 0 1-8-8zM464 80H48a16 16 0 0 0-16 16v66h448V96a16 16 0 0 0-16-16z"></path> 
        </svg> 
        <p className="text-[16px]">Credit/Debit Card with Stripe</p> 
    </div> 

    {/* --- SAVED CARDS LIST (Logic adjusts based on route/availability) --- */}
    <div className="ml-5 mt-2 space-y-2"> 
        {!isPartnerRoute && paymentCards && paymentCards.length > 0 && ( 
            <> 
                {paymentCards.map((card, index) => { 
                    if (!formData.selectedCardId && index === 0) { 
                        setTimeout(() => setFormData({ ...formData, selectedCardId: card.id }), 0); 
                    } 
                    return ( 
                        <label key={card.id} className="flex items-center gap-2 cursor-pointer"> 
                            <input 
                                className="size-4 cursor-pointer" 
                                type="radio" 
                                name="saved-card" 
                                value={card.id} 
                                checked={formData.selectedCardId === card.id} 
                                onChange={(e) => setFormData({ ...formData, selectedCardId: e.target.value })} 
                            /> 
                            <span className="text-sm uppercase"> 
                                {card.brand} •••• {card.last4} (exp {card.expMonth}/{card.expYear.toString().slice(-2)}) 
                                {card.name ? ` — ${card.name}` : ''} 
                            </span> 
                        </label> 
                    ); 
                })} 
            </> 
        )} 
    </div> 
    <div className="flex items-center gap-2 ml-5 mt-2"> 
        <input 
            className="size-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
            type="checkbox" 
            checked={formData.attemptImmediatePayment} 
            onChange={(e) => setFormData({ ...formData, attemptImmediatePayment: e.target.checked })} 
            disabled={isPartnerRoute || !paymentCards || paymentCards.length === 0} 
        /> 
        <p className={`text-sm ${isPartnerRoute || !paymentCards || paymentCards.length === 0 ? 'text-gray-400' : 'text-black'}`}> 
            Attempt immediate payment 
            {!isPartnerRoute && formData.selectedCardId && paymentCards && paymentCards.length > 0 && ( 
                <> 
                    {' '}with <strong className="uppercase"> 
                        {paymentCards.find(c => c.id === formData.selectedCardId)?.brand || ''} •••• {paymentCards.find(c => c.id === formData.selectedCardId)?.last4 || ''} 
                    </strong> 
                </> 
            )} 
        </p> 
    </div> 

    {/* --- OTHER PAYMENT OPTIONS TEXTAREA (Always Visible) --- */}
    <div className="mt-6 pt-4">
        <p className="text-[16px] mb-2">Other Payment Options</p>
        <textarea 
            value={formData.otherPaymentOptions || ''} 
            onChange={(e) => setFormData(p => ({ ...p, otherPaymentOptions: e.target.value }))} 
            className="w-full h-32 bg-white text-gray-900 border resize-none border-gray-300 focus:border-black rounded-[4px] outline-none px-3 py-3 transition-colors" 
        ></textarea>
    </div>
</div>
            

                {/* Email Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                    <CustomCheckbox
                        checked={formData.emailCustomer}
                        onChange={(e) => setFormData(p => ({ ...p, emailCustomer: e.target.checked }))}
                    />
                    <p className="font-medium text-gray-800">Email the invoice to the customer?</p>
                </div>

                {/* Submit Button */}
                <div className="pt-8 border-t border-gray-200 mt-6">
                    <button
                        // onClick={onGenerate}
                        onClick={debounce(onGenerate, 2000, { leading: true, trailing: false })}
                        className="rounded-lg font-sans font-medium text-white px-6 py-3 bg-[#86644c] hover:bg-[#735541] transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                    >
                        {isUpdateMode ? (formData.invoiceDate ? 'Update Invoice' : 'Create Invoice') : 'Generate Invoice'}
                    </button>
                </div>

            </div>
        </div>
    );
};