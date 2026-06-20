export const OrderHeaderActions = ({ 
    orderData, 
    isCancelled, 
    isShippedOrBeyond, 
    handleAssignSupplier, 
    handleAcknowledgeSupplier, 
    setIsShipModalOpen, 
    handleInvoiceNavigation, 
    setIsCancelModalOpen, 
    setIsDeleteModalOpen 
}) => { 
    let primaryWorkflowButton = null; 
    
    if (!isCancelled) { 
        if (!orderData.supplier || orderData.statusId < 2) { 
            primaryWorkflowButton = <button onClick={handleAssignSupplier} className="px-5 py-2 bg-black text-white text-[13px] font-medium rounded-md shadow-sm transition-colors hover:bg-gray-800">Dispatch to Supplier</button>; 
        } else if (orderData.statusId === 2) { 
            primaryWorkflowButton = <button onClick={handleAcknowledgeSupplier} className="px-5 py-2 bg-black text-white text-[13px] font-medium rounded-md shadow-sm transition-colors hover:bg-gray-800">Acknowledge Supplier</button>; 
        } else if (orderData.statusId === 3) { 
            primaryWorkflowButton = <button onClick={() => setIsShipModalOpen(true)} className="px-5 py-2 bg-black text-white text-[13px] font-medium rounded-md shadow-sm transition-colors hover:bg-gray-800">Ship Order</button>; 
        } 
    } 
    
    return ( 
        <div className="flex justify-end gap-3 mb-6"> 
            {primaryWorkflowButton} 
            
            <button onClick={handleInvoiceNavigation} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-[13px] font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"> 
                {orderData.invoiceDate ? "Update Invoice" : "Add Invoice"} 
            </button> 
            
            <button 
                disabled={isShippedOrBeyond || isCancelled} 
                onClick={() => setIsCancelModalOpen(true)} 
                className={`px-5 py-2 bg-[#86644C] text-white text-[13px] font-medium rounded-md shadow-sm transition-colors ${isShippedOrBeyond || isCancelled ? 'cursor-not-allowed' : 'hover:bg-[#6c4f3b]'}`} 
            > 
                Cancel Order 
            </button> 
            
            <button disabled={isShippedOrBeyond} onClick={() => setIsDeleteModalOpen(true)} className={`px-5 py-2 bg-red-600 text-white text-[13px] font-medium rounded-md shadow-sm transition-colors ${isShippedOrBeyond ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}>
                Delete Order
            </button>
        </div> 
    ); 
};