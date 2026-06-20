import React, { useEffect } from 'react'; 
import useStore from '../../../Hooks/useStore'; 
import { SupplierPartnerOrderLayout } from '../../../ComponentsTemp/SupplierUser/SupplierPartnerOrderLayout';

const SupplierPartnerAcknowledgedOrders = () => { 
    const setStoreTitle = useStore(state => state.setTitle); 
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading); 
    const userId = useStore(state => state.userId); // Get supplier ID
    
    useEffect(() => { 
        setStoreTitle('Acknowledged Orders'); 
        setIsGlobalLoading(true); 
        return () => { 
            setStoreTitle(''); 
            setIsGlobalLoading(false); 
        }; 
    }, [setStoreTitle, setIsGlobalLoading]); 

    if (!userId) return null;

    return ( 
        <SupplierPartnerOrderLayout
            apiEndpoint={`https://testingbb.trimworldwide.com/api/v1/admin/partner-order/orders-list?supplierId=${userId}&statusId=3`} 
            detailsBaseRoute="/supplier/partner/acknowledged-orders/" 
        /> 
    ); 
}; 

export default SupplierPartnerAcknowledgedOrders;