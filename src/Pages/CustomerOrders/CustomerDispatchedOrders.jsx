import React, { useEffect } from 'react';
import { StandardCustomerLayout } from '../../Components/CustomerOrders/StandardCustomerLayout';
import useStore from '../../Hooks/useStore';

const CustomerDispatchedOrders = () => {
 const setStoreTitle = useStore(state => state.setTitle);
const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);
const setStoreShowProfile = useStore(state => state.setShowProfile); 
useEffect(() => { 
    setStoreTitle('Dispatched Orders'); 
    setIsGlobalLoading(true);
    setStoreShowProfile(false);

    return () => {
        setStoreTitle('');
        setIsGlobalLoading(false);
        setStoreShowProfile(true); 
    };
}, [setStoreTitle, setIsGlobalLoading, setStoreShowProfile]);
    return (
        <StandardCustomerLayout 
          
            apiEndpoint="https://testingbb.trimworldwide.com/api/v1/admin/orders?statusId=2"
          detailsBaseRoute="/orders/details" 
        />
    );
};

export default CustomerDispatchedOrders;