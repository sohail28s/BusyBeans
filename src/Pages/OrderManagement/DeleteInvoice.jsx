import React from 'react';
import { ActionPageLayout } from '../../Components/OrderManagement/SharedOrderActions'; 
import { useEffect } from 'react';
import useStore from '../../Hooks/useStore';

const DeleteInvoice = () => {
     const setShowNavbar = useStore((state) => state.setShowNavbar);
    useEffect(() => {
   setShowNavbar(false); 

   return () => setShowNavbar(true); 
}, []);
    return (
        <ActionPageLayout 
            mode="delete"
            title="Delete Invoice"
            description="Use this page to delete an invoice by providing order ID and order type."
            buttonText="Delete Invoice"
        />
    );
};

export default DeleteInvoice;