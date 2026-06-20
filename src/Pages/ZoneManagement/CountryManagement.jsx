import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
import Select from 'react-select';
import { getAuthConfig } from '../../utils/orderUtils';
import ReactCountryFlag from 'react-country-flag';
import { getData } from 'country-list';

export const CountryManagement = () => {
  const navigate = useNavigate();

  const setTitle = useStore((state) => state.setTitle);
  const setActions = useStore((state) => state.setActions);
  const setShowProfile = useStore((state) => state.setShowProfile);
  const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

  const allCountries = getData();
  const countryOptions = allCountries.map(c => ({ value: c.code, label: c.name }));

  // --- State ---
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: '', isoCode: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Fetch Data ---
  const fetchCountries = async () => {
    setIsLoading(true);
    setIsGlobalLoading(true);
    try {
      const res = await axios.get(
        'https://testingbb.trimworldwide.com/api/v1/admin/address-management/country',
        getAuthConfig()
      );
      if (res.data?.status === 'success') {
        setCountries(res.data.data.data || []);
      } else {
        toast.error("Failed to fetch countries.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("An error occurred while fetching countries.");
    } finally {
      setIsLoading(false);
      setIsGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // --- Top Navbar ---
  useEffect(() => {
    setTitle('All Countries');
    setShowProfile(false);
    setActions(null);
    return () => {
      setTitle('');
      setShowProfile(true);
    };
  }, [setTitle, setActions, setShowProfile]);

  // --- Handlers ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.isoCode) {
      return toast.error("Please select a country.");
    }
    setIsSubmitting(true);
    const loadingId = toast.loading("Adding country...");
    try {
      const res = await axios.post(
        'https://testingbb.trimworldwide.com/api/v1/admin/address-management/country',
        { name: addFormData.name, isoCode: addFormData.isoCode },
        getAuthConfig()
      );
      if (res.data?.status === 'success' || res.status === 201) {
        toast.update(loadingId, {
          render: "Country added successfully!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setIsAddModalOpen(false);
        setAddFormData({ name: '', isoCode: '' });
        fetchCountries();
      } else {
        throw new Error("Failed to add");
      }
    } catch (error) {
      toast.update(loadingId, {
        render: error.response?.data?.message || "Error adding country.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!countryToDelete) return;
    setIsDeleting(true);
    const loadingId = toast.loading("Deleting country...");
    try {
      const res = await axios.delete(
        `https://testingbb.trimworldwide.com/api/v1/admin/address-management/country/${countryToDelete.id}`,
        getAuthConfig()
      );
      if (res.data?.status === 'success' || res.status === 200 || res.status === 204) {
        toast.update(loadingId, {
          render: "Country deleted successfully.",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setIsDeleteModalOpen(false);
        setCountryToDelete(null);
        fetchCountries();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.update(loadingId, {
        render: error.response?.data?.message || "Error deleting country.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 2xl:p-12 font-sans bg-[#fafafa] min-h-[calc(100vh-80px)] flex flex-col gap-6">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg font-sans font-medium text-white px-6 sm:px-10 py-2.5 sm:py-4 bg-[#8C6D4F] hover:bg-white hover:text-[#8C6D4F] border border-[#8C6D4F] duration-150 shadow-sm"
          >
            + Add Country
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-gray-500 italic">
          Loading countries...
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white border border-gray-200 rounded-lg">
          No countries found. Click "+ Add Country" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {countries.map((country) => (
            <div
              key={country.id}
              onClick={() => navigate(`/countries/${country.id}/state`)}
              className="flex flex-col justify-between p-4 space-y-6 rounded-xl border border-gray-200 shadow-sm bg-[#f7f9fc] hover:bg-[#ebebeb]  duration-150 font-sans cursor-pointer group"
            >
              <div className="flex items-center gap-x-2">
                <ReactCountryFlag
                  countryCode={country.isoCode}
                  svg
                  style={{
                    display: 'inline-block',
                    height: '1.3em',
                    width: '1.3em',
                    verticalAlign: 'middle',
                    borderRadius: '4px',
                  }}
                  title={country.isoCode}
                />
                <p
                  className="font-semibold text-xl text-gray-900   duration-150"
                  title={country.name}
                >
                  {country.name}
                </p>
              </div>

              <div className="flex justify-end items-center">
               
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCountryToDelete(country);
                    setIsDeleteModalOpen(true);
                  }}
                  className="border border-red-400 rounded-md p-2 text-red-400 hover:bg-red-50 transition-colors outline-none"
                  title="Delete Country"
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn">
            {/* Header */}
            <div className="flex items-center justify-center px-6 py-5 border-b border-gray-100 relative">
              <h2 className="text-[20px] font-semibold text-[#374151]">Add Country</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="absolute right-6 text-gray-400  transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddSubmit} className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#4b5563] mb-2">
                  Country
                </label>
                <Select
                  options={countryOptions}
                  value={countryOptions.find(opt => opt.value === addFormData.isoCode) || null}
                  onChange={(selectedOption) => {
                    setAddFormData({ name: selectedOption.label, isoCode: selectedOption.value });
                  }}
                  placeholder="Search or select a country..."
                  isSearchable={true}
                  isDisabled={isSubmitting}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '45px',
                      borderColor: state.isFocused ? '#8C6D4F' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 1px #8C6D4F' : 'none',
                      
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#eff6ff' : 'white',
                      color: '#1f2937',
                      cursor: 'pointer',
                      '&:active': { backgroundColor: '#dbeafe' },
                    }),
                  }}
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-[42px] px-6 text-[#8C6D4F] font-medium border border-[#8C6D4F] rounded-[6px]  transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !addFormData.isoCode}
                  className="h-[42px] px-8 bg-[#8C6D4F] text-white font-medium rounded-[6px]  transition-colors shadow-sm flex items-center justify-center min-w-[120px] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[8px] shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 relative">
              <h3 className="text-[20px] font-semibold text-[#374151] w-full text-center">
                Delete Country
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-[16px] text-[#4b5563] mb-2">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-800">{countryToDelete?.name}</span>?
              </p>
            </div>
            <div className="px-6 py-4 flex gap-3 justify-center border-t border-gray-100 bg-white">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-[40px] px-8 border border-[#8C6D4F] text-[#8C6D4F] text-[14px] font-medium rounded-[4px] hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="h-[40px] px-8 bg-[#8C6D4F] text-white text-[14px] font-medium rounded-[4px]  transition-colors flex items-center justify-center min-w-[140px]"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManagement;