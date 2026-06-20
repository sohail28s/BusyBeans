import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import useStore from '../../Hooks/useStore'; 
import InventoryToggleBar from '../../ComponentsTemp/OrderManagement/InventoryToggleBar'; 
import ProductSelection from '../../ComponentsTemp/OrderManagement/ProductSelection'; 
import AddProductModal from '../../ComponentsTemp/OrderManagement/Modals/AddProductModal'; 
import ChangePriceModal from '../../ComponentsTemp/OrderManagement/Modals/ChangePricesModal'; 
import CartDrawer from '../../ComponentsTemp/OrderManagement/CartDrawer1'; 

const CategoryDropdown = ({ categories, selectedCategoryId, setSelectedCategoryId }) => { 
    const [isOpen, setIsOpen] = useState(false); 
    const dropdownRef = useRef(null); 
    const selectedName = selectedCategoryId === 'All' ? 'Category' : categories.find(c => c.id === selectedCategoryId)?.name.trim() || 'Category'; 
    
    useEffect(() => { 
        const handleClickOutside = (event) => { 
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); 
        }; 
        document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, []); 

    return ( 
        <div className="relative font-sans z-50" ref={dropdownRef}> 
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-[220px] h-[40px] px-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"> 
                <span className="text-[14px] text-gray-600 truncate pr-2">{selectedName}</span> 
                <div className="flex items-center flex-shrink-0"> 
                    <span className="w-[1px] h-5 bg-gray-200 mx-2"></span> 
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /> 
                    </svg> 
                </div> 
            </div> 
            {isOpen && ( 
                <div className="absolute right-0 top-[110%] w-full bg-white border border-gray-200 shadow-lg rounded-md py-1 max-h-[300px] overflow-y-auto custom-scrollbar"> 
                    <div onClick={() => { setSelectedCategoryId('All'); setIsOpen(false); }} className={`px-4 py-2.5 text-[14px] cursor-pointer text-gray-800 hover:bg-menu-active-blue ${selectedCategoryId === 'All' ? 'bg-menu-active-blue' : ''}`}> 
                        All 
                    </div> 
                    {categories.map((cat) => { 
                        const cleanName = cat.name.trim(); 
                        return ( 
                            <div key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setIsOpen(false); }} className={`px-4 py-2.5 text-[14px] cursor-pointer text-gray-800 hover:bg-menu-active-blue ${selectedCategoryId === cat.id ? 'bg-menu-active-blue' : ''}`}> 
                                {cleanName} 
                            </div> 
                        ); 
                    })} 
                </div> 
            )} 
        </div> 
    ); 
}; 
const CreateOrder = () => { 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
     const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const [isCartOpen, setIsCartOpen] = useState(false); 
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('createOrderCart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from local storage", error);
            return [];
        }
    }); 

    const [categories, setCategories] = useState([]); 
    const [selectedCategoryId, setSelectedCategoryId] = useState('All'); 
    const [inventoryView, setInventoryView] = useState('admin'); 
    const [selectedPartner, setSelectedPartner] = useState(null); 
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false); 
    const [isChangePriceModalOpen, setIsChangePriceModalOpen] = useState(false); 

    // Sync cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('createOrderCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Fetch Categories
    useEffect(() => { 
        const fetchCategories = async () => { 
            try { 
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/category?status=1', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                if (res.data.status === 'success') { setCategories(res.data.data.data || []); } 
            } catch (error) { console.error("Error fetching categories:", error); } 
        }; 
        fetchCategories(); 
    }, []); 

    // Header Setup
    useEffect(() => { 
        setTitle("Create Order"); 
        setShowProfile(false); 
        setActions(<CategoryDropdown categories={categories} selectedCategoryId={selectedCategoryId} setSelectedCategoryId={setSelectedCategoryId} />); 
        return () => { 
            setActions(null); 
            setShowProfile(true); 
        }; 
    }, [categories, selectedCategoryId, setTitle, setActions, setShowProfile]); 

    // Track the previous view to prevent wiping the cart on page reload
    const prevInventoryView = useRef(inventoryView);
    useEffect(() => { 
        // Only clear the cart if the view ACTUALLY changed (e.g. user clicked Admin or Partner)
        if (prevInventoryView.current !== inventoryView) {
            setCartItems([]); 
            prevInventoryView.current = inventoryView;
        }
    }, [inventoryView, setCartItems]); 

    return ( 
        <div className="w-full flex flex-col min-h-screen bg-whitefont-sans"> 
            <div className="p-2 lg:p-6 flex-1 flex justify-center"> 
                <div className="w-full bg-white rounded-lg p-6 sm:px-8 py-6 min-h-[80vh]"> 
                    <InventoryToggleBar 
                        view={inventoryView} 
                        setView={setInventoryView} 
                        partner={selectedPartner} 
                        setPartner={setSelectedPartner} 
                        onOpenAddProduct={() => setIsAddProductModalOpen(true)} 
                        onOpenChangePrice={() => setIsChangePriceModalOpen(true)} 
                    /> 
                    <ProductSelection 
                        selectedCategoryId={selectedCategoryId} 
                        inventoryView={inventoryView} 
                        partner={selectedPartner} 
                        cartItems={cartItems} 
                        setCartItems={setCartItems} 
                        onOpenCart={() => setIsCartOpen(true)} 
                    /> 
                </div> 
            </div> 
            
            <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} partner={selectedPartner} onSuccess={() => { setInventoryView('admin'); setTimeout(() => setInventoryView('partner'), 100); }} /> 
            <ChangePriceModal isOpen={isChangePriceModalOpen} onClose={() => setIsChangePriceModalOpen(false)} partner={selectedPartner} onSuccess={() => { setInventoryView('admin'); setTimeout(() => setInventoryView('partner'), 100); }} /> 
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} onUpdateQuantity={(id, newQty) => { setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)); }} onRemoveItem={(id) => { setCartItems(prev => prev.filter(item => item.id !== id)); }} onClearCart={() => setCartItems([])} inventoryView={inventoryView} setInventoryView={setInventoryView} selectedPartner={selectedPartner} /> 
        </div> 
    ); 
}; 
export default CreateOrder;