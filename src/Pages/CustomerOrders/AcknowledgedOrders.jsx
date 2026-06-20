import React, { useState, useEffect } from 'react'; 
import { StandardCustomerLayout } from '../../Components/CustomerOrders/StandardCustomerLayout'
import useStore from '../../Hooks/useStore';

const CustomerAcknowledgedOrders = () => {
    // Access global store actions
    const setStoreTitle = useStore(state => state.setTitle);
    const setStoreShowProfile = useStore(state => state.setShowProfile);
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);

    // Set Navbar Title, Hide Profile, and trigger Loader on mount
    useEffect(() => { 
        setStoreTitle('Acknowledged Orders'); 
        setStoreShowProfile(false); 
        setIsGlobalLoading(true);

        return () => {
            setStoreTitle('');
            setStoreShowProfile(true);
            setIsGlobalLoading(false);
        };
    }, [setStoreTitle, setStoreShowProfile, setIsGlobalLoading]);

    const [selectedStatus, setSelectedStatus] = useState('3');

   

    const tableColumns = [ 
        { label: '#', key: 'id', width: 'w-[80px]' }, 
        { label: 'Company Name', key: 'companyName', width: 'w-[180px]' }, 
        { label: 'Item Price', key: 'itemsPrice', width: 'w-[120px]', format: 'currency' }, 
        { label: 'Subtotal', key: 'subTotal', width: 'w-[120px]', format: 'currency' }, 
        { label: 'Total', key: 'totalBill', width: 'w-[120px]', format: 'currency' }, 
        { label: 'Status', key: 'orderCurrentStatus', width: 'w-[140px]', format: 'status' } 
    ]; 

    return ( 
        <StandardCustomerLayout 
            apiEndpoint={`https://testingbb.trimworldwide.com/api/v1/admin/orders?statusId=${selectedStatus}`} 
            detailsBaseRoute="/orders/details" 
            columns={tableColumns} 
           
        /> 
    ); 
}; 

export default CustomerAcknowledgedOrders;