import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../Hooks/useStore'; 
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader' 
import { SupplierTable } from '../../ComponentsTemp/SupplierManagement/SupplierTable'; 

const SupplierManagement = () => { 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const setShowProfile = useStore((state) => state.setShowProfile); 
    
    const [totalSuppliers, setTotalSuppliers] = useState(0); 

    useEffect(() => { 
        setTitle('Supplier Management'); 
        setIsGlobalLoading(true);
         setShowProfile(false);
        
        return () => {
            setTitle('');
            setIsGlobalLoading(false); 
            setShowProfile(true);
        };
    }, [setTitle, setIsGlobalLoading , setShowProfile] ); 

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans flex flex-col gap-6"> 
            <PageStatsHeader 
                cardTitle="Total Suppliers" 
                totalValue={totalSuppliers} 
                buttonText="+ Add New Supplier" 
                onButtonClick={() => navigate('/suppliers/add')} 
            /> 
            
            <SupplierTable 
                onTotalUpdate={(total) => setTotalSuppliers(total)} 
                onFetchComplete={() => setIsGlobalLoading(false)} 
            /> 
        </div> 
    ); 
}; 

export default SupplierManagement;