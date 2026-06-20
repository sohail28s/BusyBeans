import React, { useEffect } from 'react'; 
import useStore from '../../../Hooks/useStore'; 
import { SupplierCustomerOrderLayout } from '../../../ComponentsTemp/SupplierUser/SupplierCustomerOrderLayout';

const SupplierCustomerAcknowledgedOrders = () => { 
    const setStoreTitle = useStore(state => state.setTitle); 
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading); 
    const userId = useStore(state => state.userId); // Get supplier ID
    
    useEffect(() => { 
        setStoreTitle('New Customer Orders'); 
        setIsGlobalLoading(true); 
        return () => { 
            setStoreTitle(''); 
            setIsGlobalLoading(false); 
        }; 
    }, [setStoreTitle, setIsGlobalLoading]); 

    if (!userId) return null; // Prevents fetching if ID isn't ready

    return ( 
        <SupplierCustomerOrderLayout
            apiEndpoint={`https://testingbb.trimworldwide.com/api/v1/admin/orders?supplierId=${userId}&statusId=3`} 
            detailsBaseRoute="/supplier/order-detail/" 
        /> 
    ); 
}; 

export default SupplierCustomerAcknowledgedOrders;