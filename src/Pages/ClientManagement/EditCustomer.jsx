import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { CustomerForm } from '../../ComponentsTemp/ClientManagement/CustomerForm'; 
import { UpdateDiscountModal } from '../../ComponentsTemp/ClientManagement/Modals/UpdateDiscountModal'; // Adjust path as needed!
import { getAuthConfig } from '../../utils/orderUtils';

const EditCustomer = () => { 
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions);
     const setShowProfile = useStore((state) => state.setShowProfile); 
    
    const [initialData, setInitialData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // State to control the new discount modal
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    
    // --- Header Setup (Dynamic Navbar) --- 
    useEffect(() => { 
        setTitle('Update Customer'); 
        setShowProfile(false);
        
        // Add the button to the top right navbar using setActions
        const customActionsNode = (
            <button 
                onClick={() => setIsDiscountModalOpen(true)}
                className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#735541] transition-colors shadow-sm"
            >
                Update User Discount
            </button>
        );
        setActions(customActionsNode); 

        return () => { 
            setTitle(''); 
            setActions(null); 
            setShowProfile(true);
        }; 
    }, [setTitle, setActions, setShowProfile]); 
    
    // --- 1. Fetch Existing Data --- 
    useEffect(() => { 
        const fetchCustomerDetails = async () => { 
            try { 
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/view-customer-detail/${id}`, getAuthConfig()); 
                const customerData = res.data?.data?.customer; 
                
                if (customerData) { 
                    setInitialData(customerData); 
                } else { 
                    toast.error("Customer not found."); 
                    navigate('/customers'); 
                } 
            } catch (error) { 
                console.error("Fetch Error:", error); 
                toast.error("Failed to load customer details."); 
                navigate('/customers'); 
            } finally { 
                setIsLoading(false); 
            } 
        }; 
        fetchCustomerDetails(); 
    }, [id, navigate]); 
    
    // --- 2. Handle the PATCH Update --- 
    const handleEditSubmit = async (formData) => { 
        setIsSubmitting(true); 
        try { 
            const addressObj = { 
                companyaddress: "", 
                addressLineOne: formData.addressLineOne, 
                addressLineTwo: formData.addressLineTwo, 
                town: formData.town, 
                country: formData.country, 
                state: formData.state, 
                zipCode: formData.zipCode, 
                status: true 
            }; 
            
            const infoObj = { 
                name: formData.name, 
                email: formData.email, 
                status: true, 
                phoneNumber: formData.phoneNumber, 
                countryCode: formData.countryCode, 
                saleTaxNumber: formData.saleTaxNumber, 
                dispatchEmail: formData.dispatchEmail, 
                emailToSendInvoices: formData.emailToSendInvoices, 
                companyName: formData.companyName, 
                registerBy: "email", 
                defaultDiscount: null 
            }; 
            
            if (formData.password && formData.password.trim() !== "") { 
                infoObj.password = formData.password; 
            } 
            
            const payload = { 
                info: infoObj, 
                address: addressObj, 
                billingAddress: formData.billingSameAsShipping ? addressObj : {} 
            }; 
            
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/customer-update/${id}`, payload, getAuthConfig()); 
            
            if (res.data?.status === 'success' || res.status === 200) { 
                toast.success("Customer successfully updated!"); 
                navigate('/customers'); 
            } 
        } catch (error) { 
            console.error("Update Error:", error); 
            toast.error(error.response?.data?.message || "Failed to update customer. Please try again."); 
        } finally { 
            setIsSubmitting(false); 
        } 
    }; 
    
    if (isLoading) { 
        return ( 
            <div className="w-full min-h-[calc(100vh-100px)] flex items-center justify-center font-sans text-gray-500 bg-[#f8fafc]"> 
                Loading customer data... 
            </div> 
        ); 
    } 
    
    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans flex flex-col items-center relative"> 
            
            {/* Top Back Arrow */} 
            <div className="w-full max-w-[1200px] mb-6"> 
                <button onClick={() => navigate('/customers')} className="flex items-center text-[#86644c] hover:bg-brand-brown hover:text-white rounded-full transition-colors"> 
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="30" width="30" xmlns="http://www.w3.org/2000/svg"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"></path></svg> 
                </button> 
            </div> 
            
            {initialData && ( 
                <CustomerForm 
                    mode="edit" 
                    initialData={initialData} 
                    onSubmitForm={handleEditSubmit} 
                    isSubmitting={isSubmitting} 
                /> 
            )} 

            {/* Render the Modal */}
            <UpdateDiscountModal 
                isOpen={isDiscountModalOpen} 
                onClose={() => setIsDiscountModalOpen(false)} 
                customerId={id}
                initialDiscounts={initialData?.userDiscounts || []}
            />
            
        </div> 
    ); 
}; 

export default EditCustomer;