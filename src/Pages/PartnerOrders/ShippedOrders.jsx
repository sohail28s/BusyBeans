import React, { useEffect } from 'react';
import { PartnerOrderLayout } from '../../Components/PartnerOrders/PartnerOrderLayout';
import useStore from '../../Hooks/useStore'

const ShippedOrders = () => {
 const setStoreTitle = useStore(state => state.setTitle);
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);
    const setShowProfile = useStore((state) => state.setShowProfile); 
   

    useEffect(() => { 
        setStoreTitle('Shipped Orders'); 
        setIsGlobalLoading(true);
        setShowProfile(false);

        return () => {
            setStoreTitle('');
            setIsGlobalLoading(false);
            setShowProfile(true);
        };
    }, [setStoreTitle, setIsGlobalLoading , setShowProfile]); 
    return (
        <PartnerOrderLayout 
            apiEndpoint="https://testingbb.trimworldwide.com/api/v1/admin/partner-order/orders-list?statusId=5"
              detailsBaseRoute="/orders/partnerOrders/detail" 
        />
    );
};

export default ShippedOrders;