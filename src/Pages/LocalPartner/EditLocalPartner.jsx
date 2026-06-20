import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { LocalPartnerForm } from '../../ComponentsTemp/LocalPartners/LocalPartnerForm'; 
import { getAuthConfig } from '../../utils/orderUtils'; // Adjust path as needed 

const EditLocalPartner = () => { 
    const { id } = useParams(); // Grabs the '58' (or any ID) from the URL 
    const navigate = useNavigate(); 
    
    const setTitle = useStore((state) => state.setTitle); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    
    const [initialData, setInitialData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // --- Set Page Title & Global Loader --- 
    useEffect(() => { 
        setTitle('Update Local Partner'); 
        setShowProfile(false); 
        setIsGlobalLoading(true); // 1. Turn on loader instantly
        
        // BUG FIX: Added curly braces so these only fire when leaving the page!
        return () => {
            setTitle(''); 
            setShowProfile(true); 
            setIsGlobalLoading(false); // Safety catch
        };
    }, [setTitle, setShowProfile, setIsGlobalLoading]); 

    // --- 1. Fetch Existing Data on Mount --- 
    useEffect(() => { 
        const fetchPartner = async () => { 
            try { 
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/${id}`, getAuthConfig()); 
                
                // Account for standard or nested API responses 
                const data = res.data?.data?.data || res.data?.data; 
                
                if (data) { 
                    // Convert nulls to empty strings so React inputs don't throw warnings 
                    const sanitizedData = {}; 
                    for (const key in data) { 
                        sanitizedData[key] = data[key] === null ? '' : data[key]; 
                    } 
                    
                    // Ensure dates format correctly for the <input type="date"> 
                    if (sanitizedData.registerDate) { 
                        sanitizedData.registerDate = sanitizedData.registerDate.split('T')[0]; 
                    } 
                    setInitialData(sanitizedData); 
                } else { 
                    toast.error("Partner not found."); 
                    navigate('/sale-representative'); 
                } 
            } catch (error) { 
                console.error("Failed to fetch partner:", error); 
                toast.error("Failed to load local partner details."); 
                navigate('/sale-representative'); 
            } finally { 
                setIsLoading(false); 
                setIsGlobalLoading(false); // 2. Turn off loader when fetch finishes
            } 
        }; 
        
        fetchPartner(); 
    }, [id, navigate, setIsGlobalLoading]); 

    // --- 2. Handle the PATCH Request --- 
    const handleUpdate = async (formData) => { 
        setIsSubmitting(true); 
        setIsGlobalLoading(true); // 3. Turn on loader while saving!

        try { 
            // Build the exact payload you specified 
            const payload = { 
                srName: formData.srName, 
                email: formData.email, 
                creditLimit: formData.creditLimit, 
                partnerType: formData.partnerType, 
                country: formData.country, 
                city: formData.city, 
                state: formData.state, 
                zipCode: formData.zipCode, 
                address: formData.address, 
                territoryName: formData.territoryName, 
                image: null, 
                phoneNumber: formData.phoneNumber, 
                countryCode: formData.countryCode, 
                status: formData.status === 'true' || formData.status === true 
            }; 
            
            // Conditionally add the password ONLY if the user checked the "Update Password" box 
            if (formData.isUpdatingPassword && formData.password) { 
                payload.password = formData.password; 
            } 
            
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/${id}`, payload, getAuthConfig()); 
            
            if (res.data.status === 'success' || res.status === 200) { 
                toast.success("Local Partner successfully updated!"); 
                navigate('/sale-representative'); 
            } 
        } catch (error) { 
            console.error("Failed to update partner:", error); 
            toast.error(error.response?.data?.message || "Failed to update local partner."); 
        } finally { 
            setIsSubmitting(false); 
            setIsGlobalLoading(false); // 4. Turn off loader when save finishes
        } 
    }; 

    // If still fetching initial data, return null so the global loader handles the UI
    if (isLoading) { 
        return null; 
    } 

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-12 font-sans flex justify-center items-start"> 
            {/* We pass mode="edit" so the form knows to hide the Shipping Address section and change the button text to "Update Local Partner" */} 
            <LocalPartnerForm 
                mode="edit" 
                initialData={initialData} 
                onSubmitForm={handleUpdate} 
                isSubmitting={isSubmitting} 
            /> 
        </div> 
    ); 
}; 

export default EditLocalPartner;