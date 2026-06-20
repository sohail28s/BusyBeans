import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { exportToCSV } from '../../utils/csvHelper';
import { EmployeeCustomersTable } from '../../ComponentsTemp/EmployeeManagement/Employee/EmployeeCustomersTable';
import { UnlinkCustomerModal } from '../../ComponentsTemp/EmployeeManagement/Employee/UnlinkCustomerModal';
import { getAuthConfig } from '../../utils/orderUtils';

export const EmployeeDetails = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
        const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [employee, setEmployee] = useState(null);
    const [isEmpLoading, setIsEmpLoading] = useState(true);

    const [customers, setCustomers] = useState([]);
    const [isCustLoading, setIsCustLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });

    const [customerToUnlink, setCustomerToUnlink] = useState(null);
const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);

    useEffect(() => {
        setTitle(
            <div className="flex items-center gap-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => navigate(-1)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Employee Details
            </div>
        );
        setShowProfile(false);
        setActions(null); 
        return () => setTitle(''); setShowProfile(true);
    }, [setTitle, setActions, setShowProfile, navigate]);

    // --- Fetch Employee Info ---
    useEffect(() => {
        const fetchEmployeeData = async () => {
            setIsEmpLoading(true);
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/employee/${id}`, getAuthConfig());
                if (res.data?.status === 'success') {
                    setEmployee(res.data.data);
                } else {
                    toast.error("Failed to load employee details.");
                }
            } catch (error) {
                console.error("Employee fetch error:", error);
                toast.error("Error loading employee data.");
            } finally {
                setIsEmpLoading(false);
            }
        };

        if (id) fetchEmployeeData();
    }, [id]);

    // --- Fetch Assigned Customers ---
    const fetchCustomers = async () => {
        setIsCustLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/customer-management/customer-list/employee-id/${id}?page=${pagination.page}&limit=${pagination.limit}`, getAuthConfig());
            if (res.data?.status === 'success') {
                setCustomers(res.data.data.data || []);
                setPagination(p => ({
                    ...p,
                    totalItems: res.data.pagination.totalItems,
                    totalPages: res.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error("Customer fetch error:", error);
        } finally {
            setIsCustLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCustomers();
    }, [id, pagination.page, pagination.limit]);

    // --- Handlers ---
    const handleDownloadCSV = () => {
        if (!customers.length) return toast.info("No customers to export.");
        
        const csvFormatted = customers.map((cust, index) => ({
            "No.": ((pagination.page - 1) * pagination.limit) + (index + 1),
            "Company Name": cust.companyName || "-",
            "Main Contact": cust.name || "-",
            "Email": cust.email || "-",
            "Status": cust.status ? "Active" : "Inactive"
        }));
        
        exportToCSV(csvFormatted, `${employee?.name || 'Employee'}_Assigned_Customers.csv`);
    };

   const handleUnlink = (customer) => {
        setCustomerToUnlink(customer);
        setIsUnlinkModalOpen(true);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitefont-sans p-6 md:p-8 flex flex-col gap-6">
            
            {/* Top Employee Info Card */}
            <div className="w-full bg-white border border-[#e2e8f0] rounded-[12px] shadow-sm p-8">
                <h2 className="text-[16px] font-semibold text-[#374151] mb-6">Employee Information</h2>
                
                {isEmpLoading ? (
                    <div className="text-gray-500 italic py-4">Loading details...</div>
                ) : employee ? (
                    <div className="grid grid-cols-4 gap-8">
                        <div>
                            <p className="text-[13px] text-gray-500 mb-1">Name</p>
                            <p className="text-[15px] font-medium text-gray-900">{employee.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[13px] text-gray-500 mb-1">Email</p>
                            <p className="text-[15px] font-medium text-gray-900">{employee.email || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[13px] text-gray-500 mb-1">Phone</p>
                            <p className="text-[15px] font-medium text-gray-900">
                                {employee.countryCode ? `+${employee.countryCode} ` : ''}{employee.phoneNumber || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[13px] text-gray-500 mb-1">Commission %</p>
                            <p className="text-[15px] font-medium text-gray-900">{parseFloat(employee.commissionPercentage || 0).toFixed(2)}%</p>
                        </div>
                        <div className="col-span-4 mt-2">
                            <p className="text-[13px] text-gray-500 mb-1">Status</p>
                            {employee.status ? (
                                <span className="inline-block bg-[#86644c] text-white px-3 py-1 rounded-[6px] text-[12px] font-semibold tracking-wide">
                                    Active
                                </span>
                            ) : (
                                <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-[6px] text-[12px] font-semibold tracking-wide">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-red-500 py-4">Employee not found.</div>
                )}
            </div>

            {/* Bottom Assigned Customers Table */}
            <div className="flex-1 w-full relative">
                <EmployeeCustomersTable 
                    data={customers}
                    isLoading={isCustLoading}
                    pagination={pagination}
                    setPagination={setPagination}
                    onUnlink={handleUnlink}
                    onDownloadCSV={handleDownloadCSV}
                />


               
            </div>

             <UnlinkCustomerModal
                isOpen={isUnlinkModalOpen} 
                onClose={() => setIsUnlinkModalOpen(false)} 
                onSuccess={fetchCustomers} 
                customerData={customerToUnlink} 
            />
        </div>
    );
};

export default EmployeeDetails;


