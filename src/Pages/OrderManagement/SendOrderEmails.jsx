import React from 'react';
import { useEffect } from 'react';
import { ActionPageLayout } from '../../ComponentsTemp/OrderManagement/SharedOrderActions'; 
import useStore from '../../Hooks/useStore';
const SendOrderEmails = () => {
    const setShowNavbar = useStore((state) => state.setShowNavbar);
    useEffect(() => {
   setShowNavbar(false); 

   return () => setShowNavbar(true);
}, []);
    return (
        <ActionPageLayout 
            mode="send"
            title="Send Order Emails"
            description="Use this page to send emails related to orders. You can select the order type and email type, then send the email directly."
            buttonText="Send Email"
        />
    );
};

export default SendOrderEmails;