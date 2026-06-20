import React, { useEffect } from 'react'; 
import useStore from '../../../Hooks/useStore'; 
import { SupplierPartnerOrderLayout } from '../../../Components/SupplierUser/SupplierPartnerOrderLayout';

const SupplierPartnerShippedOrders = () => { 
    const setStoreTitle = useStore(state => state.setTitle); 
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading); 
    const userId = useStore(state => state.userId); // Get supplier ID
    
    useEffect(() => { 
        setStoreTitle('Shipped Orders'); 
        setIsGlobalLoading(true); 
        return () => { 
            setStoreTitle(''); 
            setIsGlobalLoading(false); 
        }; 
    }, [setStoreTitle, setIsGlobalLoading]); 

    if (!userId) return null;

    return ( 
        <SupplierPartnerOrderLayout
            apiEndpoint={`https://testingbb.trimworldwide.com/api/v1/admin/partner-order/orders-list?supplierId=${userId}&statusId=5`} 
            detailsBaseRoute="/supplier/partner/shipped-orders/" 
        /> 
    ); 
}; 

export default SupplierPartnerShippedOrders;