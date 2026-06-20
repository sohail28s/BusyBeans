import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import axios from 'axios'; 
import useStore from '../../Hooks/useStore';

const ProductSelection = ({ selectedCategoryId, inventoryView, partner, cartItems = [], setCartItems, onOpenCart }) => { 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [products, setProducts] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(''); 

    useEffect(() => { 
        const fetchProducts = async () => { 
            setIsGlobalLoading(true); 
            try { 
                let apiUrl = ''; 
                if (inventoryView === 'partner' && partner?.id) { 
                    apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/products/sales-rep?page=1&limit=1000&salesRepId=${partner.id}`; 
                } else { 
                    apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/product?page=1&limit=1000'; 
                } 
                const res = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                if (res.data.status === 'success') { setProducts(res.data.data.data || []); } 
            } catch (error) { 
                console.error("Error fetching products:", error); 
            } finally { 
                setIsGlobalLoading(false); 
            } 
        }; 
        fetchProducts(); 
    }, [inventoryView, partner, setIsGlobalLoading]); 

    // Memoize filtering for performance
    const filteredProducts = useMemo(() => {
        return products.filter(product => { 
            const matchesCategory = selectedCategoryId === 'All' || product.categoryId === selectedCategoryId; 
            const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()); 
            return matchesCategory && matchesSearch; 
        });
    }, [products, selectedCategoryId, searchTerm]);

    const getQty = useCallback((id) => {
        return cartItems?.find(item => item.id === id)?.quantity || 0;
    }, [cartItems]); 

    const handleIncrement = useCallback((product) => { 
        setCartItems(prev => { 
            const safePrev = prev || []; 
            const existing = safePrev.find(item => item.id === product.id); 
            if (existing) { 
                return safePrev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item); 
            } 
            return [...safePrev, { ...product, quantity: 1 }]; 
        }); 
    }, [setCartItems]); 

    const handleDecrement = useCallback((id) => { 
        setCartItems(prev => { 
            const safePrev = prev || []; 
            return safePrev.map(item => { 
                if (item.id === id) { return { ...item, quantity: item.quantity - 1 }; } 
                return item; 
            }).filter(item => item.quantity > 0); 
        }); 
    }, [setCartItems]); 

    const totalUniqueItems = cartItems?.length || 0; 
    
    const getImageUrl = (path) => { 
        if (!path) return "https://stageadmin.busybeancoffee.com/images/logocoffee.png"; 
        if (path.startsWith('http')) return path; 
        return `https://testingbb.trimworldwide.com/${path}`; 
    }; 

    return ( 
        <div className="relative pb-24 mt-6"> 
         
            <div className="mb-6 relative w-full sm:w-96"> 
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> 
                </svg> 
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full h-[42px] pl-9 pr-4 bg-white text-gray-700 text-[16px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-colors" 
                /> 
            </div> 
            
            {inventoryView === 'admin' ? (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-6 font-sans">
                    <p className="text-sm font-medium text-amber-800">
                        You are viewing <strong>Admin inventory</strong>.
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                        The order will be created for admin <strong>Customers/Partners</strong>. Add products, then click "Create Order" to open the drawer and select the customer/partner.
                    </p>
                </div>
            ) : (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-6 font-sans">
                    <p className="text-sm font-medium text-emerald-800">
                        You are viewing <strong>{partner?.formattedName || 'Partner'}'s inventory</strong> (Local Partner).
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                        The order will be created for this <strong>partner's customers</strong>. Add products, then click "Create Order" to complete the order in the drawer.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1
             sm:grid-cols-2 md:grid-cols-2 
             lg:grid-cols-3 
             xl:grid-cols-4 gap-6 place-items-center"> 
                {filteredProducts.length > 0 ? ( 
                    filteredProducts.map(product => { 
                        const qty = getQty(product.id); 
                        const isMinusDisabled = qty === 0; 
                        
                        return ( 
                            <div key={product.id} data-testid={`product-${product.id}-card`} className="flex flex-col justify-between rounded-xl border border-tab-border border-opacity-60 shadow-sm transition-shadow duration-300 bg-white overflow-hidden h-full w-full ">
                                
                                <div className="border-b border-tab-border border-opacity-20 py-4 bg-gray-50">
                                    <div className="h-32 flex items-center justify-center">
                                        <img 
                                            alt={product.name} 
                                            className="object-contain h-full w-full px-2" 
                                            src={getImageUrl(product.image)} 
                                            onError={(e) => e.target.src = "https://stageadmin.busybeancoffee.com/images/logocoffee.png"} 
                                        />
                                    </div>
                                </div>

                                <div className="h-full  px-4 py-4 font-sans space-y-2.5 flex flex-col justify-between">
                                    <div className="[&>p]:flex [&>p]:justify-between [&>p]:gap-x-2 [&>p]:text-sm [&>p]:py-0.5">
                                        <p className="mb-2"><span className="text-start break-words break-all font-semibold text-base text-gray-900 line-clamp-2">{product.name}</span></p>
                                        <p><span className="text-gray-600">Grind</span> <span className="text-end break-words break-all text-gray-900 font-medium">{product.grind || '-'}</span></p>
                                        <p><span className="text-gray-600">Product Code</span> <span className="text-end break-words break-all text-gray-900 font-medium">{product.productCode || 'N/A'}</span></p>
                                        <p><span className="text-gray-600">Sku</span> <span className="text-end break-words break-all text-gray-900 font-medium">{product.sku || 'N/A'}</span></p>
                                        <p><span className="text-gray-600">Price</span> <span className="text-end break-words break-all text-brand-brown font-semibold">${Number(product.price || 0).toFixed(2)}</span></p>
                                        <p><span className="text-gray-600">Whole Sale Price</span> <span className="text-end break-words break-all text-gray-900 font-medium">${Number(product.wholesalePrice || 0).toFixed(2)}</span></p>
                                        <p><span className="text-gray-600">Weight</span> <span className="text-end break-words break-all text-gray-900 font-medium">{Number(product.weight || 0).toFixed(2)} {product.unit || 'lbs'}</span></p>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => handleDecrement(product.id)} 
                                                disabled={isMinusDisabled} 
                                                className="w-9 h-9 flex items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-400 bg-gray-100 text-gray-700 hover:bg-brand-brown hover:text-white border border-gray-300 hover:border-brand-brown transition-all duration-200 active:scale-95" 
                                                title="Decrease quantity"
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M19 11H5V13H19V11Z"></path></svg>
                                            </button>
                                            
                                            <div className="min-w-[3rem] flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-900">{qty}</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleIncrement(product)} 
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-brown text-white  border border-brand-brown transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md" 
                                                title="Increase quantity"
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        ); 
                    }) 
                ) : ( 
                    <div className="col-span-full py-12 text-center text-gray-500">No products found matching your search or category.</div> 
                )} 
            </div> 

            <div className="fixed bottom-[40px] right-[40px] z-40"> 
                <button onClick={onOpenCart} className="h-[60px] px-6 bg-brand-brown hover:bg-input-hover text-white text-[20px] font-medium rounded-[8px] shadow-lg transition-colors focus:outline-none" > 
                    Create Order 
                </button> 
                <div className="absolute -top-[12px] -right-[12px] w-[28px] h-[28px] bg-black text-white text-[14px] font-bold rounded-full flex items-center justify-center shadow-md"> 
                    {totalUniqueItems} 
                </div> 
            </div> 
        </div> 
    ); 
}; 

export default ProductSelection;