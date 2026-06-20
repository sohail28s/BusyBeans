import React, { useState, useEffect, useMemo } from 'react'; 
import axios from 'axios'; 
import { getAuthConfig } from '../../../utils/orderUtils';
export const AddProductModal = ({ 
    isOpen, 
    onClose, 
    onSelectProduct, 
    viewProductsToggle, 
    invoiceTypeToggle, 
    selectedTopPartner, 
    selectedCompanyData 
}) => { 
    const [categories, setCategories] = useState([]); 
    const [products, setProducts] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState('All'); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 

    // Fetch Categories on Mount 
    useEffect(() => { 
        if (!isOpen) return; 
        const fetchCategories = async () => { 
            try { 
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/category', getAuthConfig()); 
                if (res.data?.status === 'success') { 
                    setCategories(res.data.data.data || []); 
                } 
            } catch (error) { 
                console.error("Failed to fetch categories:", error); 
            } 
        }; 
        fetchCategories(); 
    }, [isOpen]); 

    // Fetch Products based on Context 
    useEffect(() => { 
        if (!isOpen) return; 
        const fetchProducts = async () => { 
            setIsLoading(true); 
            try { 
                let apiUrl = ''; 
                let apiMethod = 'GET'; // Default method 
                
                // Context 1: Admin -> Customer 
                if (viewProductsToggle === 'admin' && invoiceTypeToggle === 'Customers') { 
                    apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/product?page=1&limit=1000'; 
                    if (selectedCategory !== 'All') { 
                        apiUrl += `&categoryId=${selectedCategory}`; 
                    } 
                } 
                // Context 2: Admin -> Partner (Using POST as requested) 
                else if (viewProductsToggle === 'admin' && invoiceTypeToggle === 'Partners') { 
                    if (!selectedCompanyData?.id) { 
                        setProducts([]); 
                        setIsLoading(false); 
                        return; // Need a partner selected in the form first 
                    } 
                    apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/sales-rep-products-for-order-creation/${selectedCompanyData.id}`; 
                    apiMethod = 'POST'; // Switch to POST for this specific API 
                } 
                // Context 3: Local Partner -> Customer 
                else if (viewProductsToggle === 'partner') { 
                    if (!selectedTopPartner?.id) { 
                        setProducts([]); 
                        setIsLoading(false); 
                        return; 
                    } 
                    apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/products/sales-rep?page=1&limit=1000&salesRepId=${selectedTopPartner.id}`; 
                } 
                
                // Execute the request based on the dynamic method 
                let res; 
                if (apiMethod === 'POST') { 
                    res = await axios.post(apiUrl, {}, getAuthConfig()); // Passing empty body {} just in case 
                } else { 
                    res = await axios.get(apiUrl, getAuthConfig()); 
                } 
                
                if (res.data?.status === 'success') { 
                    // Handle different API response structures 
                    let fetchedProducts = []; 
                    if (res.data.data?.products) { 
                        fetchedProducts = res.data.data.products; // Admin -> Partner structure 
                    } else if (res.data.data?.data) { 
                        fetchedProducts = res.data.data.data; // Standard structure 
                    } 
                    
                    // Client-side category filtering for APIs that don't support the query param 
                    if (selectedCategory !== 'All' && (viewProductsToggle !== 'admin' || invoiceTypeToggle !== 'Customers')) { 
                        fetchedProducts = fetchedProducts.filter(p => p.categoryId === parseInt(selectedCategory)); 
                    } 
                    setProducts(fetchedProducts); 
                } 
            } catch (error) { 
                console.error("Failed to fetch products:", error); 
                setProducts([]); // Clear on error so it doesn't show old data 
            } finally { 
                setIsLoading(false); 
            } 
        }; 
        fetchProducts(); 
    }, [isOpen, viewProductsToggle, invoiceTypeToggle, selectedCategory, selectedCompanyData, selectedTopPartner]); 

    // Client-side Search Filtering 
    const filteredProducts = useMemo(() => { 
        return products.filter(p => 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) 
        ); 
    }, [products, searchQuery]); 

    if (!isOpen) return null; 

    return ( 
        <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4
        "> 
            <div className="bg-white w-[90vw] md:w-[50vw] max-w-[700px] rounded-lg shadow-xl flex flex-col font-sans animate-fadeIn"> 
                
                {/* Header */} 
                <div className="flex justify-center items-center p-5 md:p-6 border-b border-gray-200 relative shrink-0"> 
                    <h2 className="text-2xl font-bold text-gray-900 text-center">Add Items to Order</h2> 
                    <button onClick={onClose} className="absolute right-5 md:right-6 text-gray-400 hover:text-gray-600 transition-colors outline-none"> 
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg> 
                    </button> 
                </div> 

                {/* Modal Body */}
                <div className="flex flex-col p-6 pt-4 overflow-hidden">
                    
                    {/* Sticky Filters */} 
                    <div className="space-y-3 pb-3 shrink-0"> 
                        {/* Search Input */}
                        <div className="w-full h-14 rounded-md border border-gray-300 relative focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-shadow bg-white"> 
                            <div className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500"> 
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M443.5 420.2L336.7 312.4c20.9-26.2 33.5-59.4 33.5-95.5 0-84.5-68.5-153-153.1-153S64 132.5 64 217s68.5 153 153.1 153c36.6 0 70.1-12.8 96.5-34.2l106.1 107.1c3.2 3.4 7.6 5.1 11.9 5.1 4.1 0 8.2-1.5 11.3-4.5 6.6-6.3 6.8-16.7.6-23.3zm-226.4-83.1c-32.1 0-62.3-12.5-85-35.2-22.7-22.7-35.2-52.9-35.2-84.9 0-32.1 12.5-62.3 35.2-84.9 22.7-22.7 52.9-35.2 85-35.2s62.3 12.5 85 35.2c22.7 22.7 35.2 52.9 35.2 84.9 0 32.1-12.5 62.3-35.2 84.9-22.7 22.7-52.9 35.2-85 35.2z"></path>
                                </svg>
                            </div> 
                            <input 
                                type="search" 
                                placeholder="Search Product..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full h-full bg-transparent text-gray-900 outline-none pl-10 pr-4 text-[15px]" 
                            /> 
                        </div> 
                        
                        {/* Category Dropdown */}
                        <div className="w-full">
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)} 
                                className="w-full h-12 px-4 border border-gray-300 rounded-md text-[15px] text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none bg-white cursor-pointer transition-shadow" 
                            > 
                                <option value="All">All Categories</option> 
                                {categories.map(cat => ( 
                                    <option key={cat.id} value={cat.id}>{cat.name}</option> 
                                ))} 
                            </select> 
                        </div>
                    </div> 

                    {/* Product List */} 
                    <div className="overflow-y-auto max-h-96 custom-scrollbar -mx-3 px-3"> 
                        {isLoading ? ( 
                            <div className="text-center py-10 text-gray-500 font-medium italic">Loading products...</div> 
                        ) : filteredProducts.length > 0 ? ( 
                            <div className="flex flex-col"> 
                                {filteredProducts.map(product => ( 
                                    <div 
                                        key={product.id} 
                                        onClick={() => onSelectProduct(product)} 
                                        className="text-sm cursor-pointer border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 px-3 py-3 hover:shadow-sm transition-all group" 
                                    > 
                                        <div className="flex-1 space-y-1"> 
                                            <p className="font-semibold text-gray-800 group-hover:text-[#86644c] transition-colors">{product.name}</p> 
                                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap"> 
                                                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">SKU: {product.sku || '-'}</span> 
                                                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">Code: {product.productCode || '-'}</span> 
                                                <span className="text-gray-400 font-medium">{product.weight || '0'} {product.unit || 'lbs'}</span> 
                                            </div> 
                                        </div> 
                                        <div className="flex flex-col items-end gap-1 ml-4 shrink-0"> 
                                            <span className="font-bold text-lg text-[#86644c]">${parseFloat(product.price || 0).toFixed(2)}</span> 
                                            <span className="text-xs text-gray-500 font-medium">Wholesale: ${parseFloat(product.wholesalePrice || 0).toFixed(2)}</span> 
                                        </div> 
                                    </div> 
                                ))} 
                            </div> 
                        ) : ( 
                            <div className="text-center py-10 text-gray-500 font-medium italic">No products found.</div> 
                        )} 
                    </div> 
                </div>

            </div> 
        </div> 
    ); 
};