import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { AssignModal } from '../../ComponentsTemp/ClientManagement/Modals/AssignModal';
import { AddressModal } from '../../ComponentsTemp/Shared/AddressModal';
import CustomerProfileBlock from '../../ComponentsTemp/ClientManagement/Details/CustomerProfileBlock';
import AdditionalAddressesBlock from '../../ComponentsTemp/ClientManagement/Details/AdditionalAddressesBlock';
import CustomerOrdersSection from '../../ComponentsTemp/ClientManagement/Details/CustomerOrdersSection';
import CustomerSignupAnswers from '../../ComponentsTemp/ClientManagement/Details/CustomerSignupAnswers';
import DeleteCustomerModal from '../../ComponentsTemp/ClientManagement/Details/DeleteCustomerModal';
const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Global Store Actions
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    // --- STATE MANAGEMENT ---
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    
    // Search & Pagination for Orders
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 10, total: 0 });
    
    // Modal & Selection States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalTriggers, setModalTriggers] = useState({ employee: false, localPartner: false, address: false });
    const [selectedAddressData, setSelectedAddressData] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);

    // Assignment Data
    const [salesReps, setSalesReps] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isFetchingReps, setIsFetchingReps] = useState(false);
    const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // --- 1. GLOBAL HEADER SETUP ---
    useEffect(() => {
        setShowProfile(false);
        setIsGlobalLoading(true);

        const customActionsNode = (
            <div className="flex items-center gap-4 text-[13px] font-medium font-sans">
                <button onClick={() => setModalTriggers(p => ({ ...p, employee: true }))} className="text-[#3b82f6] hover:underline">Assign Employee</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setModalTriggers(p => ({ ...p, localPartner: true }))} className="text-[#3b82f6] hover:underline">Assign Local Partner</button>
                <span className="text-gray-300">|</span>
                <Link to={`/customers/edit/${id}`} className="text-[#3b82f6] hover:underline">Edit Customer</Link>
                <span className="text-gray-300">|</span>
                <button onClick={() => setShowDeleteModal(true)} className="text-[#3b82f6] hover:underline">Delete Account</button>
            </div>
        );
        setActions(customActionsNode);

        return () => {
            setTitle('');
            setActions(null);
            setShowProfile(true);
            setIsGlobalLoading(false);
        };
    }, [setTitle, setActions, navigate, id, setShowProfile, setIsGlobalLoading]);

    // --- 2. FETCH PROFILE DATA ---
    const fetchProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        setIsGlobalLoading(true);
        try {
            const profileRes = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/view-customer-detail/${id}`, getAuthConfig());
            if (profileRes.data?.status === 'success') {
                setCustomer(profileRes.data.data?.customer);
            }
        } catch (error) {
            toast.error("Failed to load customer details.");
        } finally {
            setIsLoadingProfile(false);
            setIsGlobalLoading(false);
        }
    }, [id, setIsGlobalLoading]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    useEffect(() => {
        if (!customer) return;
        const titleNode = (
            <div className="flex items-center gap-3">
                <span className="text-[22px] font-sans font-bold text-[#1f2937]">
                    Customers / <span className="font-medium text-[#86644c]">{customer.name}</span>
                </span>
                <span className={`${customer.status ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'} px-3 py-1 rounded-full text-[11px] font-bold tracking-wide`}>
                    {customer.status ? 'Active' : 'Inactive'}
                </span>
            </div>
        );
        setTitle(titleNode);
    }, [customer, setTitle]);

    // --- 3. ORDERS FETCH & DEBOUNCE ---
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedSearchQuery(searchQuery); setOrdersPagination(p => ({ ...p, page: 1 })); }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchOrders = useCallback(async () => {
        setIsGlobalLoading(true);
        try {
            let url = `https://testingbb.trimworldwide.com/api/v1/admin/orders?userid=${id}&statusId%5Bne%5D=6&type=all&page=${ordersPagination.page}&limit=${ordersPagination.limit}`;
            if (debouncedSearchQuery) url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
            
            const ordersRes = await axios.get(url, getAuthConfig());
            if (ordersRes.data?.status === 'success') {
                setOrders(ordersRes.data.data?.data || []);
                setOrdersPagination(prev => ({ ...prev, total: ordersRes.data.pagination?.totalItems || 0 }));
            }
        } catch (error) {
            toast.error("Failed to load orders.");
        } finally {
            setIsGlobalLoading(false);
        }
    }, [id, debouncedSearchQuery, ordersPagination.page, ordersPagination.limit, setIsGlobalLoading]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // --- MODAL DATA FETCHERS ---
    useEffect(() => {
        if (modalTriggers.localPartner && salesReps.length === 0) {
            const fetchReps = async () => {
                setIsFetchingReps(true);
                try {
                    const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep?page=1&limit=10000`, getAuthConfig());
                    if (res.data?.status === 'success') setSalesReps(res.data.data?.data || []);
                } finally { setIsFetchingReps(false); }
            };
            fetchReps();
        }
    }, [modalTriggers.localPartner, salesReps.length]);

    useEffect(() => {
        if (modalTriggers.employee && employees.length === 0) {
            const fetchEmployees = async () => {
                setIsFetchingEmployees(true);
                try {
                    const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/employees?page=1&limit=10000`, getAuthConfig());
                    setEmployees(res.data?.data?.data || []);
                } finally { setIsFetchingEmployees(false); }
            };
            fetchEmployees();
        }
    }, [modalTriggers.employee, employees.length]);

    // --- HANDLERS ---
    const handleAssignPartner = async (partnerId) => {
        const loadingNode = toast.loading("Assigning Local Partner...");
        setIsGlobalLoading(true);
        try {
            const payload = { id: partnerId };
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/customer-management/assign-sale-rep/remove`, payload, getAuthConfig());
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingNode, { render: "Assigned successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setModalTriggers(p => ({ ...p, localPartner: false }));
                fetchProfile();
            }
        } catch (error) {
            toast.update(loadingNode, { render: "Failed to assign.", type: "error", isLoading: false, autoClose: 3000 });
        } finally { setIsGlobalLoading(false); }
    };

    const handleAssignEmployee = async (employeeId) => {
        const loadingNode = toast.loading("Assigning Employee...");
        setIsGlobalLoading(true);
        try {
            const payload = { info: { employeeId: employeeId } };
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/customer-update/${id}`, payload, getAuthConfig());
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(loadingNode, { render: "Assigned successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setModalTriggers(p => ({ ...p, employee: false }));
                fetchProfile();
            }
        } catch (error) {
            toast.update(loadingNode, { render: "Failed to assign.", type: "error", isLoading: false, autoClose: 3000 });
        } finally { setIsGlobalLoading(false); }
    };

    const handleInvoiceReminder = async () => {
        if (selectedOrders.length === 0) return toast.warning("Select at least one order.");
        const reminderNode = toast.loading(`Sending reminders...`);
        setIsGlobalLoading(true);
        try {
            const payload = {
                order: orders.filter(o => selectedOrders.includes(o.id)).map(o => ({ orderId: o.id, reminder: false, invoiceDate: Date.now() })),
                successUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success",
                cancelUrl: "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure"
            };
            const res = await axios.post(`https://testingbb.trimworldwide.com/api/v1/admin/order-management/send-invoice`, payload, getAuthConfig());
            if (res.data?.status === 'success' || res.status === 200) {
                toast.update(reminderNode, { render: "Sent successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setSelectedOrders([]);
            }
        } catch (error) {
            toast.update(reminderNode, { render: "Failed to send.", type: "error", isLoading: false, autoClose: 3000 });
        } finally { setIsGlobalLoading(false); }
    };

    const handleDeleteCustomer = async () => {
        setIsDeleting(true);
        setIsGlobalLoading(true);
        const deleteNode = toast.loading(`Deleting customer...`);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API for safety
            toast.update(deleteNode, { render: "Account deleted.", type: "success", isLoading: false, autoClose: 3000 });
            navigate('/customers');
        } catch (error) {
            toast.update(deleteNode, { render: "Failed to delete.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setIsGlobalLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedOrders(orders.map(o => o.id));
        else setSelectedOrders([]);
    };

    const handleSelectOne = (orderId) => {
        setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    if (isLoadingProfile || !customer) return null;

    return (
     <div className="w-full mx-auto my-10 min-h-[calc(100vh-100px)] bg-white p-6 lg:p-8 font-sans flex flex-col gap-8 relative shadow-lg border-2 border-gray-100 max-w-6xl">
            <CustomerProfileBlock customer={customer} />
            <AdditionalAddressesBlock 
                addresses={customer.addresses}
                onAddClick={() => { setSelectedAddressData(null); setModalTriggers(p => ({ ...p, address: true })); }}
                onEditClick={(addr) => { setSelectedAddressData(addr); setModalTriggers(p => ({ ...p, address: true })); }}
                onInvoiceReminderClick={handleInvoiceReminder}
            />

            {/* 3. Orders Table */}
            <CustomerOrdersSection 
                orders={orders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedOrders={selectedOrders}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                pagination={ordersPagination}
                setPagination={setOrdersPagination}
                // onInvoiceReminderClick={handleInvoiceReminder}
                
            />

            {/* 4. Signup Answers */}
            <CustomerSignupAnswers email={customer.emailToSendInvoices} />

           

            {/* --- MODALS --- */}
            <AssignModal isOpen={modalTriggers.localPartner} onClose={() => setModalTriggers(p => ({ ...p, localPartner: false }))} title="Assign Local Partner" type="partner" variant="simple" data={salesReps} isLoading={isFetchingReps} onAssign={handleAssignPartner} />
            <AssignModal isOpen={modalTriggers.employee} onClose={() => setModalTriggers(p => ({ ...p, employee: false }))} title="Assign Employee" type="employee" variant="simple" data={employees} isLoading={isFetchingEmployees} onAssign={handleAssignEmployee} />
            <AddressModal isOpen={modalTriggers.address} onClose={() => setModalTriggers(p => ({ ...p, address: false }))} customerId={id} onSuccess={fetchProfile} initialData={selectedAddressData} />
            
            <DeleteCustomerModal
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onDelete={handleDeleteCustomer} 
                isDeleting={isDeleting} 
                customerName={customer.name} 
            />
        </div>
    );
};

export default CustomerDetails;



