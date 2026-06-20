import React, { useEffect, useState } from 'react';
import { StandardCustomerLayout } from '../../Components/CustomerOrders/StandardCustomerLayout';
import { CustomerFilterModal } from '../../Components/CustomerOrders/CustomerFilterModal';
import useStore from '../../Hooks/useStore';

const AllCustomerOrders = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setStoreShowProfile = useStore(state => state.setShowProfile); 

    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [advancedFilters, setAdvancedFilters] = useState({
        invoice: '',
        employee: '',
        employeeName: '',
        partnerId: '',
        partnerName: ''
    });
    useEffect(() => {
        setTitle('Orders');
            setStoreShowProfile(false);
        setActions(
            <button onClick={() => setFilterModalOpen(true)} className="flex items-center gap-2 px-4 h-[40px] bg-brand-brown-hover text-white rounded-[6px] text-[14px] font-medium hover:bg-[#8f6e56] transition-colors">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path></svg>
                Filters
            </button>
        );
        return () => { setTitle(''); setActions(null);  setStoreShowProfile(true);  };
    }, [setActions, setTitle , setStoreShowProfile]); 
    const hasAdvancedFilters = advancedFilters.invoice || advancedFilters.employee || advancedFilters.partnerId;

    const clearAdvancedFilters = () => {
        setAdvancedFilters({ invoice: '', employee: '', employeeName: '', partnerId: '', partnerName: '' });
    };

    const topHeaderUI = (
        <div className="flex flex-col gap-4 mb-2">
            <div className="flex border-[1px] border-[#e5e7eb] rounded-[4px] overflow-hidden font-sans text-[14px] w-fit bg-white shadow-sm">
                <button onClick={() => setPaymentFilter('all')} className={`px-8 h-[45px] font-medium transition-colors ${ paymentFilter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-800 hover:bg-gray-50' }`}>All Orders</button>
                <button onClick={() => setPaymentFilter('paid')} className={`px-8 h-[45px] font-medium border-l-[1px] border-[#e5e7eb] transition-colors ${ paymentFilter === 'paid' ? 'bg-black text-white' : 'bg-white text-gray-800 hover:bg-gray-50' }`}>Paid Orders</button>
                <button onClick={() => setPaymentFilter('unpaid')} className={`px-8 h-[45px] font-medium border-l-[1px] border-[#e5e7eb] transition-colors ${ paymentFilter === 'unpaid' ? 'bg-black text-white' : 'bg-white text-gray-800 hover:bg-gray-50' }`}>Unpaid Orders</button>
            </div>
            {hasAdvancedFilters && (
                <div className="flex items-center gap-3 font-sans text-[13px] animate-fade-in-up">
                    <span className="text-gray-500 font-medium">Applied Filters:</span>
                    {advancedFilters.invoice && (
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full flex items-center gap-2">
                            <span>Invoice: <span className="font-semibold capitalize">{advancedFilters.invoice.replace('-', ' ')}</span></span>
                        </div>
                    )}
                    {advancedFilters.employeeName && (
                        <div className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full flex items-center gap-2">
                            <span>Employee: <span className="font-semibold">{advancedFilters.employeeName}</span></span>
                        </div>
                    )}
                    {advancedFilters.partnerName && (
                        <div className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full flex items-center gap-2">
                            <span>Partner: <span className="font-semibold">{advancedFilters.partnerName}</span></span>
                        </div>
                    )}
                    <button onClick={clearAdvancedFilters} className="ml-2 text-red-500 hover:text-red-700 hover:underline font-medium">
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );

    const tableColumns = [
        { label: '#', key: 'id', width: 'w-[100px]' },
        { label: 'Company Name', key: 'companyName', width: 'w-[180px]' },
        { label: 'Order Type', key: 'type', width: 'w-[140px]', format: 'orderType' },
        { label: 'Order Date', key: 'createdAt', width: 'w-[140px]', format: 'date' },
        { label: 'Deliver On', key: 'deliveredOn', width: 'w-[140px]', format: 'date' },
        { label: 'Total', key: 'totalBill', width: 'w-[120px]', format: 'currency' },
        { label: 'Invoice', key: 'paymentStatus', width: 'w-[120px]', format: 'invoice' }
    ];
    let apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/orders?`;
    
    if (advancedFilters.employee) apiUrl += `employee=${advancedFilters.employee}&`; 
    if (advancedFilters.partnerId) apiUrl += `salesRepId=${advancedFilters.partnerId}&`;
    if (advancedFilters.invoice === 'sent') apiUrl += `invoiceDate%5Bne%5D=null&`;
    else if (advancedFilters.invoice === 'not-sent') apiUrl += `invoiceDate%5Beq%5D=null&`;

    return (
        <>
            <StandardCustomerLayout 
                apiEndpoint={apiUrl} 
                detailsBaseRoute="/orders/details"
                columns={tableColumns}
                pageHeaderContent={topHeaderUI}
                clientFilters={{ paymentStatus: paymentFilter }} 
            />

            <CustomerFilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={(filters) => setAdvancedFilters(filters)}
            />
        </>
    );
};

export default AllCustomerOrders;