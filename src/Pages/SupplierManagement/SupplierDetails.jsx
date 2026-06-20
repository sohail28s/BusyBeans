import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';

const SupplierDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // --- Global Store Actions ---
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [supplierData, setSupplierData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });

    // --- Hide Profile Picture in Header ---
    useEffect(() => {
        setShowProfile(false);
        return () => setShowProfile(true);
    }, [setShowProfile]);

    // --- Fetch Supplier Data with Global Loader ---
    const fetchSupplierDetails = useCallback(async () => {
        setIsLoading(true);
        setIsGlobalLoading(true); // Turn on global loader
        try {
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/supplier/${id}`, getAuthConfig());
            setSupplierData(res.data?.data?.data || null);
        } catch (error) {
            console.error("Failed to fetch supplier details:", error);
            toast.error("Failed to load supplier details.");
            navigate('/suppliers'); 
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false); // Turn off global loader
        }
    }, [id, navigate, setIsGlobalLoading]);

    useEffect(() => {
        fetchSupplierDetails();
    }, [fetchSupplierDetails]);

    // --- Configure Header Title & Actions ---
    useEffect(() => {
        if (!supplierData) return;

        const customTitleNode = (
            <div className="flex items-center text-[22px] font-bold text-gray-900">
                <button 
                    onClick={() => navigate('/suppliers')} 
                    className="mr-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                >
                      <div className="flex items-center gap-3 cursor-pointer transition-opacity font-bold " onClick={() => navigate(-1)}>
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" className="text-black hover:bg-black hover:text-white  font-bold rounded-full">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg></div>
                </button>
                <span>Supplier / <span className="text-[#86644c] font-semibold">{supplierData.supplierName}</span></span>
                
                {/* Styled Badge matching the screenshot */}
                <span className={`ml-4 px-3 py-1 rounded-full text-[13px] font-medium tracking-wide ${supplierData.status ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'}`}>
                    {supplierData.status ? 'Active' : 'Inactive'}
                </span>
            </div>
        );

        // Right Side Actions (Edit & Delete)
        const customActionsNode = (
            <div className="flex items-center gap-4 text-[15px] font-medium text-gray-800">
                <button onClick={() => navigate(`/suppliers/edit/${id}`)} className="hover:text-black hover:underline transition-all">
                    Edit
                </button>
                <div className="w-[1px] h-4 bg-gray-300"></div>
                <button onClick={() => setIsDeleteModalOpen(true)} className="hover:text-black hover:underline transition-all">
                    Delete Account
                </button>
            </div>
        );

        setTitle(customTitleNode);
        setActions(customActionsNode);

        return () => {
            setTitle('');
            setActions(null);
        };
    }, [supplierData, navigate, setTitle, setActions, id]);

    // --- Handle Delete Request ---
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await axios.delete(`https://testingbb.trimworldwide.com/api/v1/admin/supplier/${id}`, getAuthConfig());
            if (res.data.status === 'success' || res.status === 200 || res.status === 204) {
                toast.success("Supplier successfully deleted.");
                setIsDeleteModalOpen(false);
                navigate('/suppliers'); 
            }
        } catch (error) {
            console.error("Failed to delete supplier:", error);
            toast.error(error.response?.data?.message || "Failed to delete supplier.");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Formatting Helpers ---
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const formatFullAddress = () => {
        if (!supplierData) return [];
        const parts = [];
        if (supplierData.addressOne) parts.push(supplierData.addressOne);
        if (supplierData.addressTwo) parts.push(supplierData.addressTwo);
        
        // Format: City, State ZipCode
        const cityStateZip = [supplierData.city, supplierData.state].filter(Boolean).join(', ') + (supplierData.zipCode ? ` ${supplierData.zipCode}` : '');
        if (cityStateZip) parts.push(cityStateZip);
        
        if (supplierData.country) parts.push(supplierData.country);
        return parts;
    };

    // If loading, render nothing (the global loader handles the UI)
    if (isLoading || !supplierData) return null;

    return (
        <div className="w-full min-h-[calc(100vh-94px)] bg-whitep-6 lg:p-10 font-sans flex justify-center items-start">
            
            {/* Main Detail Card */}
            <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-lg p-10 shadow-sm">
                
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16">
                    
                    {/* LEFT COLUMN: Data List */}
                    <div className="flex flex-col">
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Contact</span>
                            <span className="flex-1 text-gray-900 text-[15px] font-semibold">{supplierData.supplierName || ""}</span>
                        </div>
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Email</span>
                            <span className="flex-1 text-[#3b82f6] text-[15px] font-medium">{supplierData.email || ""}</span>
                        </div>
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Created At</span>
                            <span className="flex-1 text-gray-900 text-[15px] font-medium">{formatDate(supplierData.createdAt)}</span>
                        </div>
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Registered By</span>
                            <span className="flex-1 text-gray-900 text-[15px] font-medium">{supplierData.registerBy || ""}</span>
                        </div>
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Phone</span>
                            <span className="flex-1 text-gray-900 text-[15px] font-medium">
                                {supplierData.phoneNum ? `${supplierData.countryCode || ''} ${supplierData.phoneNum}` : ""}
                            </span>
                        </div>
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Bank Account</span>
                            <span className="flex-1 text-gray-900 text-[15px] font-medium">{supplierData.bankAccount || ""}</span>
                        </div>
                        <div className="flex py-5 border-b border-gray-100">
                            <span className="w-[160px] text-[#64748b] text-[15px] font-medium">Supplier Type</span>
                            <span className="flex-1 text-gray-900 text-[15px] font-semibold">{supplierData.supplierType || ""}</span>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Address Block */}
                    <div className="flex flex-col pt-5">
                        <span className="text-gray-900 text-[15px] font-bold mb-3">Address</span>
                        <div className="flex flex-col text-[#475569] text-[14px] uppercase leading-[1.8] font-medium tracking-wide">
                            {formatFullAddress().length > 0 ? (
                                formatFullAddress().map((line, idx) => <span key={idx}>{line}</span>)
                            ) : (
                                <span className="normal-case italic text-gray-400">No address provided</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {isDeleteModalOpen && (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all">
        <div className="bg-white rounded-[8px] w-full max-w-[480px] shadow-xl relative flex flex-col font-sans p-8">
            <h2 className="text-[20px] font-bold text-black mb-3">
                Delete Supplier Account
            </h2>
            <p className="text-[#64748b] text-[16px]">
                Are you sure you want to delete {supplierData.supplierName}?
            </p>
            <div className="flex justify-end gap-3 mt-10">
                <button 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    disabled={isDeleting}
                    className="px-6 py-2 border border-gray-200 rounded-[4px] text-[15px] font-medium text-black bg-white hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    className="px-6 py-2 bg-[#dc2626] text-white text-[15px] font-medium rounded-[4px] hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default SupplierDetails;