import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  initialType,
  initialPartner,
  showEmployees = false,
  multiSelect = false,
  initialEntities
}) => {
  const [filterType, setFilterType] = useState('All');


  const [selectedEntities, setSelectedEntities] = useState([]);
  const [partnersList, setPartnersList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (response.data.status === 'success') {
          setPartnersList(response.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, []);

  useEffect(() => {
    if (!showEmployees) return;
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (response.data.status === 'success') {
          setEmployeesList(response.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, [showEmployees]);

  useEffect(() => {
    if (isOpen) {
      setFilterType(initialType || 'All');

      if (initialPartner) {
        setSelectedEntities(Array.isArray(initialPartner) ? initialPartner : [initialPartner]);
      } else if (initialEntities && initialEntities.length > 0) {

        setSelectedEntities(initialEntities);
      } else {
        setSelectedEntities([]);
      }

      setIsTypeDropdownOpen(false);
      setIsEntityDropdownOpen(false);
    }
  }, [isOpen, initialType, initialPartner, initialEntities]);

  if (!isOpen) return null;

  const handleReset = () => {
    setFilterType('All');
    setSelectedEntities([]);

    onApply('All', []);
    onClose();
   
  };

  const handleApply = () => {
    if (multiSelect) {
      onApply(filterType, selectedEntities);
    } else {
      onApply(filterType, selectedEntities[0] || null);
    }
    onClose();
  };

  const handleTypeSelect = (type) => {
    setFilterType(type);
    setIsTypeDropdownOpen(false);
    if (type !== 'Local Partner' && type !== 'Employee') {
      setSelectedEntities([]);
    }
  };

  const handleEntityToggle = (entity, e) => {
    if (e) e.stopPropagation();

    if (!multiSelect || filterType === 'Employee') {
      setSelectedEntities([entity]);
      setIsEntityDropdownOpen(false);
    } else {
      const exists = selectedEntities.find(item => item.id === entity.id);
      if (exists) {
        setSelectedEntities(selectedEntities.filter(item => item.id !== entity.id));
      } else {
        setSelectedEntities([...selectedEntities, entity]);
      }
      setIsEntityDropdownOpen(false);
    }
  };

  const typeOptions = showEmployees ? ['All', 'Admin', 'Local Partner', 'Employee'] : ['All', 'Admin', 'Local Partner'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
  <div className="relative bg-white rounded-md shadow-2xl w-full max-w-[500px] flex flex-col font-sans">

    <div className="flex items-center justify-between p-6 pb-4 ">
      <h2 className="text-[20px] font-bold text-gray-800">Filters</h2>
      <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <div className="px-6 py-4 space-y-6">

      {/* FILTER TYPE SELECTOR */}
      <div>
        <label className="block text-[14px] font-semibold text-gray-800 mb-2">Select</label>
        <div className="relative">
          <div
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="flex items-center justify-between border border-gray-300 rounded-md py-2.5 pl-3 pr-2 cursor-pointer hover:border-gray-400 transition-colors"
          >
            <span className="text-gray-800 text-base">
              {filterType === 'All' ? 'Select Filter Type' : filterType}
            </span>

            <div className="flex items-center flex-shrink-0">
              {filterType !== 'All' && (
                <>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterType('All');
                      setSelectedEntities([]);
                    }}
                    className="p-1 text-[#ccc] hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M 14.348 14.849 C 13.879 15.318 13.119 15.318 12.651 14.849 L 10 11.819 L 7.349 14.848 C 6.88 15.317 6.12 15.317 5.652 14.848 C 5.183 14.379 5.183 13.619 5.652 13.151 L 8.41 10.001 L 5.651 6.849 C 5.182 6.38 5.182 5.621 5.651 5.152 S 6.879 4.683 7.348 5.152 L 10 8.183 L 12.651 5.152 C 13.12 4.683 13.879 4.683 14.348 5.152 S 14.817 6.381 14.348 6.849 L 11.59 10.001 L 14.348 13.151 C 14.817 13.62 14.817 14.38 14.348 14.849 Z" />
                    </svg>
                  </div>
                  <span className="w-[1px] h-5 bg-[#ccc] mx-1"></span>
                </>
              )}
              <div className="p-1 text-[#3E342C]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" />
                </svg>
              </div>
            </div>
          </div>

          {isTypeDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTypeDropdownOpen(false)}></div>
              <div className="absolute top-full left-0 w-full mt-1 bg-input-brown rounded-md shadow-lg z-50">
                {typeOptions.map((option) => (
                  <div key={option} onClick={() => handleTypeSelect(option)} className="px-4 py-2.5 cursor-pointer text-white hover:bg-input-hover">
                    {option}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* LOCAL PARTNER SELECTOR */}
      {filterType === 'Local Partner' && (
        <div>
          <label className="block text-[14px] font-semibold text-gray-800 mb-2">Local Partner</label>
          <div className="relative">
            <div onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)} className="flex items-center justify-between border border-gray-300 rounded-md py-2.5 pl-3 pr-2 cursor-pointer hover:border-gray-400 min-h-[46px] transition-colors">

              {/* Selection Display */}
              <div className="flex items-center flex-wrap gap-2 flex-1">
                {selectedEntities.length > 0 ? (
                  multiSelect ? (
                    // Badges for Multi-Select
                    selectedEntities.map((partner) => (
                      <span key={partner.id} className="bg-gray-200 text-gray-800 text-[14px] px-2 py-1 rounded-sm flex items-center gap-2">
                        {partner.srName}
                        <span
                          onClick={(e) => handleEntityToggle(partner, e)}
                          className="text-gray-500 hover:text-red-500 font-bold cursor-pointer"
                        >
                          ×
                        </span>
                      </span>
                    ))
                  ) : (
                    // Plain Text for Single-Select
                    <span className="text-gray-800 text-base truncate">{selectedEntities[0].srName}</span>
                  )
                ) : (
                  <span className="text-gray-800 text-base truncate">Select Local Partner</span>
                )}
              </div>

              {/* Right-side Icons Container */}
              <div className="flex items-center flex-shrink-0 pl-2">
                {selectedEntities.length > 0 && (
                  <>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntities([]);
                      }}
                      className="p-1 text-[#ccc] hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M 14.348 14.849 C 13.879 15.318 13.119 15.318 12.651 14.849 L 10 11.819 L 7.349 14.848 C 6.88 15.317 6.12 15.317 5.652 14.848 C 5.183 14.379 5.183 13.619 5.652 13.151 L 8.41 10.001 L 5.651 6.849 C 5.182 6.38 5.182 5.621 5.651 5.152 S 6.879 4.683 7.348 5.152 L 10 8.183 L 12.651 5.152 C 13.12 4.683 13.879 4.683 14.348 5.152 S 14.817 6.381 14.348 6.849 L 11.59 10.001 L 14.348 13.151 C 14.817 13.62 14.817 14.38 14.348 14.849 Z" />
                      </svg>
                    </div>
                    <span className="w-[1px] h-5 bg-[#ccc] mx-1"></span>
                  </>
                )}
                <div className="p-1 text-[#3E342C]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" />
                  </svg>
                </div>
              </div>

            </div>

            {isEntityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsEntityDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 w-full mt-1 bg-input-brown rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {partnersList.map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => handleEntityToggle(partner)}
                      className="px-4 py-2.5 cursor-pointer text-white hover:bg-input-hover"
                    >
                      {partner.srName}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* EMPLOYEE SELECTOR */}
      {filterType === 'Employee' && (
        <div>
          <label className="block text-[14px] font-semibold text-gray-800 mb-2">Employee</label>
          <div className="relative">
            <div onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)} className="flex items-center justify-between border border-gray-300 rounded-md py-2.5 pl-3 pr-2 cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-gray-800 text-base truncate flex-1">
                {selectedEntities.length > 0 && selectedEntities[0].name ? selectedEntities[0].name : 'Select Employee'}
              </span>

              {/* Right-side Icons Container */}
              <div className="flex items-center flex-shrink-0 pl-2">
                {selectedEntities.length > 0 && (
                  <>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntities([]);
                      }}
                      className="p-1 text-[#ccc] hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M 14.348 14.849 C 13.879 15.318 13.119 15.318 12.651 14.849 L 10 11.819 L 7.349 14.848 C 6.88 15.317 6.12 15.317 5.652 14.848 C 5.183 14.379 5.183 13.619 5.652 13.151 L 8.41 10.001 L 5.651 6.849 C 5.182 6.38 5.182 5.621 5.651 5.152 S 6.879 4.683 7.348 5.152 L 10 8.183 L 12.651 5.152 C 13.12 4.683 13.879 4.683 14.348 5.152 S 14.817 6.381 14.348 6.849 L 11.59 10.001 L 14.348 13.151 C 14.817 13.62 14.817 14.38 14.348 14.849 Z" />
                      </svg>
                    </div>
                    <span className="w-[1px] h-5 bg-[#ccc] mx-1"></span>
                  </>
                )}
                <div className="p-1 text-[#3E342C]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" />
                  </svg>
                </div>
              </div>

            </div>

            {isEntityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsEntityDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 w-full mt-1 bg-input-brown rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {employeesList.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => handleEntityToggle(employee)}
                      className="px-4 py-2.5 cursor-pointer text-white hover:bg-input-hover"
                    >
                      {employee.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>

    <div className="flex justify-end gap-3 px-6 pt-4 pb-6 border-t border-gray-200">
      <button onClick={handleReset} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md">Reset</button>
      <button onClick={handleApply} className="px-4 py-2 bg-[#86644C] text-white font-medium rounded-md">Apply</button>
    </div>
  </div>
</div >
  );
};

export default FilterModal;