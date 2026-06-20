import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../Hooks/useStore'; 
import { PageStatsHeader } from '../../Components/Shared/PageStatsHeader'; 
import { LocalPartnerTable } from '../../Components/LocalPartners/LocalPartnerTable'; 

const LocalPartnerManagement = () => { 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    
    // State to hold the total number, which the table component will update! 
    const [totalPartners, setTotalPartners] = useState(0); 
    
    useEffect(() => { 
        setTitle('Local Partners'); 
        setShowProfile(false); 
        setIsGlobalLoading(true); // 1. Turn on the loader as soon as the page mounts
        
        // BUG FIX: Added curly braces so both state resets happen ONLY on unmount
        return () => {
            setTitle(''); 
            setShowProfile(true); 
            setIsGlobalLoading(false); // Safety catch: turn off loader if user navigates away early
        };
    }, [setTitle, setShowProfile, setIsGlobalLoading]); 

    const handleTotalUpdate = (total) => {
        setTotalPartners(total);
        setIsGlobalLoading(false); // 2. Turn off the loader as soon as the table passes the data up!
    };

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans flex flex-col gap-6"> 
            <PageStatsHeader 
                cardTitle="Total Local Partners" 
                totalValue={totalPartners} 
                buttonText="+ Add New Local Partner" 
                onButtonClick={() => navigate('/sale-representative/add')} 
            /> 
            <LocalPartnerTable onTotalUpdate={handleTotalUpdate} /> 
        </div> 
    ); 
}; 

export default LocalPartnerManagement;