import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const InventoryModal = ({ isOpen, onClose, productId, onSuccess }) => {
    const fileInputRef = useRef(null);
    const isEditMode = !!productId;
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        categoryId: '',
        price: '',
        wholesalePrice: '',
        productCode: '',
        sku: '',
        grind: '',
        quantity: '',
        weight: '',
        unit: 'kg', // Default to kg
        imageFile: null,
    });

    // Map of supplierId -> sku string
    const [supplierSkus, setSupplierSkus] = useState({});

    // --- Data Fetching ---
    useEffect(() => {
        if (!isOpen) return;

        // Reset state when modal opens
        setFormData({ name: '', desc: '', categoryId: '', price: '', wholesalePrice: '', productCode: '', sku: '', grind: '', quantity: '', weight: '', unit: 'kg', imageFile: null });
        setSupplierSkus({});
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        const fetchModalData = async () => {
            setIsLoadingData(true);
            try {
                // 1. Fetch Categories & Suppliers concurrently
                const [catsRes, supsRes] = await Promise.all([
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/category?status=1', getAuthConfig()),
                    axios.get('https://testingbb.trimworldwide.com/api/v1/admin/supplier?status=1', getAuthConfig())
                ]);

                if (catsRes.data?.status === 'success') {
                    setCategories(catsRes.data.data.data || []);
                }

                let fetchedSuppliers = [];
                if (supsRes.data?.status === 'success') {
                    fetchedSuppliers = supsRes.data.data.data || [];
                    setSuppliers(fetchedSuppliers);
                    
                    // Initialize supplier SKUs object with empty strings for ALL suppliers
                    const initialSkus = {};
                    fetchedSuppliers.forEach(sup => initialSkus[sup.id] = '');
                    setSupplierSkus(initialSkus);
                }

                // 2. If Edit Mode, fetch product and merge data
                if (isEditMode) {
                    const prodRes = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/product/${productId}`, getAuthConfig());
                    
                    if (prodRes.data?.status === 'success' && prodRes.data.data?.product) {
                        const product = prodRes.data.data.product;
                        
                        setFormData({
                            name: product.name || '',
                            desc: product.desc || '',
                            categoryId: product.categoryId || '',
                            price: product.price || '',
                            wholesalePrice: product.wholesalePrice || '',
                            productCode: product.productCode || '',
                            sku: product.sku || '',
                            grind: product.grind || '',
                            quantity: product.quantity || '',
                            weight: product.weight || '',
                            unit: product.unit || 'kg',
                            imageFile: null,
                        });

                        if (product.image) setImagePreview(`https://testingbb.trimworldwide.com/${product.image}`);

                        // Merge existing SKUs into the state (overwriting empty strings where data exists)
                        if (product.skuSuppliers && product.skuSuppliers.length > 0) {
                            setSupplierSkus(prev => {
                                const merged = { ...prev };
                                product.skuSuppliers.forEach(item => {
                                    if (item.supplierId) {
                                        merged[item.supplierId] = item.supplierSku || '';
                                    }
                                });
                                return merged;
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching modal data:", err);
                toast.error("Failed to load required data.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchModalData();
    }, [isOpen, productId, isEditMode]);

    // --- Event Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierSkuChange = (supplierId, value) => {
        setSupplierSkus(prev => ({ ...prev, [supplierId]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        const loadingToast = toast.loading(isEditMode ? "Updating product..." : "Adding stock...");

        try {
            const formPayload = new FormData();
            
            // Append standard fields
            Object.keys(formData).forEach(key => {
                if (key !== 'imageFile' && formData[key] !== null && formData[key] !== '') {
                    formPayload.append(key, formData[key]);
                }
            });

            // Append Image if new one is selected
            if (formData.imageFile) {
                formPayload.append('image', formData.imageFile);
            }

            // Format Supplier SKUs Payload (Only send those that are filled)
            const skuSupplierPayloadArray = Object.entries(supplierSkus)
                .filter(([_, sku]) => sku.trim() !== '')
                .map(([id, sku]) => ({ supplierId: parseInt(id), supplierSku: sku.trim() }));
            
            formPayload.append('supplierAndSkus', JSON.stringify(skuSupplierPayloadArray));

            // Determine URL and Method
            const url = isEditMode 
                ? `https://testingbb.trimworldwide.com/api/v1/admin/product/${productId}` 
                : 'https://testingbb.trimworldwide.com/api/v1/admin/product';
            
            const method = isEditMode ? 'PATCH' : 'POST';

            // Use fetch for FormData to let browser set boundary automatically
            const response = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                body: formPayload,
            });

            const data = await response.json();

            if (data.status === 'success' || response.ok) {
                toast.update(loadingToast, { render: `Product ${isEditMode ? 'updated' : 'added'} successfully!`, type: "success", isLoading: false, autoClose: 2000 });
                if (onSuccess) onSuccess();
                onClose();
            } else {
                throw new Error(data.message || "Failed to save product.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.update(loadingToast, { render: error.message || "An error occurred.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40  z-[99999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[576px] h-[945px] max-h-[90vh] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.3)] flex flex-col font-nunito relative overflow-hidden animate-scaleIn">
                
                {/* Header */}
                <div className="flex items-center justify-center h-[80px] shrink-0 border-b border-[#e5e7eb] relative px-6">
                    <h2 className="text-[24px] font-bold text-[#374151]">
                        {isEditMode ? 'Edit Stock/ Inventory' : 'Add Stock/ Inventory'}
                    </h2>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body (Scrollable Form) */}
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    {isLoadingData ? (
                        <div className="h-full flex items-center justify-center text-gray-500 italic">
                            Loading data...
                        </div>
                    ) : (
                        <form id="addStockForm" onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
                            
                            {/* Image Upload Icon Area */}
                            <div className="flex justify-center mb-2">
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-[100px] h-[100px] flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors overflow-hidden relative"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                        <svg className="w-[64px] h-[64px] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                            <path d="M12 16v-4m0 0l-2 2m2-2l2 2" strokeWidth="2" stroke="black"></path>
                                        </svg>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleImageChange} 
                                        accept="image/*"
                                    />
                                </button>
                            </div>

                            {/* Item Name */}
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[16px] font-medium text-[#212b36]">Item Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Item Name" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[16px] font-medium text-[#212b36]">Description</label>
                                <input type="text" name="desc" value={formData.desc} onChange={handleInputChange} placeholder="Enter Description" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                            </div>

                            {/* Category Dropdown */}
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[16px] font-medium text-[#212b36]">Category</label>
                                <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb] appearance-none">
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Grid (Row 4) */}
                            <div className="grid grid-cols-2 gap-[24px]">
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Price($)</label>
                                    <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="Enter price" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Whole Sale Price($)</label>
                                    <input type="number" step="0.01" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} placeholder="Enter whole sale price" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                            </div>

                            {/* Identifiers Grid (Row 5) */}
                            <div className="grid grid-cols-3 gap-[24px]">
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Product Code</label>
                                    <input type="text" name="productCode" value={formData.productCode} onChange={handleInputChange} placeholder="Enter Product Code" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Enter SKU" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Grind</label>
                                    <input type="text" name="grind" value={formData.grind} onChange={handleInputChange} placeholder="Enter Grind" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                            </div>

                            {/* Specs Grid (Row 6) */}
                            <div className="grid grid-cols-3 gap-[24px]">
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Quanity</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="Enter Quantity" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Weight</label>
                                    <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="Enter Weight" className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb]" />
                                </div>
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[16px] font-medium text-[#212b36]">Units</label>
                                    <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full h-[49.33px] px-[10px] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400 bg-[#f9fafb] appearance-none">
                                        <option value="kg">Kg</option>
                                        <option value="lbs">lbs</option>
                                    </select>
                                </div>
                            </div>

                            {/* Supplier SKUs Section */}
                            <div className="flex flex-col gap-[8px] mt-2">
                                <label className="text-[16px] font-medium text-[#212b36]">Supplier SKUs</label>
                                <div className="border-[0.66px] border-[#e2e8f0] rounded-[6px] p-[12px] max-h-[256px] overflow-y-auto custom-scrollbar">
                                    <div className="flex flex-col gap-[12px]">
                                        {suppliers.map(sup => (
                                            <div key={sup.id} className="grid grid-cols-2 gap-[12px]">
                                                {/* Left side: Supplier Name (Read Only) */}
                                                <input 
                                                    type="text" 
                                                    value={sup.supplierName || sup.name || ''} 
                                                    readOnly 
                                                    className="w-full h-[49.33px] px-[10px] bg-white border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-[#4b5563] cursor-default"
                                                />
                                                {/* Right side: Supplier SKU input */}
                                                <input 
                                                    type="text" 
                                                    value={supplierSkus[sup.id] || ''} 
                                                    onChange={(e) => handleSupplierSkuChange(sup.id, e.target.value)}
                                                    placeholder={`Enter SKU for ${sup.supplierName || sup.name || 'supplier'}`} 
                                                    className="w-full h-[49.33px] px-[10px] bg-[#f9fafb] border-[0.66px] border-[#e2e8f0] rounded-[4px] text-[16px] text-gray-700 focus:outline-none focus:border-gray-400"
                                                />
                                            </div>
                                        ))}
                                        {suppliers.length === 0 && (
                                            <span className="text-sm text-gray-400 italic">No suppliers available.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </form>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-[16px] h-[64px] shrink-0 border-t border-[#e5e7eb] px-[24px] bg-white">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="h-[49.33px] px-[24px] border-[0.66px] border-[#86644c] text-[#86644c] text-[16px] font-medium rounded-[8px] hover:bg-[#fef7e8] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="addStockForm" 
                        disabled={isSubmitting || isLoadingData}
                        className="h-[49.33px] px-[40px] bg-[#86644c] text-white text-[16px] font-medium rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[155px]"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            isEditMode ? 'Update Stock' : 'Add Stock'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};