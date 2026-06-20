
export const ShipOrderModal = ({ isOpen, onClose, shipData, setShipData, handleShipOrder }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h3 className="text-[16px] font-bold mb-4">Ship Order Details</h3>
                <label className="block text-[13px] text-gray-700 font-medium mb-1">Shipping Company</label>
                <input type="text" value={shipData.companyName} onChange={(e) => setShipData({ ...shipData, companyName: e.target.value })} placeholder="e.g. UPS" className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] mb-4 focus:outline-none focus:border-blue-500 bg-white text-black" />
                <label className="block text-[13px] text-gray-700 font-medium mb-1">Tracking Number</label>
                <input type="text" value={shipData.trackingNumber} onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })} placeholder="Enter tracking number" className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] mb-6 focus:outline-none focus:border-blue-500 bg-white text-black" />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                    <button onClick={handleShipOrder} className="px-4 py-2 text-[13px] font-medium text-white bg-[#10b981] rounded hover:bg-[#059669]">Confirm Shipment</button>
                </div>
            </div>
        </div>
    );
};