import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { PageStatsHeader } from '../../Components/Shared/PageStatsHeader';
import { CategoryTable } from './CategoryTable'; 
import { exportToCSV } from '../../utils/csvHelper';
const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});

export const CategoryManagement = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
        const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    // --- State ---
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Add/Edit Modal State
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Fetch Data ---
    const fetchCategories = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/category', getAuthConfig());
            if (res.data?.status === 'success') {
                setCategories(res.data.data.data || []);
            } else {
                toast.error("Failed to fetch categories.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching categories.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        
    }, []);

    // --- Navbar ---
    useEffect(() => {
        setTitle('All Categories');
        setShowProfile(false);
        setActions(
            <button 
                onClick={() => openAddModal()}
                className="text-[14px] text-gray-800 font-medium hover:text-black transition-colors"
            >
                New Category
            </button>
        );

        return () => {
            setTitle('');
            setActions(null);
            setShowProfile(true);
        };
    }, [setTitle, setActions, setShowProfile]);

    // --- Handlers ---

    // Status Toggle
    const handleStatusToggle = async (cat) => {
        const loadingId = toast.loading("Updating status...");
        try {
            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/category/${cat.id}`,
                { status: !cat.status },
                getAuthConfig()
            );
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Status updated.", type: "success", isLoading: false, autoClose: 2000 });
                // Optimistic update
                setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: !cat.status } : c));
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            toast.update(loadingId, { render: "Failed to update status.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    // Add/Edit Logic
    const openAddModal = () => {
        setCategoryToEdit(null);
        setFormData({ name: '' });
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (cat) => {
        setCategoryToEdit(cat);
        setFormData({ name: cat.name || '' });
        setIsAddEditModalOpen(true);
    };

    const handleAddEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Category name is required.");

        setIsSubmitting(true);
        const loadingId = toast.loading(categoryToEdit ? "Updating category..." : "Adding category...");

        try {
            const url = categoryToEdit 
                ? `https://testingbb.trimworldwide.com/api/v1/admin/category/${categoryToEdit.id}`
                : `https://testingbb.trimworldwide.com/api/v1/admin/category`;
            
            const method = categoryToEdit ? 'PATCH' : 'POST';

            const res = await axios({
                method: method,
                url: url,
                data: { name: formData.name },
                ...getAuthConfig()
            });

            if (res.data?.status === 'success' || res.status === 200 || res.status === 201) {
                toast.update(loadingId, { render: `Category ${categoryToEdit ? 'updated' : 'added'}!`, type: "success", isLoading: false, autoClose: 2000 });
                setIsAddEditModalOpen(false);
                fetchCategories();
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.update(loadingId, { render: "Error saving category.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Logic
    const openDeleteModal = (cat) => {
        setCategoryToDelete(cat);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        const loadingId = toast.loading("Deleting category...");

        try {
            const res = await axios.delete(
                `https://testingbb.trimworldwide.com/api/v1/admin/category/${categoryToDelete.id}`,
                getAuthConfig()
            );

            if (res.data?.status === 'success' || res.status === 200 || res.status === 204) {
                toast.update(loadingId, { render: "Category deleted successfully.", type: "success", isLoading: false, autoClose: 2000 });
                setIsDeleteModalOpen(false);
                fetchCategories();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast.update(loadingId, { render: "Error deleting category.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };



     // --- CSV Export Handler ---
    const handleDownloadCSV = () => {
        if (!categories || categories.length === 0) {
            toast.info("No categories to export.");
            return;
        }

        // Format the data exactly how you want it to appear in the Excel/CSV file
        const csvData = categories.map((cat, index) => ({
            "SL": index + 1,
            "Name": cat.name || '',
            "No. of Products": cat.numberOfProducts || 0,
            "Status": cat.status ? 'Active' : 'Inactive'
        }));

        // Call your helper function (make sure exportToCSV is imported at the top)
        exportToCSV(csvData, 'categories_export.csv');
    };
    return (
        <div className="w-full flex flex-col min-h-[calc(100vh-100px)] bg-whitefont-sans">
            <div className="p-6 md:p-8 flex-1 flex flex-col mx-auto w-full gap-6">
                
                {/* Top Section */}
                <div>
                    <PageStatsHeader 
                        cardTitle="Total Categories" 
                        totalValue={categories.length} 
                    />
                </div>

                {/* Table Area */}
                <CategoryTable 
                    data={categories}
                    isLoading={isLoading}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onStatusToggle={handleStatusToggle}
                    onDownloadCSV={handleDownloadCSV}
                />

            </div>

            {/* --- INLINE ADD/EDIT MODAL --- */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[500px] rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn">
                        
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                            <h2 className="text-[20px] font-bold text-[#374151]">
                                {categoryToEdit ? 'Edit Category' : 'Add Category'}
                            </h2>
                            <button onClick={() => setIsAddEditModalOpen(false)} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddEditSubmit} className="p-6 flex flex-col gap-6">
                            <div>
                                <label className="block text-[14px] font-medium text-[#4b5563] mb-2">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    placeholder="Enter Category Name"
                                    className="w-full h-[45px] px-4 border border-[#d1d5db] bg-white text-black rounded-[6px] outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] text-[15px]"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddEditModalOpen(false)} 
                                    disabled={isSubmitting}
                                    className="h-[42px] px-6 text-[#86644c] font-medium border border-[#86644c] rounded-[6px] hover:bg-[#fef7e8] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="h-[42px] px-8 bg-[#86644c] text-white font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- INLINE DELETE MODAL (Matches image_ecc416.png) --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[8px] shadow-xl overflow-hidden animate-scaleIn">
                        
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 relative">
                            <h3 className="text-[20px] font-semibold text-[#374151] w-full text-center">
                                Delete Category
                            </h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-center">
                            <p className="text-[16px] text-[#4b5563] mb-6">
                                Are you sure you want to delete this Category <span className="text-[#ef4444]">which has {categoryToDelete?.numberOfProducts || 0} product(s)</span>?
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-4 flex gap-3 justify-center border-t border-gray-100 bg-white">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="h-[42px] px-8 border border-[#8C6D4F] text-[#8C6D4F] text-[15px] font-medium rounded-[6px] hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="h-[42px] px-8 bg-[#8C6D4F] text-white text-[15px] font-medium rounded-[6px] hover:bg-[#7a5e42] transition-colors flex items-center justify-center min-w-[150px]"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    "Delete Category"
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default CategoryManagement;