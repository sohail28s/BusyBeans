import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import { getAuthConfig } from '../../utils/orderUtils';
import ReactCountryFlag from 'react-country-flag';
import { SortableHeader } from '../../ComponentsTemp/Shared/Table/SortableHeader';
import { TablePagination } from '../../ComponentsTemp/Shared/Table/TablePagination';
import { exportToCSV } from '../../utils/csvHelper';
import DeleteLocationModal from '../../ComponentsTemp/ZoneManagement/DeleteLocationModal';
import AddLocationModal from '../../ComponentsTemp/ZoneManagement/AddLocationModal';
import { AddTerritoryModal } from '../../ComponentsTemp/ZoneManagement/TerritoryModal';

// ── Icons ────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 576 512" fill="currentColor">
    <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// ── Territory Card ────────────────────────────────────────────────────────────
const TerritoryCard = ({ territory, onEdit, onDeleteTerritory, onDeleteCity }) => {
  const cities = territory.cityInSystems || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#86644c] flex-shrink-0" />
          <h3 className="font-semibold text-[15px] text-gray-800 truncate">{territory.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          <button
            onClick={() => onEdit(territory)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-[#86644c]/10 hover:text-[#86644c] transition-colors"
            title="Edit territory"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDeleteTerritory(territory)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-200"
            title="Delete territory"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Cities Grid */}
      {cities.length === 0 ? (
        <div className="px-5 py-6 text-center text-[13px] text-gray-400">
          No cities assigned
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cities.map(city => (
            <div
              key={city.id}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPinIcon />
                <span className="text-[13px] font-medium text-gray-700 truncate">{city.name}</span>
              </div>
              <button
                onClick={() => onDeleteCity(city)}
                className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg border border-transparent text-gray-300 group-hover:border-red-200 group-hover:text-red-400 hover:bg-red-50 transition-all ml-2"
                title="Remove city"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* City count footer */}
      <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/40">
        <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">
          {cities.length} {cities.length === 1 ? 'City' : 'Cities'}
        </span>
      </div>
    </div>
  );
};

// ── Skeleton Loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <div className="h-5 w-32 bg-gray-200 rounded-lg" />
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
    </div>
    <div className="p-4 grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 bg-gray-100 rounded-lg" />
      ))}
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd, type }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#86644c]/10 flex items-center justify-center mb-4">
      <MapPinIcon />
    </div>
    <p className="text-lg font-semibold text-gray-700 mb-1">No {type} yet</p>
    <p className="text-sm text-gray-400 mb-5">Add your first {type} to get started</p>
    <button
      onClick={onAdd}
      className="px-5 py-2 rounded-xl bg-[#86644c] text-white text-sm font-semibold hover:bg-[#6b4f31] transition-colors"
    >
      + Add {type === 'territories' ? 'Territory' : 'City'}
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const CityAndTerritoryManagement = () => {
  const { countryId, stateId } = useParams();
  const navigate = useNavigate();
  const setTitle = useStore((state) => state.setTitle);
  const setActions = useStore((state) => state.setActions);
  const setShowProfile = useStore((state) => state.setShowProfile);
  const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

  const [activeTab, setActiveTab] = useState('cities'); // 'cities' or 'territories'
  
  // Common state
  const [country, setCountry] = useState(null);
  const [stateData, setStateData] = useState(null);
  
  // Cities state
  const [cities, setCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  // Territories state
  const [territories, setTerritories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [isAddTerritoryModalOpen, setIsAddTerritoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('city');
  const [editingTerritory, setEditingTerritory] = useState(null);

  // Fetch country and state
  const fetchCountryAndState = async () => {
    try {
      const [countryRes, stateRes] = await Promise.all([
        axios.get(
          `https://testingbb.trimworldwide.com/api/v1/admin/address-management/country/${countryId}`,
          getAuthConfig()
        ),
        axios.get(
          `https://testingbb.trimworldwide.com/api/v1/admin/address-management/state/${stateId}`,
          getAuthConfig()
        ),
      ]);
      if (countryRes.data?.status === 'success') {
        setCountry(countryRes.data.data.data);
      }
      if (stateRes.data?.status === 'success') {
        setStateData(stateRes.data.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch context details", error);
      toast.error('Failed to load country/state details.');
    }
  };

  // Fetch cities
  const fetchCities = async () => {
    try {
      const res = await axios.get(
        `https://testingbb.trimworldwide.com/api/v1/admin/address-management/city?stateInSystemId=${stateId}&limit=10000`,
        getAuthConfig()
      );
      if (res.data?.status === 'success') {
        setCities(res.data.data.data || []);
        const apiTotal = res.data.pagination?.totalItems || res.data.data.data?.length || 0;
        setPagination(prev => ({ ...prev, total: apiTotal }));
      }
    } catch (error) {
      toast.error('Failed to fetch cities.');
    }
  };

  // Fetch territories
  const fetchTerritories = async () => {
    try {
      const res = await axios.get(
        `https://testingbb.trimworldwide.com/api/v1/admin/address-management/territory?stateInSystemId=${stateId}`,
        getAuthConfig()
      );
      setTerritories(res.data.data.results || []);
    } catch (error) {
      toast.error('Failed to fetch territories.');
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setIsGlobalLoading(true);
    await fetchCountryAndState();
    await Promise.all([fetchCities(), fetchTerritories()]);
    setIsLoading(false);
    setIsGlobalLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [countryId, stateId]);

  // Configure top navbar with toggle
  useEffect(() => {
    setTitle(<button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black font-bold text-xl mb-4 hover:opacity-70 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {activeTab === 'cities' ? 'All Cities' : 'All Territories'}
        </button>);

    {/* Top Bar: Action Button */}
    <div className="flex justify-end items-center gap-4 py-2 border-b border-gray-100 pb-6">
      <button
        onClick={handleAddClick}
        className="h-[42px] px-6 bg-[#86644c] hover:bg-[#735541] text-white text-[14px] font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
      >
        + Add {activeTab === 'cities' ? 'City' : 'Territory'}
      </button>
    </div>
    setShowProfile(false);
    
    setActions(
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => {
            setActiveTab('cities');
            setPagination(p => ({ ...p, page: 1 }));
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'cities' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cities
        </button>
        <button
          onClick={() => {
            setActiveTab('territories');
            setPagination(p => ({ ...p, page: 1 }));
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'territories' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Territories
        </button>
      </div>
    );
    
    return () => {
      setTitle('');
      setShowProfile(true);
      setActions(null);
    };
  }, [setTitle, setActions, setShowProfile, activeTab, stateData?.name]);

  // ── Cities Filtering & Sorting ──
  const filteredCities = useMemo(() => {
    let result = [...cities];
    if (searchQuery.trim()) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [cities, searchQuery]);

  const sortedCities = useMemo(() => {
    let sortableItems = [...filteredCities];
    if (sortConfig.key && sortConfig.direction !== 'default') {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'id') {
          aVal = parseInt(aVal, 10);
          bVal = parseInt(bVal, 10);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCities, sortConfig]);

  const paginatedCities = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return sortedCities.slice(start, start + pagination.limit);
  }, [sortedCities, pagination.page, pagination.limit]);

  useEffect(() => {
    setPagination(p => ({ ...p, total: sortedCities.length, page: 1 }));
  }, [sortedCities.length]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = 'default';
    }
    setSortConfig({ key, direction });
  };

  // ── CSV Download for Cities ──
  const handleDownloadCSV = () => {
    if (!sortedCities.length) return;
    const csvData = sortedCities.map((c, i) => ({
      'SL': i + 1,
      'City Name': c.name
    }));
    exportToCSV(csvData, `${stateData?.name || 'Cities'}_Data.csv`);
  };

  // ── Delete Handler ──
  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  // ── Add Button Handler ──
  const handleAddClick = () => {
    if (activeTab === 'cities') {
      setIsAddCityModalOpen(true);
    } else {
      setEditingTerritory(null);
      setIsAddTerritoryModalOpen(true);
    }
  };

  // ── Edit Territory Handler ──
  const handleEditTerritory = (territory) => {
    setEditingTerritory(territory);
    setIsAddTerritoryModalOpen(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans p-6 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Context Cards */}
        <div className="flex flex-wrap gap-6">
          {country && (
            <div className="w-[280px] p-6 rounded-[12px] border border-gray-100 shadow-sm bg-whiteflex flex-col gap-4">
              <ReactCountryFlag
                countryCode={country.isoCode}
                svg
                style={{ width: '40px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                title={country.isoCode}
              />
              <p className="font-semibold text-lg text-black">{country.name}</p>
            </div>
          )}
          {stateData && (
            <div className="w-[280px] p-6 rounded-[12px] border border-gray-100 shadow-sm bg-white flex flex-col gap-4 justify-end">
              <p className="font-semibold text-lg text-black">{stateData.name}</p>
            </div>
          )}
        </div>

        {/* ── CITIES VIEW ── */}
        {activeTab === 'cities' && (
          <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-6 space-y-6">
            {/* Search + Download CSV */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-[#f9fafb] border border-gray-200 rounded-lg px-4 h-[42px] w-full max-w-[320px] focus-within:border-[#86644c] focus-within:ring-1 focus-within:ring-[#86644c] transition-all">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-[14px] text-gray-700 placeholder-gray-400 w-full bg-transparent"
                />
              </div>
              <button
                onClick={handleDownloadCSV}
                className="h-[42px] flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[14px] font-semibold px-6 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 12h3l-4 4-4-4h3V8h2v4zM15 4H5v16h14V8h-4V4zm-12-1C3 2.45 3.45 2 4 2h12l5 5v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V3z" />
                </svg>
                Download CSV
              </button>
            </div>

            {/* Cities Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#f9fafb]">
                  <tr className="border-b border-gray-200 [&_th]:!text-left [&_th_div]:!justify-start">
                    <SortableHeader label="SL" sortKey="id" currentSort={sortConfig} onSort={handleSort} width="w-[100px]" align="text-left" />
                    <SortableHeader label="City Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} align="text-left" />
                    <th className="px-8 py-5 font-bold text-[#374151] text-[14px] w-[180px] border-none first:rounded-l-lg last:rounded-r-lg items-center justify-center ">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={3} className="text-center py-12 text-gray-400 italic">Loading cities...</td></tr>
                  ) : paginatedCities.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-12 text-gray-400">No cities found.</td></tr>
                  ) : (
                    paginatedCities.map((city, index) => {
                      const globalIndex = (pagination.page - 1) * pagination.limit + index + 1;
                      return (
                        <tr key={city.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-600">{globalIndex}</td>
                          <td className="px-6 py-4 text-gray-800">{city.name}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteClick(city, 'city')}
                              className="border border-red-200 rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors outline-none"
                              title="Delete City"
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination pagination={pagination} setPagination={setPagination} />
          </div>
        )}

        {/* ── TERRITORIES VIEW ── */}
        {activeTab === 'territories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {isLoading ? (
              [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            ) : territories.length === 0 ? (
              <EmptyState onAdd={handleAddClick} type="territories" />
            ) : (
              territories.map(t => (
                <TerritoryCard
                  key={t.id}
                  territory={t}
                  onEdit={handleEditTerritory}
                  onDeleteTerritory={(item) => handleDeleteClick(item, 'territory')}
                  onDeleteCity={(item) => handleDeleteClick(item, 'city')}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddLocationModal
        isOpen={isAddCityModalOpen}
        onClose={() => setIsAddCityModalOpen(false)}
        type="city"
        country={country}
        stateData={stateData}
        onSuccess={() => {
          fetchCities();
          fetchTerritories();
        }}
      />

      <AddTerritoryModal
        isOpen={isAddTerritoryModalOpen}
        onClose={() => {
          setIsAddTerritoryModalOpen(false);
          setEditingTerritory(null);
        }}
        country={country}
        stateData={stateData}
        editTerritory={editingTerritory}
        onSuccess={() => {
          fetchTerritories();
          fetchCities();
        }}
      />

      <DeleteLocationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        type={deleteType}
        onSuccess={() => {
          fetchTerritories();
          fetchCities();
        }}
      />
    </div>
  );
};

export default CityAndTerritoryManagement;