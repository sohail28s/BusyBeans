import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { LocalPartnerForm } from '../../ComponentsTemp/LocalPartners/LocalPartnerForm'; 
import { getAuthConfig } from '../../utils/orderUtils'; 

const AddLocalPartner = () => { 
    const navigate = useNavigate(); 
    
    const setTitle = useStore((state) => state.setTitle); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    useEffect(() => { 
        setTitle('Add Local Partner'); 
        setShowProfile(false); 
        
        // BUG FIX: Added curly braces so these only fire when leaving the page!
        return () => {
            setTitle(''); 
            setShowProfile(true); 
            setIsGlobalLoading(false); // Safety catch just in case
        };
    }, [setTitle, setShowProfile, setIsGlobalLoading]); 
    
    const handleAdd = async (formData) => { 
        setIsSubmitting(true); 
        setIsGlobalLoading(true); // Turns on the global loader
        
        try { 
            // Format the Shipping Object 
            const shippingObj = { 
                companyaddress: "", 
                addressLineOne: formData.shippingAddressLineOne, 
                addressLineTwo: formData.shippingAddressLineTwo, 
                town: formData.shippingTown, 
                country: formData.shippingCountry, 
                state: formData.shippingState, 
                zipCode: formData.shippingZipCode, 
                status: true 
            }; 
            
            // Format the main Payload structure 
            const payload = { 
                srName: formData.srName, 
                email: formData.email, 
                creditLimit: formData.creditLimit, 
                partnerType: formData.partnerType, 
                password: formData.password, 
                country: formData.country, 
                city: formData.city, 
                state: formData.state, 
                zipCode: formData.zipCode, 
                address: formData.address, 
                territoryName: formData.territoryName, 
                businessWeb: "", // Provided as empty string in prompt 
                image: null, 
                phoneNumber: formData.phoneNumber, 
                countryCode: formData.countryCode, 
                status: formData.status === 'true', 
                // Nesting Addresses 
                shippingAddress: shippingObj, 
                billingAddress: formData.billingSameAsShipping ? shippingObj : {} 
            }; 
            
            const res = await axios.post('https://testingbb.trimworldwide.com/api/v1/admin/sales-rep', payload, getAuthConfig()); 
            
            if (res.data.status === 'success' || res.status === 200 || res.status === 201) { 
                toast.success("Local Partner successfully added!"); 
                navigate('/sale-representative'); 
            } 
        } catch (error) { 
            toast.error(error.response?.data?.message || "Failed to add local partner."); 
        } finally { 
            setIsSubmitting(false); 
            setIsGlobalLoading(false); // Turns off the global loader
        } 
    }; 
    
    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-12 font-sans flex justify-center items-start"> 
            <LocalPartnerForm 
                mode="add" 
                onSubmitForm={handleAdd} 
                isSubmitting={isSubmitting} 
            /> 
        </div> 
    ); 
}; 

export default AddLocalPartner;