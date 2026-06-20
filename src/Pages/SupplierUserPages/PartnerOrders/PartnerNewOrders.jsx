import React, { useEffect } from 'react'; 
import useStore from '../../../Hooks/useStore'; 
import { SupplierPartnerOrderLayout } from '../../../ComponentsTemp/SupplierUser/SupplierPartnerOrderLayout';

const SupplierPartnerNewOrders = () => { 
    const setStoreTitle = useStore(state => state.setTitle); 
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading); 
    const userId = useStore(state => state.userId); // Get supplier ID
    
    useEffect(() => { 
        setStoreTitle('New Partner Orders'); 
        setIsGlobalLoading(true); 
        return () => { 
            setStoreTitle(''); 
            setIsGlobalLoading(false); 
        }; 
    }, [setStoreTitle, setIsGlobalLoading]); 

    // Fallback if ID hasn't loaded
    if (!userId) return null;

    return ( 
        <SupplierPartnerOrderLayout
            apiEndpoint={`https://testingbb.trimworldwide.com/api/v1/admin/partner-order/orders-list?supplierId=${userId}&statusId=2`} 
            detailsBaseRoute="/supplier/partner/new-orders/" 
        /> 
    ); 
}; 

export default SupplierPartnerNewOrders;