import React, { useEffect } from 'react';
import { StandardCustomerLayout } from '../../ComponentsTemp/CustomerOrders/StandardCustomerLayout';
import useStore from '../../Hooks/useStore';

const CustomerShippedOrders = () => {
  const setStoreTitle = useStore(state => state.setTitle);
const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);
const setStoreShowProfile = useStore(state => state.setShowProfile); // 1. Pull the profile visibility action

useEffect(() => { 
    setStoreTitle('Shipped Orders'); 
    setIsGlobalLoading(true);
    setStoreShowProfile(false); // 2. Hide profile on mount

    return () => {
        setStoreTitle('');
        setIsGlobalLoading(false);
        setStoreShowProfile(true); // 3. Show profile again when leaving the page
    };
}, [setStoreTitle, setIsGlobalLoading, setStoreShowProfile]);
    return (
        <StandardCustomerLayout 
          
            apiEndpoint="https://testingbb.trimworldwide.com/api/v1/admin/orders?statusId=5"
            detailsBaseRoute="/orders/details" 
        />
    );
};

export default CustomerShippedOrders;