import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { exportToCSV } from '../../utils/csvHelper';
import { useNavigate } from 'react-router-dom';
import {TablePagination} from '../../Components/Shared/Table/TablePagination'; 

const StatusToggleCell = ({ initialStatus, supplierId }) => {
    const [isToggled, setIsToggled] = useState(initialStatus);
    const [isChanging, setIsChanging] = useState(false);

    const handleToggle = async (e) => {
        e.stopPropagation();
        if (isChanging) return;
        
        const nextStatus = !isToggled;
        setIsChanging(true);
        
        try {
            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/supplier/${supplierId}`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );
            
            if (res.data === nextStatus || res.status === 200) {
                setIsToggled(nextStatus);
                toast.success(`Supplier marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
            }
        } catch (error) {
            console.error("Failed to change supplier status:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Badge styled like reference image */}
            <span className={`px-3 py-1 rounded-[4px] text-[12px] font-medium w-max text-center ${
                isToggled 
                    ? 'bg-[#86644c] text-white' 
                    : 'bg-[#fef2f2] text-red-400'
            }`}>
                {isToggled ? 'Active' : 'Inactive'}
            </span>

            {/* Smooth Animated Toggle */}
            <button
                type="button"
                disabled={isChanging}
                onClick={handleToggle}
                className={`relative inline-flex h-[22px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    isToggled ? 'bg-[#86644c]' : 'bg-gray-400'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
                        isToggled ? 'translate-x-[22px]' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
};

// export const SupplierTable = ({ onTotalUpdate , onFetchComplete }) => {

//     const [suppliers, setSuppliers] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 }); 
//     const navigate = useNavigate();

//     const fetchSuppliers = async () => {
//         setIsLoading(true);
//         try {
//             const url = `https://testingbb.trimworldwide.com/api/v1/admin/supplier/?sort=-createdAt&page=${pagination.page}&limit=${pagination.limit}`;
//             const res = await axios.get(url, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
//             });
//             if (res.data.status === 'success') {
//                 setSuppliers(res.data.data?.data || []);
//                 const exactTotal = res.data.pagination?.totalItems || 0;
//                 setPagination(prev => ({ ...prev, total: exactTotal }));
                
//                 if (onTotalUpdate) onTotalUpdate(exactTotal);
//             }
//         } catch (error) {
//             console.error("Failed to fetch suppliers:", error);
//             toast.error("Unable to load suppliers.");
//         } finally {
//             setIsLoading(false);
//             if (onFetchComplete) onFetchComplete();
//         }
//     };

//     useEffect(() => {
//         fetchSuppliers();
//     }, [pagination.page, pagination.limit]);

//     // --- Search Logic ---
//     const displayData = suppliers.filter(item => {
//         if (!searchQuery) return true;
//         const broadAddress = `${item.addressOne || ''} ${item.city || ''}`.toLowerCase();
//         const combinedPhone = `${item.countryCode || ''}${item.phoneNum || ''}`.toLowerCase();
//         const q = searchQuery.toLowerCase();
//         return (
//             String(item.supplierName || '').toLowerCase().includes(q) ||
//             String(item.email || '').toLowerCase().includes(q) ||
//             broadAddress.includes(q) ||
//             combinedPhone.includes(q)
//         );
//     });

//     const formatAddress = (order) => {
//         const combined = [order.addressOne, order.city, order.state, order.zipCode, order.country]
//             .filter(part => part !== null && part !== undefined && part !== '')
//             .join(', ');
//         return combined || "—";
//     };

//     const handleDownloadCSV = () => {
//         if (!displayData.length) return toast.info("No data to download!");
//         const csvFormatted = displayData.map(order => ({
//             'Supplier Name': order.supplierName,
//             'Email': order.email,
//             'Address': formatAddress(order),
//             'Phone Number': `${order.countryCode || ''}${order.phoneNum}`,
//             'Status': order.status ? 'Active' : 'Inactive'
//         }));
//         exportToCSV(csvFormatted, `Supplier_Management_Page_${pagination.page}.csv`);
//     };

//     // --- Pagination Math ---
//     const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
//     const startItem = pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1;
//     const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

//     return (
//         <div className="bg-white w-full  border border-gray-100 rounded-[12px] shadow-sm p-6 flex flex-col font-sans">
            
//             {/* Search Bar & Download Row */}
//             <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
//                 <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] rounded-[8px] overflow-hidden">
//                     <div className="pl-4 pr-2 text-gray-500">
//                         <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
//                     </div>
//                     <input 
//                         type="search" 
//                         placeholder="Search ..." 
//                         value={searchQuery} 
//                         onChange={(e) => setSearchQuery(e.target.value)} 
//                         className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3 placeholder-gray-400" 
//                     />
//                 </div>
                
//                 <button 
//                     onClick={handleDownloadCSV} 
//                     className="h-[45px] px-5 flex items-center gap-2 bg-black text-white text-[14px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
//                 >
//                     <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg>
//                     Download CSV
//                 </button>
//             </div>

//             {/* Table (Strict width formatting to prevent x-scroll and allow address wrapping) */}
//             <div className="w-full rounded-t-[8px] overflow-hidden">
//                 <table className="w-full text-left table-fixed border-collapse">
//                     <thead className="bg-[#f9fafb]">
//                         <tr>
//                             <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[18%]">supplierName</th>
//                             <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[20%]">email</th>
//                             <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[30%]">Address</th>
//                             <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[17%]">phoneNum</th>
//                             <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[15%]">Change Status</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {isLoading ? (
//                             <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">Loading suppliers...</td></tr>
//                         ) : displayData.length > 0 ? (
//                             displayData.map((order) => (
//                                 <tr 
//                                     key={order.id} 
//                                     onClick={() => navigate(`/suppliers/details/${order.id}`)}
//                                     className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[14px] cursor-pointer"
//                                 >
//                                     <td className="px-4 py-5">{order.supplierName}</td>
//                                     <td className="px-4 py-5 truncate" title={order.email}>{order.email}</td>
//                                     <td className="px-4 py-5 pr-8 whitespace-normal break-words leading-relaxed text-gray-500">
//                                         {formatAddress(order)}
//                                     </td>
//                                     <td className="px-4 py-5 text-gray-500">{`${order.countryCode || ''}${order.phoneNum}`}</td>
//                                     <td className="px-4 py-5">
//                                         <StatusToggleCell initialStatus={order.status} supplierId={order.id} />
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">No suppliers found.</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Shared Pagination Component */}
//             <TablePagination 
//                 pagination={pagination} 
//                 setPagination={setPagination} 
//                 totalPages={totalPages} 
//                 startItem={startItem} 
//                 endItem={endItem} 
//             />
//         </div>
//     );
// };









export const SupplierTable = ({ onTotalUpdate, onFetchComplete }) => { 
    const [suppliers, setSuppliers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 }); 
    const navigate = useNavigate(); 
    
    const fetchSuppliers = async () => { 
        setIsLoading(true); 
        try { 
            const url = `https://testingbb.trimworldwide.com/api/v1/admin/supplier/?sort=-createdAt&page=${pagination.page}&limit=${pagination.limit}`; 
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
            
            if (res.data.status === 'success') { 
                setSuppliers(res.data.data?.data || []); 
                const exactTotal = res.data.pagination?.totalItems || 0; 
                setPagination(prev => ({ ...prev, total: exactTotal })); 
                if (onTotalUpdate) onTotalUpdate(exactTotal); 
            } 
        } catch (error) { 
            console.error("Failed to fetch suppliers:", error); 
            toast.error("Unable to load suppliers."); 
        } finally { 
            setIsLoading(false); 
            if (onFetchComplete) onFetchComplete(); 
        } 
    }; 
    
    useEffect(() => { 
        fetchSuppliers(); 
    }, [pagination.page, pagination.limit]); 
    
    // --- Search Logic --- 
    const displayData = suppliers.filter(item => { 
        if (!searchQuery) return true; 
        const broadAddress = `${item.addressOne || ''} ${item.city || ''}`.toLowerCase(); 
        const combinedPhone = `${item.countryCode || ''}${item.phoneNum || ''}`.toLowerCase(); 
        const q = searchQuery.toLowerCase(); 
        return ( 
            String(item.supplierName || '').toLowerCase().includes(q) || 
            String(item.email || '').toLowerCase().includes(q) || 
            broadAddress.includes(q) || 
            combinedPhone.includes(q) 
        ); 
    }); 
    
    const formatAddress = (order) => { 
        const combined = [order.addressOne, order.city, order.state, order.zipCode, order.country] 
            .filter(part => part !== null && part !== undefined && part !== '') 
            .join(', '); 
        return combined || "—"; 
    }; 
    
    const handleDownloadCSV = () => { 
        if (!displayData.length) return toast.info("No data to download!"); 
        const csvFormatted = displayData.map(order => ({ 
            'Supplier Name': order.supplierName, 
            'Email': order.email, 
            'Address': formatAddress(order), 
            'Phone Number': `${order.countryCode || ''}${order.phoneNum}`, 
            'Status': order.status ? 'Active' : 'Inactive' 
        })); 
        exportToCSV(csvFormatted, `Supplier_Management_Page_${pagination.page}.csv`); 
    }; 
    
    // --- Pagination Math --- 
    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit)); 
    const startItem = pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1; 
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total); 
    
    return ( 
        <div className="bg-white w-full border border-gray-100 rounded-[12px] shadow-sm p-6 flex flex-col font-sans"> 
            
            {/* Search Bar & Download Row */} 
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4"> 
                <div className="relative flex items-center w-[350px] h-[45px] bg-[#f9fafb] rounded-[8px] overflow-hidden"> 
                    <div className="pl-4 pr-2 text-gray-500"> 
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg> 
                    </div> 
                    <input type="search" placeholder="Search ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3 placeholder-gray-400" /> 
                </div> 
                <button onClick={handleDownloadCSV} className="h-[45px] px-5 flex items-center gap-2 bg-black text-white text-[14px] font-semibold rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap" > 
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg> 
                    Download CSV 
                </button> 
            </div> 
            
            {/* Table (Added overflow-x-auto and min-w-[900px] to enable horizontal scrolling on small screens) */} 
            <div className="w-full rounded-t-[8px] overflow-x-auto"> 
                <table className="w-full text-left table-fixed border-collapse min-w-[900px]"> 
                    <thead className="bg-[#f9fafb]"> 
                        <tr> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[18%]">supplierName</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[20%]">email</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[30%]">Address</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[17%]">phoneNum</th> 
                            <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[15%]">Change Status</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        {isLoading ? ( 
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">Loading suppliers...</td></tr> 
                        ) : displayData.length > 0 ? ( 
                            displayData.map((order) => ( 
                                <tr key={order.id} onClick={() => navigate(`/suppliers/details/${order.id}`)} className="hover:bg-gray-50 transition-colors text-[#4b5563] text-[14px] cursor-pointer" > 
                                    <td className="px-4 py-5">{order.supplierName}</td> 
                                    <td className="px-4 py-5 truncate" title={order.email}>{order.email}</td> 
                                    <td className="px-4 py-5 pr-8 whitespace-normal break-words leading-relaxed text-gray-500"> 
                                        {formatAddress(order)} 
                                    </td> 
                                    <td className="px-4 py-5 text-gray-500">{`${order.countryCode || ''}${order.phoneNum}`}</td> 
                                    <td className="px-4 py-5"> 
                                        <StatusToggleCell initialStatus={order.status} supplierId={order.id} /> 
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">No suppliers found.</td></tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 
            
            {/* Shared Pagination Component */} 
            <TablePagination pagination={pagination} setPagination={setPagination} totalPages={totalPages} startItem={startItem} endItem={endItem} /> 
        </div> 
    ); 
};