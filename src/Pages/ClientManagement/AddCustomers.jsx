import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { CustomerForm } from '../../ComponentsTemp/ClientManagement/CustomerForm';

const AddCustomer = () => {
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setTitle('Add New Customer');
        setActions(null);
        return () => setTitle('');
    }, [setTitle, setActions]);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
    const handleAddSubmit = async (formData) => {
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

            const payload = {
                info: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    status: true,
                    phoneNumber: formData.phoneNumber,
                    countryCode: formData.countryCode,
                    saleTaxNumber: formData.saleTaxNumber,
                    dispatchEmail: formData.dispatchEmail,
                    emailToSendInvoices: formData.emailToSendInvoices,
                    companyName: formData.companyName,
                    defaultDiscount: null
                },
                address: addressObj,
                billingAddress: formData.billingSameAsShipping ? addressObj : {} 
            };

            const res = await axios.post('https://testingbb.trimworldwide.com/api/v1/admin/add-customer', payload, getAuthConfig());

            if (res.data?.status === 'success' || res.status === 200 || res.status === 201) {
                toast.success("Customer successfully added!");
                navigate('/customers');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add customer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-8 font-sans flex flex-col items-center">
            <div className="w-full max-w-[1200px] mb-6">
                <button onClick={() => navigate('/customers')} className="flex items-center text-[#86644c] hover:bg-brand-brown hover:text-white rounded-full transition-colors"> 
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="30" width="30" xmlns="http://www.w3.org/2000/svg"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"></path></svg> 
                </button> 
            </div>

            <CustomerForm 
                mode="add" 
                onSubmitForm={handleAddSubmit} 
                isSubmitting={isSubmitting} 
            />
            
        </div>
    );
};

export default AddCustomer;