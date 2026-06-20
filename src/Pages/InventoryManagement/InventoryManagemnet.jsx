import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { exportToExcel } from '../../utils/excelHelper';
import InventoryToggleBar from '../../ComponentsTemp/OrderManagement/InventoryToggleBar';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader';
import { InventoryTable } from '../../ComponentsTemp/InventoryManagement/InventroyTable';
import AddProductModal from '../../ComponentsTemp/OrderManagement/Modals/AddProductModal';
import ChangePriceModal from '../../ComponentsTemp/OrderManagement/Modals/ChangePricesModal';
import { InventoryModal } from '../../ComponentsTemp/InventoryManagement/InventoryModal';
import DeleteProductModal from '../../ComponentsTemp/InventoryManagement/DeleteProductModal';
import { ExportModal } from '../../ComponentsTemp/InventoryManagement/ExportModal';
import { getAuthConfig } from '../../utils/orderUtils';


const CategoryDropdown = ({ categories, selectedCategoryId, setSelectedCategoryId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedName =
        selectedCategoryId === 'All'
            ? 'Wild category'
            : categories.find(c => c.id === selectedCategoryId)?.name.trim() || 'Wild category';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative font-sans z-0 ml-auto" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-[220px] h-[40px] px-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
            >
                <span className="text-[14px] text-gray-600 truncate pr-2">{selectedName}</span>
                <div className="flex items-center flex-shrink-0">
                    <span className="w-[1px] h-5 bg-gray-200 mx-2"></span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute right-0 top-[110%] w-full bg-white border border-gray-200 shadow-lg rounded-md py-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div
                        onClick={() => { setSelectedCategoryId('All'); setIsOpen(false); }}
                        className={`px-4 py-2.5 text-[14px] cursor-pointer text-gray-800 hover:bg-[#eaf2fd] ${selectedCategoryId === 'All' ? 'bg-[#eaf2fd]' : ''}`}
                    >
                        All
                    </div>
                    {categories.map((cat) => {
                        const cleanName = cat.name.trim();
                        return (
                            <div
                                key={cat.id}
                                onClick={() => { setSelectedCategoryId(cat.id); setIsOpen(false); }}
                                className={`px-4 py-2.5 text-[14px] cursor-pointer text-gray-800 hover:bg-[#eaf2fd] ${selectedCategoryId === cat.id ? 'bg-[#eaf2fd]' : ''}`}
                            >
                                {cleanName}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const InventoryManagement = () => {
   
     const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    // States
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Toggle & Category States
    const [inventoryView, setInventoryView] = useState('admin'); // 'admin' | 'partner'
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');

    // Partner Modal States
    const [isPartnerAddProductOpen, setIsPartnerAddProductOpen] = useState(false);
    const [isPartnerChangePriceOpen, setIsPartnerChangePriceOpen] = useState(false);
    const [partnerProductToChangePrice, setPartnerProductToChangePrice] = useState(null);

    // Admin Modal States
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState(null);

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(
                    'https://testingbb.trimworldwide.com/api/v1/admin/category?status=1',
                    getAuthConfig()
                );
                if (res.data.status === 'success') {
                    setCategories(res.data.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Set Top Navbar
    useEffect(() => {
        setTitle('Inventory Management');
        setShowProfile(false);
        setActions(
            <div className="flex items-center gap-4">
                <button
                    onClick={() => { setSelectedProductId(null); setIsInventoryModalOpen(true); }}
                    className="text-[14px] text-gray-800 font-medium hover:text-black transition-colors"
                >
                    New Product
                </button>
                <span className="text-gray-300">|</span>
                <button
                    onClick={() => setIsExportModalOpen(true)} // <-- Changed this line
                    className="text-[14px] text-gray-800 font-medium hover:text-black transition-colors"
                >
                    Export
                </button>
            </div>
        );
        return () => { setTitle(''); setActions(null); setShowProfile(true); };
    }, [setTitle, setActions , setShowProfile]);

    const fetchInventory = async () => {
        setIsGlobalLoading(true);
        setIsLoading(true);
        let apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/product?page=1&limit=1000';

        if (inventoryView === 'partner' && selectedPartner?.id) {
            apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/products/sales-rep?page=1&limit=1000&salesRepId=${selectedPartner.id}`;
        }

        try {
            const response = await axios.get(apiUrl, getAuthConfig());
            if (response.data?.status === 'success') {
                let fetchedProducts = response.data.data.data || [];
                if (selectedCategoryId !== 'All') {
                    fetchedProducts = fetchedProducts.filter(p => p.categoryId === selectedCategoryId);
                }
                setProducts(fetchedProducts);
            } else {
                toast.error("Failed to fetch inventory.");
            }
        } catch (error) {
            toast.error("An error occurred while fetching inventory.");
        } finally {
            setIsGlobalLoading(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (inventoryView === 'partner' && !selectedPartner) {
            setProducts([]);
            return;
        }
        fetchInventory();
    }, [inventoryView, selectedPartner, selectedCategoryId]);

    // --- Action Handlers ---
    const handleDownloadCSV = () => {
        const csvData = products.map((p, index) => ({
            "SL": index + 1,
            "Name": p.name,
            "Weight": `${p.weight} ${p.unit}`,
            "Price ($)": p.price,
            "Whole Sale Price ($)": p.wholesalePrice,
            "Product Code": p.productCode,
            "SKU": p.sku,
            "Grind": p.grind || '-',
            "Status": p.status ? 'Active' : 'Inactive'
        }));
        exportToCSV(csvData, `inventory_export_${inventoryView}.csv`);
    };

    const handleStatusChange = async (product) => {
        const newStatus = !product.status;
        const loadingId = toast.loading("Updating status...");
        try {
            const response = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/product/${product.id}`,
                { status: newStatus },
                getAuthConfig()
            );
            if (response.data?.status === 'success' || response.status === 200) {
                toast.update(loadingId, { render: "Status updated successfully", type: "success", isLoading: false, autoClose: 2000 });
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
            } else {
                throw new Error("Failed to update status");
            }
        } catch (err) {
            toast.update(loadingId, { render: err.response?.data?.message || "Error updating status", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleAdminEdit = (product) => {
        setSelectedProductId(product.id);
        setIsInventoryModalOpen(true);
    };

    const handleAdminDelete = (product) => {
        setProductIdToDelete(product.id);
        setIsDeleteModalOpen(true);
    };

    const handlePartnerChangePriceAction = (product) => {
        setPartnerProductToChangePrice(product);
        setIsPartnerChangePriceOpen(true);
    };

    return (
        <div className="w-full flex flex-col min-h-[calc(100vh-100px)] bg-whitefont-sans">
            <div className="p-6 md:p-8 flex-1 flex flex-col  mx-auto w-full gap-6">

                {/* Top Section */}
                <div className="flex items-start justify-between w-full">
                    <PageStatsHeader cardTitle="Total Products" totalValue={products.length} />
                    <CategoryDropdown
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        setSelectedCategoryId={setSelectedCategoryId}
                    />
                </div>

                {/* View Toggle Bar */}
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-4">
                    <InventoryToggleBar
                        view={inventoryView}
                        setView={setInventoryView}
                        partner={selectedPartner}
                        setPartner={setSelectedPartner}
                        onOpenAddProduct={() => setIsPartnerAddProductOpen(true)}
                        onOpenChangePrice={() => setIsPartnerChangePriceOpen(true)}
                    />
                </div>

                <div className="w-full font-sans">
                    {inventoryView === 'admin' ? (
                        /* --- Admin View Banner (Yellow) --- */
                        <div className="w-full bg-[#fffbeb] border border-[#fef08a] rounded-lg p-4 flex items-center gap-3 text-[14px] text-[#854d0e]">

                            <p>
                                You are currently viewing the <strong>Admin Inventory</strong>. You have full control over master product details.
                            </p>
                        </div>
                    ) : (
                        /* --- Local Partner View Banner (Green) --- */
                        <div className="w-full bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 flex items-center gap-3 text-[14px] text-[#166534]">

                            <p>
                                You are viewing the<strong>Local Partner Inventory</strong>. Pricing shown is specific to partner distributions.
                            </p>
                        </div>
                    )}
                </div>


                <InventoryTable
                    data={products}
                    isLoading={isLoading}
                    inventoryView={inventoryView}
                    onDownloadCSV={handleDownloadCSV}
                    onStatusChange={handleStatusChange}
                    onEditAdminProduct={handleAdminEdit}
                    onDeleteAdminProduct={handleAdminDelete}
                    onPartnerChangePrice={handlePartnerChangePriceAction}
                />
            </div>

            {/* Local Partner Modals */}
            <AddProductModal
                isOpen={isPartnerAddProductOpen}
                onClose={() => setIsPartnerAddProductOpen(false)}
                partner={selectedPartner}
                onSuccess={fetchInventory}
            />
            <ChangePriceModal
                isOpen={isPartnerChangePriceOpen}
                onClose={() => { setIsPartnerChangePriceOpen(false); setPartnerProductToChangePrice(null); }}
                partner={selectedPartner}
                product={partnerProductToChangePrice}
                onSuccess={fetchInventory}
            />

            {/* Admin Inventory Modal (Add / Edit) */}
            <InventoryModal
                isOpen={isInventoryModalOpen}
                onClose={() => { setIsInventoryModalOpen(false); setSelectedProductId(null); }}
                productId={selectedProductId}
                onSuccess={fetchInventory}
            />

            {/* Delete Confirmation Modal */}
            <DeleteProductModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setProductIdToDelete(null); }}
                productId={productIdToDelete}
                onSuccess={fetchInventory}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={products} // Pass the currently fetched products
                inventoryView={inventoryView} // Pass this to name the file correctly
            />
        </div>
    );
};

export default InventoryManagement;