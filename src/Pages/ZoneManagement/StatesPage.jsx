import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import ReactCountryFlag from 'react-country-flag';
import { SortableHeader } from '../../Components/Shared/Table/SortableHeader';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';
import { exportToCSV } from '../../utils/csvHelper';
import DeleteLocationModal from '../../Components/ZoneManagement/DeleteLocationModal'
import AddLocationModal from '../../Components/ZoneManagement/AddLocationModal'


export const StateManagement = () => {
    const { countryId } = useParams();
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const [country, setCountry] = useState(null);
    const [states, setStates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Table Search, Sort & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [stateToDelete, setStateToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Fetch Country ---
    const fetchCountry = async () => {
        try {
            const res = await axios.get(
                `https://testingbb.trimworldwide.com/api/v1/admin/address-management/country/${countryId}`,
                getAuthConfig()
            );
            if (res.data?.status === 'success') {
                setCountry(res.data.data.data);
            }
        } catch (error) {
            toast.error('Failed to load country details.');
        }
    };

    // --- Fetch States (With Pagination mapping) ---
    const fetchStates = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get(
                `https://testingbb.trimworldwide.com/api/v1/admin/address-management/state?countryInSystemId=${countryId}&limit=10000`,
                getAuthConfig()
            );
            if (res.data?.status === 'success') {
                setStates(res.data.data.data || []);
                // Grab totalItems from API pagination object
                const apiTotal = res.data.pagination?.totalItems || res.data.data.data?.length || 0;
                setPagination(prev => ({ ...prev, total: apiTotal }));
            }
        } catch (error) {
            toast.error('An error occurred while fetching states.');
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchCountry();
        fetchStates();
    }, [countryId]);

    // --- Top Navbar ---
    useEffect(() => {
        setTitle('All States');
        setShowProfile(false);
        setActions(null);
        return () => {
            setTitle('');
            setShowProfile(true);
        };
    }, [setTitle, setActions, setShowProfile]);

    // --- Filtered & Sorted Data ---
    const filteredData = useMemo(() => {
        let result = [...states];
        if (searchQuery.trim()) {
            result = result.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return result;
    }, [states, searchQuery]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key && sortConfig.direction !== 'default') {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'id') {
                    aVal = parseInt(aVal, 10);
                    bVal = parseInt(bVal, 10);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const handleSort = (key) => {
        // Only allow ID (SL) to sort
        if (key !== 'id') return;

        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = 'default';
        }
        setSortConfig({ key, direction });
    };

    // Client-side slicing
    const paginatedStates = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return sortedData.slice(start, start + pagination.limit);
    }, [sortedData, pagination.page, pagination.limit]);

    // Update total for the pagination component when searching
    useEffect(() => {
        setPagination(p => ({ ...p, total: sortedData.length, page: 1 }));
    }, [sortedData.length]);

    // --- CSV Download ---
    const handleDownloadCSV = () => {
        if (!sortedData.length) return;
        const csvData = sortedData.map((s, i) => ({
            'SL': i + 1,
            'State Name': s.name,
            'ISO Code': s.isoCode
        }));
        exportToCSV(csvData, `${country?.name || 'States'}_Data.csv`);
    };

    // --- Delete State ---
    const confirmDelete = async () => {
        if (!stateToDelete) return;
        setIsDeleting(true);
        const loadingId = toast.loading('Deleting state...');
        try {
            const res = await axios.delete(
                `https://testingbb.trimworldwide.com/api/v1/admin/address-management/state/${stateToDelete.id}`,
                getAuthConfig()
            );
            if (res.data?.status === 'success' || res.status === 200 || res.status === 204) {
                toast.update(loadingId, { render: 'State deleted successfully.', type: 'success', isLoading: false, autoClose: 2000 });
                setIsDeleteModalOpen(false);
                setStateToDelete(null);
                fetchStates();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            toast.update(loadingId, { render: error.response?.data?.message || 'Error deleting state.', type: 'error', isLoading: false, autoClose: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans p-6 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-black font-bold text-xl mb-4 hover:opacity-70 transition-opacity">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    All States
                </button>

                {/* Top Bar: Filters + Add State */}
                <div className="flex justify-end items-center gap-4 py-2 border-b border-gray-100 pb-6">
                    <div className="flex items-center bg-white border border-gray-200 rounded-md px-4 py-2 gap-2 text-gray-500 shadow-sm cursor-pointer hover:border-gray-300 transition-colors h-[42px] min-w-[120px] justify-between">
                        <span className="text-[14px]">Filters</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-[42px] px-6 bg-[#86644c] hover:bg-[#735541] text-white text-[14px] font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
                    >
                        + Add State
                    </button>
                </div>

                {/* Country Card */}
                {country && (
                    <div className="w-[280px] p-6 rounded-[12px] border border-gray-100 shadow-sm bg-whiteflex flex-col gap-4">
                        <ReactCountryFlag countryCode={country.isoCode} svg style={{ width: '40px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} title={country.isoCode} />
                        <p className="font-semibold text-lg text-black">{country.name}</p>
                    </div>
                )}

                {/* Table Container */}
                <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-6 space-y-6">

                    {/* Search + Download CSV */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 bg-[#f9fafb] border border-gray-200 rounded-lg px-4 h-[42px] w-full max-w-[320px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input type="text" placeholder="Search ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="outline-none text-[14px] text-gray-700 placeholder-gray-400 w-full bg-transparent" />
                        </div>
                        <button
                            onClick={handleDownloadCSV}
                            className="h-[42px] flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[14px] font-semibold px-6 rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" /></svg>
                            Download CSV
                        </button>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-[14px]">
                            <thead className="bg-[#f9fafb]">
                                <tr className="border-b border-gray-200">
                                    {/* ⬇️ Only SL is sortable ⬇️ */}
                                    <SortableHeader label="SL" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[100px]" align="text-left" />
                                    {/* ⬇️ Non-sortable normal headers ⬇️ */}
                                    <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">State Name</th>
                                    <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[160px]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={3} className="text-center py-12 text-gray-400 italic">Loading states...</td></tr>
                                ) : paginatedStates.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-12 text-gray-400">No states found.</td></tr>
                                ) : (
                                    paginatedStates.map((state, index) => {
                                        const globalIndex = (pagination.page - 1) * pagination.limit + index + 1;
                                        return (
                                            <tr key={state.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 text-gray-600">{globalIndex}</td>
                                                <td className="px-4 py-4 text-gray-800">{state.name}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => navigate(`/countries/${countryId}/state/${state.id}`)} className="border border-yellow-400 rounded p-1.5 text-yellow-500 hover:bg-yellow-50 transition-colors outline-none" title="View Cities">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                        <button onClick={() => { setStateToDelete(state); setIsDeleteModalOpen(true); }} className="border border-red-400 rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors outline-none" title="Delete State">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <TablePagination
                        pagination={pagination}
                        setPagination={setPagination}
                        variant='simple' />
                </div>
            </div>

            <AddLocationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                type="state"           // <-- Tell the modal it's handling States
                country={country}      // <-- Pass the country data
                onSuccess={fetchStates}
            />

            {/* Replace the giant {isDeleteModalOpen && (...)} block with this */}

            <DeleteLocationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setStateToDelete(null);
                }}
                itemToDelete={stateToDelete}
                type="state"  // <-- This tells the modal to hit the /state/ API
                onSuccess={fetchStates}
            />
        </div>
    );
};

export default StateManagement;











