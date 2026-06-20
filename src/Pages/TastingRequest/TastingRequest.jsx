import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
import { formatDate } from '../../utils/orderUtils';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';




export const TastingRequestTable = ({ data, isLoading, onDelete, onDownloadCSV }) => { 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [pagination, setPagination] = useState({ page: 1, limit: 10 }); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' }); 

    // 1. Client-Side Search 
    const filteredData = useMemo(() => { 
        if (!data) return []; 
        return data.filter(item => { 
            if (!searchQuery) return true; 
            const q = searchQuery.toLowerCase(); 
            return ( 
                String(item.id).includes(q) || 
                (item.name || '').toLowerCase().includes(q) || 
                (item.email || '').toLowerCase().includes(q) || 
                (item.phone || '').toLowerCase().includes(q) || 
                (item.company || '').toLowerCase().includes(q) 
            ); 
        }); 
    }, [data, searchQuery]); 

    // 2. Client-Side Sort 
    const sortedData = useMemo(() => { 
        let displayData = [...filteredData]; 
        if (sortConfig.key && sortConfig.direction !== 'default') { 
            displayData.sort((a, b) => { 
                let aVal = a[sortConfig.key]; 
                let bVal = b[sortConfig.key]; 
                
                if (sortConfig.key === 'id') { 
                    aVal = parseInt(aVal || 0, 10); 
                    bVal = parseInt(bVal || 0, 10); 
                } else if (typeof aVal === 'string') { 
                    aVal = aVal.toLowerCase(); 
                    bVal = (bVal || '').toLowerCase(); 
                } 
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1; 
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1; 
                return 0; 
            }); 
        } 
        return displayData; 
    }, [filteredData, sortConfig]); 

    const handleSort = (key) => { 
        let direction = 'asc'; 
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; 
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default'; 
        setSortConfig({ key, direction }); 
    }; 

    // 3. Slice for Pagination 
    const paginatedData = useMemo(() => { 
        const start = (pagination.page - 1) * pagination.limit; 
        return sortedData.slice(start, start + pagination.limit); 
    }, [sortedData, pagination.page, pagination.limit]); 

    // --- Pagination Adapter ---
    const adaptedPagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: sortedData.length
    };

    const handleSetPagination = (updater) => {
        const nextState = typeof updater === 'function' ? updater(adaptedPagination) : updater;
        setPagination({ page: nextState.page, limit: nextState.limit });
    };

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans"> 
            
            {/* Table Toolbar */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                <div className="relative"> 
                    <input 
                        placeholder="Search by ID, Name, Email, Phone, Company" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg pl-10 pr-5 outline-none placeholder:font-sans placeholder:font-medium focus:bg-gray-200 transition-colors text-[14px] text-gray-700" 
                        type="search" 
                    /> 
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute top-3 md:top-3.5 left-3 text-gray-900" height="20" width="20">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </div> 
                
              
            </div> 

            {/* Table Area */} 
            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left min-w-[1200px] border-collapse"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr className="border-b border-[#e2e8f0]"> 
                            <SortableHeader label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[80px]" /> 
                            <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} width="w-[150px]" /> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Email</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Phone</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Company</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Team Size</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Preferred Date</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[200px]">Notes</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] whitespace-nowrap">Created At</th> 
                            <th className="px-8 py-5 font-bold text-[#374151] text-[14px] text-center w-[80px]">Action</th> 
                        </tr> 
                    </thead> 
                    
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan="10" className="text-center py-12 text-[#4b5563] text-[15px] italic">Loading requests...</td></tr> 
                        ) : paginatedData.length > 0 ? ( 
                            paginatedData.map((req) => ( 
                                <tr key={req.id} className="transition-colors hover:bg-gray-50 text-[#4b5563] text-[15px]"> 
                                    <td className="px-8 py-5 font-medium text-gray-900">{req.id}</td> 
                                    <td className="px-8 py-5 text-gray-900 " title={req.name}>{req.name || '-'}</td> 
                                    <td className="px-8 py-5 text-gray-900  max-w-[200px]" title={req.email}>
                                        {req.email ? <a href={`mailto:${req.email}`} className="">{req.email}</a> : '-'}
                                    </td> 
                                    <td className="px-8 py-5 text-gray-900 whitespace-nowrap">{req.phone || '-'}</td> 
                                    <td className="px-8 py-5 text-gray-900  max-w-[150px]" title={req.company}>{req.company || '-'}</td> 
                                    <td className="px-8 py-5 text-gray-900">{req.teamSize || '-'}</td> 
                                    <td className="px-8 py-5 text-gray-900 whitespace-nowrap">{formatDate(req.preferredDate)}</td> 
                                    <td className="px-8 py-5 text-gray-900  max-w-[200px]" title={req.notes}>{req.notes || '-'}</td> 
                                    <td className="px-8 py-5 text-gray-900 whitespace-nowrap"> 
                                        <div className="flex flex-col leading-tight"> 
                                            <span>{formatDate(req.createdAt).split(' ')[0]}</span> 
                                            <span className="text-[13px] text-gray-500 mt-1">{formatDate(req.createdAt, true).split(' ').slice(1).join(' ')}</span> 
                                        </div> 
                                    </td> 
                                    
                                    <td className="px-8 py-5 text-center"> 
                                        {/* EXACT REF DELETE BUTTON & SVG */}
                                        <button 
                                            onClick={() => onDelete(req)} 
                                            className="border border-[#EE4A4A] text-[#EE4A4A] rounded-md p-2 hover:bg-[#EE4A4A] hover:text-white duration-150 outline-none mx-auto block" 
                                            title="Delete request" 
                                        > 
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                            </svg> 
                                        </button> 
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan="10" className="text-center py-12 text-[#4b5563] text-[15px] italic">No tasting requests found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* Global Pagination Component */}
            <TablePagination 
                pagination={adaptedPagination} 
                setPagination={handleSetPagination} 
            /> 

        </div> 
    ); 
};


export const TastingRequests = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
      const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);


    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Fetch Data ---
    const fetchRequests = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/get-in-touch?page=1&limit=1000', getAuthConfig());
            if (res.data?.success) {
                setRequests(res.data.data.submissions || []);
            } else {
                toast.error("Failed to fetch tasting requests.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching tasting requests.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // --- Top Navbar ---
    useEffect(() => {
        setTitle('Tasting Requests');
        setActions(null); 
        setShowProfile(false);
        return () => setTitle('');
        setShowProfile(true);
    }, [setTitle, setActions , setShowProfile]);

    // --- Delete Handlers ---
    const openDeleteModal = (request) => {
        setRequestToDelete(request);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;
        setIsDeleting(true);
        const loadingId = toast.loading("Deleting request...");

        try {
            const res = await axios.delete(
                `https://testingbb.trimworldwide.com/api/v1/admin/get-in-touch/${requestToDelete.id}`,
                getAuthConfig()
            );

            if (res.data?.success || res.status === 200 || res.status === 204) {
                toast.update(loadingId, { render: "Request deleted successfully.", type: "success", isLoading: false, autoClose: 2000 });
                setIsDeleteModalOpen(false);
                setRequestToDelete(null);
                fetchRequests();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.update(loadingId, { render: error.response?.data?.message || "Error deleting request.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 md:p-8 font-sans flex flex-col gap-6">
            
            {/* Table Component */}
            <TastingRequestTable 
                data={requests}
                isLoading={isLoading}
                onDelete={openDeleteModal}
            />

            {/* --- DELETE MODAL --- */}
           {isDeleteModalOpen && ( 
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 font-sans"> 
        <div className="bg-white w-full max-w-[480px] rounded-lg shadow-xl overflow-hidden animate-scaleIn"> 
            
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between"> 
                <h3 className="text-[20px] font-semibold text-[#374151]"> 
                    Delete Tasting Request 
                </h3> 
                <button 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    disabled={isDeleting} 
                    className="text-gray-400 hover:text-gray-600 transition-colors outline-none"
                > 
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg> 
                </button> 
            </div> 
            
            {/* Body */}
            <div className="px-6 pb-8 text-left"> 
                <p className="text-[16px] text-[#4b5563]"> 
                    Are you sure you want to delete this tasting request? This action cannot be undone.
                </p> 
            </div> 
            
            {/* Footer */}
            <div className="px-6 py-5 flex gap-3 justify-end bg-white"> 
                <button 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    className="h-[42px] px-6 border border-gray-300 text-gray-700 text-[15px] font-medium rounded-md hover:bg-gray-50 transition-colors outline-none" 
                    disabled={isDeleting} 
                > 
                    Cancel 
                </button> 
                <button 
                    onClick={confirmDelete} 
                    className="h-[42px] px-6 bg-[#ef4444] text-white text-[15px] font-medium rounded-md hover:bg-red-600 transition-colors flex items-center justify-center min-w-[100px] outline-none" 
                    disabled={isDeleting} 
                > 
                    {isDeleting ? ( 
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg> 
                    ) : ( 
                        "Delete" 
                    )} 
                </button> 
            </div> 
            
        </div> 
    </div> 
)}

        </div>
    );
};

export default TastingRequests;