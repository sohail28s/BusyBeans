import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import { exportToCSV } from '../../utils/csvHelper'; 
import { TablePagination } from '../../Components/Shared/Table/TablePagination'; 

const StatusToggleCell = ({ initialStatus, partnerId }) => { 
    const [isToggled, setIsToggled] = useState(initialStatus); 
    const [isChanging, setIsChanging] = useState(false); 

    const handleToggle = async (e) => { 
        e.stopPropagation(); 
        if (isChanging) return; 
        
        const nextStatus = !isToggled; 
        setIsChanging(true); 
        
        try { 
            const res = await axios.patch( 
                `https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/${partnerId}`, 
                { status: nextStatus }, 
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } } 
            ); 
            if (res.data === nextStatus || res.status === 200) { 
                setIsToggled(nextStatus); 
                toast.success(`Partner marked as ${nextStatus ? 'Active' : 'Inactive'}.`); 
            } 
        } catch (error) { 
            toast.error("An error occurred. Please try again."); 
        } finally { 
            setIsChanging(false); 
        } 
    }; 

    return ( 
        <div className="flex items-center gap-2"> 
            <div>
                {isToggled ? (
                    <div className="w-max text-xs bg-[#86644c] text-white font-semibold p-2 rounded-md flex justify-center">
                        Active
                    </div>
                ) : (
                    <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                        Inactive
                    </div>
                )}
            </div>
            
            <button 
                type="button"
                onClick={handleToggle}
                disabled={isChanging}
                className="relative inline-flex items-center justify-start w-14 h-7 rounded-full transition-colors duration-300 ease-in-out disabled:opacity-50 outline-none"
                style={{ backgroundColor: isToggled ? '#86644c' : '#888888' }}
            >
                <span 
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isToggled ? 'translate-x-[26px]' : 'translate-x-[2px]'}`}
                />
            </button>
        </div> 
    ); 
}; 

export const LocalPartnerTable = ({ onTotalUpdate }) => { 
    const navigate = useNavigate(); 
    const [partners, setPartners] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 }); 

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [partnerToDelete, setPartnerToDelete] = useState(null); 
    const [isDeleting, setIsDeleting] = useState(false); 

    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    }); 

    const fetchPartners = async () => { 
        setIsLoading(true); 
        try { 
            const url = `https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/?sort=-createdAt&page=${pagination.page}&limit=${pagination.limit}`; 
            const res = await axios.get(url, getAuthConfig()); 
            
            if (res.data.status === 'success') { 
                setPartners(res.data.data?.data || []); 
                const exactTotal = res.data.pagination?.totalItems || 0; 
                setPagination(prev => ({ ...prev, total: exactTotal })); 
                if (onTotalUpdate) onTotalUpdate(exactTotal); 
            } 
        } catch (error) { 
            toast.error("Unable to load local partners."); 
        } finally { 
            setIsLoading(false); 
        } 
    }; 

    useEffect(() => { 
        fetchPartners(); 
    }, [pagination.page, pagination.limit]); 

    const confirmDelete = (partner) => { 
        setPartnerToDelete(partner); 
        setIsDeleteModalOpen(true); 
    }; 

    const executeDelete = async () => { 
        if (!partnerToDelete) return; 
        setIsDeleting(true); 
        try { 
            const res = await axios.delete(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/${partnerToDelete.id}`, getAuthConfig()); 
            if (res.data.status === 'success' || res.status === 200 || res.status === 204) { 
                toast.success("Partner successfully deleted."); 
                setIsDeleteModalOpen(false); 
                setPartnerToDelete(null); 
                fetchPartners(); 
            } 
        } catch (error) { 
            toast.error(error.response?.data?.message || "Failed to delete partner."); 
        } finally { 
            setIsDeleting(false); 
        } 
    }; 

    const displayData = partners.filter(item => { 
        if (!searchQuery) return true; 
        const q = searchQuery.toLowerCase(); 
        return ( 
            String(item.srName || item.name || '').toLowerCase().includes(q) || 
            String(item.territory || '').toLowerCase().includes(q) || 
            String(item.partnerType || '').toLowerCase().includes(q) 
        ); 
    }); 

    const handleDownloadCSV = () => { 
        if (!displayData.length) return toast.info("No data to download!"); 
        const csvFormatted = displayData.map(p => ({ 
            'ID': p.id, 
            'Name': p.srName || p.name, 
            'Territory': p.territoryName || '', 
            'Partner Type': p.partnerType || '', 
            'Status': p.status ? 'Active' : 'Inactive' 
        })); 
        exportToCSV(csvFormatted, `Local_Partners_Page_${pagination.page}.csv`); 
    }; 

    return ( 
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm  font-sans"> 
            
            {/* --- Controls Section --- */} 
            <div className="flex justify-between items-end md:items-center flex-wrap gap-3"> 
                {/* Search */}
                <div className="relative"> 
                    <input 
                        placeholder="Search ..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-[280px] sm:w-[330px] md:w-[430px] h-10 md:h-12 bg-[#f3f4f6] rounded-lg pl-10 pr-5 outline-none placeholder:font-sans placeholder:font-medium focus:bg-gray-200 transition-colors" 
                        type="search" 
                    /> 
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute top-3 md:top-3.5 left-3 text-gray-900" height="20" width="20">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </div> 

                {/* Download */}
                <button 
                    onClick={handleDownloadCSV} 
                    className="flex items-center gap-x-2 px-5 md:px-8 py-1.5 md:py-3 rounded-lg border border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-200 group"
                > 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24">
                        <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                    </svg>
                    <span className="group-hover:text-black text-white font-sans font-medium">Download CSV</span> 
                </button> 
            </div> 

            {/* --- Table Section --- */} 
            <div className="w-full overflow-x-auto"> 
                <table className="w-full text-left whitespace-nowrap border-collapse font-sans"> 
                    <thead> 
                        <tr className="border-b border-gray-200"> 
                            <th className="px-4 py-4 font-bold text-table-heading text-base min-w-[12rem]">Name</th> 
                            <th className="px-4 py-4 font-bold text-table-heading text-base min-w-[12rem]">Teritory</th> 
                            <th className="px-4 py-4 font-bold text-table-heading text-base min-w-[12rem]">Partner Type</th> 
                            <th className="px-4 py-4 font-bold text-table-heading text-base min-w-[12rem]">Change Status</th> 
                            <th className="px-4 py-4 font-bold text-table-heading text-base min-w-[12rem]">Action</th> 
                        </tr> 
                    </thead> 
                    
                    {/* Notice no divide-y here to keep lines removed */}
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">Loading local partners...</td></tr> 
                        ) : displayData.length > 0 ? ( 
                            displayData.map((partner) => ( 
                                <tr 
                                    key={partner.id} 
                                    onClick={() => navigate(`/sale-representative/details/${partner.id}`)} 
                                    className="hover:bg-gray-50 transition-colors text-table-text text-base cursor-pointer font-sans" 
                                > 
                                    <td className="px-4 py-5">{partner.srName || partner.name}</td> 
                                    <td className="px-4 py-5">{partner.territoryName || "—"}</td> 
                                    <td className="px-4 py-5">{partner.partnerType || "—"}</td> 
                                    <td className="px-4 py-5"> 
                                        <StatusToggleCell initialStatus={partner.status} partnerId={partner.id} /> 
                                    </td> 
                                    <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}> 
                                        <div className="flex gap-x-2"> 
                                            {/* Edit */}
                                            <button 
                                                onClick={() => navigate(`/sale-representative/edit/${partner.id}`)} 
                                                className="border border-[#86644c] rounded-md p-2 text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors" 
                                            > 
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="18" width="18"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg> 
                                            </button> 
                                            {/* Delete */}
                                            <button 
                                                onClick={() => confirmDelete(partner)} 
                                                className="border border-red-400 rounded-md p-2 text-red-400 hover:bg-red-400 hover:text-white transition-colors" 
                                            > 
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg> 
                                            </button> 
                                        </div>
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">No partners found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 

            {/* --- Shared Pagination Component --- */} 
            <TablePagination pagination={pagination} setPagination={setPagination} />

           {isDeleteModalOpen && (
  <div className="fixed inset-0 z-[9999] bg-black/40  flex items-center justify-center transition-all">
    <div className="bg-white rounded-[10px] w-[500px] shadow-2xl relative flex flex-col font-sans animate-fadeIn p-8">
      
      {/* Close "X" Button */}
      <button 
        onClick={() => {
          setIsDeleteModalOpen(false);
          setPartnerToDelete(null);
        }}
        className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Text Content */}
      <div className="text-center mt-2">
        <h2 className="text-[24px] font-semibold text-[#2d3748] mb-4">
          Delete Local Partner
        </h2>
        <p className="text-[#4a5568] text-[16px] mb-8">
          Are you sure you want to delete this Local Partner ?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setIsDeleteModalOpen(false);
            setPartnerToDelete(null);
          }}
          disabled={isDeleting}
          className="w-[130px] h-[45px] border border-[#86644c] rounded-[6px] text-[15px] font-medium text-[#86644c] bg-white hover:bg-[#faf8f6] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={executeDelete}
          disabled={isDeleting}
          className="w-[130px] h-[45px] bg-[#86644c] text-white text-[15px] font-medium rounded-[6px] hover:bg-[#735541] disabled:opacity-50 transition-colors"
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