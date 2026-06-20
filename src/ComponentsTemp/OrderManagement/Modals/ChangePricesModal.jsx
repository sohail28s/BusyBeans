import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChangePriceModal = ({ isOpen, onClose, partner, onSuccess }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    
    // We track original prices to compare against edited ones
    const [originalPrices, setOriginalPrices] = useState({});
    const [editedPrices, setEditedPrices] = useState({});

    // Fetch existing partner products when modal opens
    useEffect(() => {
        if (isOpen && partner?.id) {
            const fetchPartnerProducts = async () => {
                setIsLoading(true);
                try {
                    // Fetching from the Sales Rep specific product list!
                    const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/products/sales-rep?page=1&limit=1000&salesRepId=${partner.id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                    });
                    
                    if (res.data.status === 'success') {
                        const fetchedProducts = res.data.data.data || [];
                        setProducts(fetchedProducts);
                        
                        // Initialize prices
                        const initialPrices = {};
                        fetchedProducts.forEach(p => {
                            // Some APIs use productId, some use id. We capture whatever represents the product.
                            const pId = p.productId || p.id;
                            initialPrices[pId] = {
                                price: p.price || 0,
                                wholesalePrice: p.wholesalePrice || 0
                            };
                        });
                        setOriginalPrices(initialPrices);
                        setEditedPrices(initialPrices);
                    }
                } catch (error) {
                    console.error("Error fetching partner products:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            
            fetchPartnerProducts();
            setSearchTerm('');
        }
    }, [isOpen, partner]);

    if (!isOpen || !partner) return null;

    // Filter Logic for Search Bar
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Update state when user types a new price
    const handlePriceChange = (id, field, value) => {
        setEditedPrices(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    // Figure out which products actually had their prices changed
    const getChangedPayload = () => {
        const changedItems = [];
        products.forEach(p => {
            const pId = p.productId || p.id;
            const orig = originalPrices[pId];
            const edited = editedPrices[pId];
            
            if (orig && edited) {
                // If either price or wholesalePrice is different from the original, add it to the list
                if (parseFloat(orig.price) !== parseFloat(edited.price) || 
                    parseFloat(orig.wholesalePrice) !== parseFloat(edited.wholesalePrice)) {
                    changedItems.push({
                        productId: pId,
                        salesRepId: partner.id,
                        price: parseFloat(edited.price),
                        wholesalePrice: parseFloat(edited.wholesalePrice),
                        status: true
                    });
                }
            }
        });
        return changedItems;
    };

    const changedPayload = getChangedPayload();
    const hasChanges = changedPayload.length > 0;

    // Submission Logic (PATCH Request)
    const handleSubmit = async () => {
        if (!hasChanges) return;
        setIsSubmitting(true);

        try {
            // Send ONE patch request with the array of changed items
            await axios.patch(
                'https://testingbb.trimworldwide.com/api/v1/admin/sales-rep-product-price', 
                changedPayload, 
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                }
            );
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating prices:", error);
            alert("There was an error updating the prices. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://stageadmin.busybeancoffee.com/images/logocoffee.png";
        if (path.startsWith('http')) return path;
        return `https://testingbb.trimworldwide.com/${path}`;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-nunito">
            {/* Modal Container */}
            <div className="w-full max-w-[800px] h-[90vh] max-h-[945px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="h-[80px] px-6 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
                    <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-700 truncate pr-4">
                        Update Pricing for Partner Inventory - {partner.srName}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none rounded-full hover:bg-gray-100 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body Container */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden bg-white">
                    
                    {/* Search Bar */}
                    <div className="relative mb-2 shrink-0">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="search"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-[48px] pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-shadow"
                        />
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 -mx-2 mt-4">
                        {isLoading ? (
                            <div className="py-10 text-center text-gray-500">Loading partner products...</div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {filteredProducts.map(product => {
                                    const pId = product.productId || product.id;
                                    const prices = editedPrices[pId] || { price: 0, wholesalePrice: 0 };

                                    return (
                                        // Clean white row. No checkboxes, no blue highlight.
                                        <div 
                                            key={pId} 
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow"
                                        >
                                            {/* Left Side: Image + Text */}
                                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                <img 
                                                    src={getImageUrl(product.image)} 
                                                    alt={product.name} 
                                                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-200 bg-white shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate text-[14px] sm:text-[15px]">{product.name}</p>
                                                    <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
                                                        <span className="font-medium">SKU:</span> {product.sku || 'N/A'} · <span className="font-medium">Code:</span> {product.productCode || 'N/A'} · <span className="font-medium">Weight:</span> {product.weight || '0.00'} {product.unit}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Side: Price Inputs */}
                                            <div className="flex gap-3 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
                                                <div className="flex flex-col flex-1 sm:flex-none">
                                                    <label className="text-[12px] font-semibold text-gray-600 mb-1">Selling Price ($)</label>
                                                    <input 
                                                        type="number"
                                                        value={prices.price}
                                                        onChange={(e) => handlePriceChange(pId, 'price', e.target.value)}
                                                        className="w-full sm:w-[100px] h-[36px] px-3 border border-gray-300 rounded text-[14px] text-black bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col flex-1 sm:flex-none">
                                                    <label className="text-[12px] font-semibold text-gray-600 mb-1">Wholesale ($)</label>
                                                    <input 
                                                        type="number"
                                                        value={prices.wholesalePrice}
                                                        onChange={(e) => handlePriceChange(pId, 'wholesalePrice', e.target.value)}
                                                        className="w-full sm:w-[100px] h-[36px] px-3 border border-gray-300 rounded text-[14px] text-black bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">No products found in this partner's inventory.</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="h-[80px] px-4 sm:px-6 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 shrink-0">
                    <button 
                        onClick={onClose}
                        className="h-[42px] px-4 sm:px-5 text-[14px] sm:text-[15px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    {/* Button disables automatically if no prices were changed! */}
                    <button 
                        onClick={handleSubmit}
                        disabled={!hasChanges || isSubmitting}
                        className="h-[42px] px-4 sm:px-5 text-[14px] sm:text-[15px] font-semibold text-white bg-[#86644C] rounded-md hover:bg-[#6c4f3b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? 'Updating...' : `Update Price(s) ${changedPayload.length > 0 ? `(${changedPayload.length})` : ''}`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ChangePriceModal;