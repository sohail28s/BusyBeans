import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProductModal = ({ isOpen, onClose, partner, onSuccess }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [editedPrices, setEditedPrices] = useState({});
    useEffect(() => {
        if (isOpen && partner?.id) {
            const fetchMissingProducts = async () => {
                setIsLoading(true);
                try {
                    const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/products/sales-rep/import/${partner.id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                    });
                    
                    if (res.data.status === 'success') {
                        const fetchedProducts = res.data.data.data || [];
                        setProducts(fetchedProducts);
                        
                        // Initialize local price state so inputs have a starting value
                        const initialPrices = {};
                        fetchedProducts.forEach(p => {
                            initialPrices[p.id] = {
                                price: p.price || 0,
                                wholesalePrice: p.wholesalePrice || 0
                            };
                        });
                        setEditedPrices(initialPrices);
                    }
                } catch (error) {
                    console.error("Error fetching missing products:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            
            fetchMissingProducts();
            setSelectedItems(new Set());
            setSearchTerm('');
        }
    }, [isOpen, partner]);

    if (!isOpen || !partner) return null;

    // Filter Logic
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Selection Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const newSelection = new Set(selectedItems);
            filteredProducts.forEach(p => newSelection.add(p.id));
            setSelectedItems(newSelection);
        } else {
            const newSelection = new Set(selectedItems);
            filteredProducts.forEach(p => newSelection.delete(p.id));
            setSelectedItems(newSelection);
        }
    };

    const handleSelectOne = (id) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedItems(newSelection);
    };

    const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedItems.has(p.id));

    // Price Change Logic
    const handlePriceChange = (id, field, value) => {
        setEditedPrices(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    // Submission Logic
    const handleSubmit = async () => {
        if (selectedItems.size === 0) return;
        setIsSubmitting(true);

        try {
            const payloadArray = Array.from(selectedItems).map(productId => {
                const prices = editedPrices[productId];
                return {
                    productId: productId,
                    salesRepId: partner.id,
                    price: parseFloat(prices.price),
                    wholesalePrice: parseFloat(prices.wholesalePrice),
                    status: true
                };
            });

            await axios.post(
                'https://testingbb.trimworldwide.com/api/v1/admin/sales-rep-product-price', 
                payloadArray, 
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                }
            );
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding products to partner:", error);
            alert("There was an error adding the products. Please try again.");
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
                        Add Products to Partner Inventory - {partner.srName}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none rounded-full hover:bg-gray-100 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body Container */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden bg-white">
                    
                    {/* Search Bar */}
                    <div className="relative mb-4 shrink-0">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="search"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-[48px] pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-shadow"
                        />
                    </div>

                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-2 mb-2 px-1 shrink-0">
                        <input 
                            type="checkbox" 
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="w-4 h-4 cursor-pointer accent-black bg-white border border-gray-300 rounded"
                        />
                        <span className="text-[14px] font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSelectAll({ target: { checked: !isAllSelected } })}>
                            Select All ({filteredProducts.length})
                        </span>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 -mx-2">
                        {isLoading ? (
                            <div className="py-10 text-center text-gray-500">Loading missing products...</div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedItems.has(product.id);
                                    const prices = editedPrices[product.id] || { price: 0, wholesalePrice: 0 };

                                    return (
                                        // Entire row is clickable. Uses flex-col for mobile, flex-row for desktop.
                                        <div 
                                            key={product.id} 
                                            onClick={() => handleSelectOne(product.id)}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                                                isSelected 
                                                ? 'bg-[#eaf2fd] shadow-sm' 
                                                : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            {/* Left Side: Image + Text (Checkbox Removed!) */}
                                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                <img 
                                                    src={getImageUrl(product.image)} 
                                                    alt={product.name} 
                                                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-200 bg-white shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate text-[14px] sm:text-[15px]">{product.name}</p>
                                                    <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
                                                        <span className="font-medium">SKU:</span> {product.sku || 'N/A'} · <span className="font-medium">Code:</span> {product.productCode || 'N/A'} · <span className="font-medium">Weight:</span> {product.weight || '0.00'} {product.unit} {product.grind ? `· Grind: ${product.grind}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Side: Price Inputs (Stack underneath on mobile) */}
                                            <div 
                                                className="flex gap-3 shrink-0 sm:ml-4 mt-3 sm:mt-0 w-full sm:w-auto"
                                                onClick={(e) => e.stopPropagation()} // Prevents row selection when clicking inputs
                                            >
                                                <div className="flex flex-col flex-1 sm:flex-none">
                                                    <label className="text-[12px] font-semibold text-gray-600 mb-1">Selling Price ($)</label>
                                                    <input 
                                                        type="number"
                                                        disabled={!isSelected}
                                                        value={prices.price}
                                                        onChange={(e) => handlePriceChange(product.id, 'price', e.target.value)}
                                                        // ADDED text-black and hidden number arrows!
                                                        className="w-full sm:w-[100px] h-[36px] px-3 border border-gray-200 rounded text-[14px] text-black bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-black transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col flex-1 sm:flex-none">
                                                    <label className="text-[12px] font-semibold text-gray-600 mb-1">Wholesale ($)</label>
                                                    <input 
                                                        type="number"
                                                        disabled={!isSelected}
                                                        value={prices.wholesalePrice}
                                                        onChange={(e) => handlePriceChange(product.id, 'wholesalePrice', e.target.value)}
                                                        // ADDED text-black and hidden number arrows!
                                                        className="w-full sm:w-[100px] h-[36px] px-3 border border-gray-200 rounded text-[14px] text-black bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-black transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">No missing products found.</div>
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
                    <button 
                        onClick={handleSubmit}
                        disabled={selectedItems.size === 0 || isSubmitting}
                        className="h-[42px] px-4 sm:px-5 text-[14px] sm:text-[15px] font-semibold text-white bg-[#86644C] rounded-md hover:bg-[#6c4f3b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? 'Adding...' : `Add Products (${selectedItems.size})`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddProductModal;