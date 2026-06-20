import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader';
import { EmployeeTable } from '../../ComponentsTemp/EmployeeManagement/Employee/EmployeeTable';
import { AddEditEmployeeModal } from '../../ComponentsTemp/EmployeeManagement/Employee/AddEditEmployeeModal';
import { UpdateCommissionModal } from '../../ComponentsTemp/EmployeeManagement/Employee/UpdateCommissionModal';
import { DeleteEmployeeModal } from '../../ComponentsTemp/EmployeeManagement/Employee/DeleteEmployeeModal';
import { getAuthConfig } from '../../utils/orderUtils';


// Custom Dropdown for Partner Selection
const PartnerFilterDropdown = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = value === null
        ? "All (Admin employees)"
        : options.find(opt => opt.id === value)?.name || "Unknown Partner";

    return (
        <div className="relative w-[320px] font-sans" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[45px] px-4 bg-white border border-[#e5e7eb] rounded-[6px] flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
            >
                <span className="text-[14px] text-gray-700 truncate font-medium">{selectedLabel}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#e5e7eb] rounded-[6px] shadow-lg z-[50] py-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div
                        onClick={() => { onChange(null); setIsOpen(false); }}
                        className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-gray-50 ${value === null ? 'bg-blue-50 text-[#8C6D4F] font-semibold' : 'text-gray-700'}`}
                    >
                        All (Admin employees)
                    </div>
                    {options.map(partner => (
                        <div
                            key={partner.id}
                            onClick={() => { onChange(partner.id); setIsOpen(false); }}
                            className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-gray-50 truncate ${value === partner.id ? 'bg-blue-50 text-[#8C6D4F] font-semibold' : 'text-gray-700'}`}
                            title={partner.name}
                        >
                            {partner.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const EmployeeManagement = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    

    // --- State ---
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [selectedPartnerId, setSelectedPartnerId] = useState(null); // null = Admin
    const [localPartners, setLocalPartners] = useState([]);

    // Modal States
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToManage, setEmployeeToManage] = useState(null);

    // --- Top Navbar Configuration ---
    useEffect(() => {
        setTitle('All Employees');
        setShowProfile(false);
        setActions(
            <button
                onClick={() => { setEmployeeToManage(null); setIsProfileModalOpen(true); }}
                className="text-[14px] text-gray-800 font-medium hover:text-black transition-colors"
            >
                New Employee
            </button>
        );
        return () => { setTitle(''); setActions(null);setShowProfile(true) };
    }, [setTitle, setActions , setShowProfile]);

    // --- Fetch Partners for Dropdown ---
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep?limit=10000', getAuthConfig());
                if (res.data?.status === 'success') {
                    // Format specifically to: Name (Territory)
                    const formattedPartners = (res.data.data.data || []).map(p => ({
                        id: p.id,
                        name: `${p.srName || 'Unnamed'} ${p.territoryName ? `(${p.territoryName})` : ''}`
                    }));
                    setLocalPartners(formattedPartners);
                }
            } catch (error) {
                console.error("Failed to load partners dropdown:", error);
            }
        };
        fetchPartners();
    }, []);

    // --- Fetch Table Data ---
    const fetchEmployees = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            let apiUrl = 'https://testingbb.trimworldwide.com/api/v1/admin/employees?limit=10000';
            if (selectedPartnerId !== null) {
                apiUrl += `&salesRepId=${selectedPartnerId}`;
            }

            const res = await axios.get(apiUrl, getAuthConfig());
            if (res.data?.status === 'success') {
                setEmployees(res.data.data.data || []);
            } else {
                toast.error("Failed to fetch employees.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching employees.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [selectedPartnerId]);

    // --- Handlers ---
    const handleStatusToggle = async (emp) => {
        const loadingId = toast.loading("Updating status...");
        try {
            const res = await axios.patch(
                `https://testingbb.trimworldwide.com/api/v1/admin/employee/${emp.id}`,
                { status: !emp.status },
                getAuthConfig()
            );

            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingId, { render: "Status updated.", type: "success", isLoading: false, autoClose: 2000 });
                setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: !emp.status } : e));
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            toast.update(loadingId, { render: "Failed to update status.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDownloadCSV = () => {
        if (!employees.length) return toast.info("No employees to export.");

        const csvFormatted = employees.map(emp => ({
            "Name": emp.name || "-",
            "Email": emp.email || "-",
            "Phone Number": `${emp.countryCode ? '+' + emp.countryCode + ' ' : ''}${emp.phoneNumber || '-'}`,
            "Commission %": `${parseFloat(emp.commissionPercentage || 0).toFixed(2)}%`,
            "Status": emp.status ? "Active" : "Inactive",
        }));

        exportToCSV(csvFormatted, `Employees_${selectedPartnerId ? 'Partner_' + selectedPartnerId : 'Admin'}.csv`);
    };

    // Modal Trigger Wrappers
    const openEditProfileModal = (emp) => {
        setEmployeeToManage(emp);
        setIsProfileModalOpen(true);
       
    };

    const openEditCommissionModal = (emp) => {
        setEmployeeToManage(emp);
        setIsCommissionModalOpen(true);
       
    };

    const openDeleteModal = (emp) => {
        setEmployeeToManage(emp);
        setIsDeleteModalOpen(true);
      
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans flex flex-col gap-6">

            <div className="flex justify-between items-start w-full flex-wrap space-y-0 space-x-4 md:space-x-0">
                <div className="w-[300px] mx-5 mt-2 mb-1 md:mx-0 md:my-0">
                    <PageStatsHeader
                        cardTitle="Total Employees"
                        totalValue={isLoading ? '...' : employees.length}
                    />
                </div>
                <div className="flex flex-col items-end pt-2">
                    <PartnerFilterDropdown
                        value={selectedPartnerId}
                        onChange={setSelectedPartnerId}
                        options={localPartners}
                    />
                </div>
            </div>
            <div className="flex-1 w-full mt-2 relative">
                <EmployeeTable
                    data={employees}
                    isLoading={isLoading}
                    onStatusToggle={handleStatusToggle}
                    onEditProfile={openEditProfileModal}
                    onEditCommission={openEditCommissionModal}
                    onDelete={openDeleteModal}
                    onDownloadCSV={handleDownloadCSV}
                />

            </div>
            <AddEditEmployeeModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSuccess={fetchEmployees}
                employeeData={employeeToManage}
            />

            <UpdateCommissionModal
                isOpen={isCommissionModalOpen}
                onClose={() => setIsCommissionModalOpen(false)}
                onSuccess={fetchEmployees}
                employeeData={employeeToManage}
            />

            <DeleteEmployeeModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={fetchEmployees}
                employeeData={employeeToManage}
            />

        </div>
    );
};

export default EmployeeManagement;