import React, { useState, useEffect } from 'react';
import { TablePagination } from '../../Components/Shared/Table/TablePagination';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../utils/orderUtils';

const API_BASE = 'https://testingbb.trimworldwide.com/api/v1/admin/address-management/city';

export const AddTerritoryModal = ({
  isOpen,
  onClose,
  country,
  stateData,
  editTerritory = null,
  onSuccess,
}) => {
  const [territoryName, setTerritoryName] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const isEdit = !!editTerritory;

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    if (isEdit && editTerritory) {
      setTerritoryName(editTerritory.name || '');
      // Pre-select existing cities from the territory
      const existingCityIds = editTerritory.cityInSystems?.map(city => city.id) || [];
      setSelectedIds(new Set(existingCityIds));
    } else {
      setTerritoryName('');
      setSelectedIds(new Set());
    }
    setSearch('');
    setDebouncedSearch('');
    setPagination({ page: 1, limit: 10, total: 0 });
    setError(null);
  }, [isOpen, editTerritory]);

  // Fetch cities from API - only cities with territoryId === null
  useEffect(() => {
    if (!isOpen || !stateData?.id) return;

    const controller = new AbortController();

    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          stateInSystemId: stateData.id,
          page: pagination.page,
          limit: pagination.limit,
        });
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const res = await axios.get(`${API_BASE}?${params.toString()}`, getAuthConfig());
        
        const allCities = res.data?.data?.data ?? [];
        const totalItems = res.data?.pagination?.totalItems ?? allCities.length;
        
        // Filter cities: only show those with territoryId === null
        let filteredCities = allCities.filter(city => city.territoryId === null);
        
        // For edit mode, also include cities that belong to this territory
        if (isEdit && editTerritory) {
          const territoryCityIds = new Set(editTerritory.cityInSystems?.map(c => c.id) || []);
          const territoryCities = allCities.filter(city => territoryCityIds.has(city.id));
          // Merge and remove duplicates
          const mergedCities = [...filteredCities];
          territoryCities.forEach(city => {
            if (!mergedCities.some(c => c.id === city.id)) {
              mergedCities.push(city);
            }
          });
          filteredCities = mergedCities;
        }
        
        // Calculate SL number
        let sl = (pagination.page - 1) * pagination.limit;
        const withSL = filteredCities.map(city => {
          sl++;
          return { ...city, calculatedSL: sl };
        });

        setCities(withSL);
        setPagination(p => ({ ...p, total: totalItems }));
      } catch (err) {
        if (err.name !== 'AbortError') setError('Failed to load cities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
    return () => controller.abort();
  }, [isOpen, stateData?.id, pagination.page, pagination.limit, debouncedSearch, isEdit, editTerritory]);

  const toggleCity = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pageIds = cities.map(c => c.id);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const pageAllSelected = cities.length > 0 && cities.every(c => selectedIds.has(c.id));
  const pagePartialSelected = cities.some(c => selectedIds.has(c.id)) && !pageAllSelected;

  const handleSubmit = async () => {
    if (!territoryName.trim()) {
      toast.error("Please enter territory name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEdit) {
        // For edit: Send single PATCH request to update both name and cities
        const payload = {
          name: territoryName,
          cities: Array.from(selectedIds)
        };
        
        await axios.patch(
          `https://testingbb.trimworldwide.com/api/v1/admin/address-management/territory/${editTerritory.id}`,
          payload,
          getAuthConfig()
        );
        
        toast.success("Territory updated successfully!");
      } else {
        // Create new territory
        const payload = {
          name: territoryName,
          countryInSystemId: country?.id || stateData?.countryInSystemId,
          stateInSystemId: stateData?.id,
          cities: Array.from(selectedIds)
        };
        
        await axios.post(
          'https://testingbb.trimworldwide.com/api/v1/admin/address-management/territory',
          payload,
          getAuthConfig()
        );
        
        toast.success("Territory created successfully!");
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving territory:", error);
      toast.error(error.response?.data?.message || "Error saving territory");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-800">
            {isEdit ? 'Edit Territory' : 'Add Territory'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">
              Territory Name
            </label>
            <input
              type="text"
              value={territoryName}
              onChange={e => setTerritoryName(e.target.value)}
              placeholder="Enter Territory name"
              className="w-full h-[40px] px-3 border border-gray-200 rounded-lg text-[14px] text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#86644c]/30 focus:border-[#86644c] transition-all"
            />
          </div>

          {/* Table Card */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">

            {/* Search */}
            <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-[34px]">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-gray-400 flex-shrink-0">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search cities..."
                  className="flex-1 text-[13px] text-gray-600 placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="w-10 px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={pageAllSelected}
                        ref={el => { if (el) el.indeterminate = pagePartialSelected; }}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-[#86644c] cursor-pointer accent-[#86644c]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                      SL
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      City Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-[13px] text-gray-400">
                          <svg className="animate-spin w-4 h-4 text-[#86644c]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Loading cities...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-[13px] text-red-400">
                        {error}
                      </td>
                    </tr>
                  ) : cities.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-[13px] text-gray-400">
                        No cities available
                      </td>
                    </tr>
                  ) : (
                    cities.map(city => (
                      <tr
                        key={city.id}
                        onClick={() => toggleCity(city.id)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${
                          selectedIds.has(city.id) ? 'bg-[#86644c]/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="w-10 px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(city.id)}
                            onChange={() => toggleCity(city.id)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 text-[#86644c] cursor-pointer accent-[#86644c]"
                          />
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {city.calculatedSL}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700 font-medium">
                          {city.name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
               </table>
            </div>

            {/* Pagination */}
            <div className="px-4 pb-3">
              <TablePagination
                pagination={pagination}
                setPagination={setPagination}
                limitOptions={[10, 25, 50, 100]}
                variant='simple'
              />
            </div>
          </div>

          {/* Selection count badge */}
          {selectedIds.size > 0 && (
            <p className="mt-2.5 text-[12px] text-[#86644c] font-medium">
              {selectedIds.size} {selectedIds.size === 1 ? 'city' : 'cities'} selected
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!territoryName.trim() || isSubmitting}
            className="px-5 py-2 rounded-lg bg-[#7c5c3a] hover:bg-[#6b4f31] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Territory' : 'Add Territory')}
          </button>
        </div>
      </div>
    </div>
  );
};