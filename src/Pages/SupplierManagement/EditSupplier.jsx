import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { SupplierForm } from '../../Components/SupplierManagement/SupplierForm'; // Adjust path

const EditSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setShowProfile = useStore((state) => state.setShowProfile);
   const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setTitle('Update Supplier');
        return () => setTitle('');
       
         setIsLoading(true);
        setIsGlobalLoading(true); 
    }, [setTitle , setShowProfile , setIsGlobalLoading]);
     useEffect(() => {
            setShowProfile(false);
            return () => setShowProfile(true);
        }, [setShowProfile]);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // Fetch existing data
    useEffect(() => {
        const fetchSupplier = async () => {
            setIsGlobalLoading(true); 
            try {
                const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/supplier/${id}`, getAuthConfig());
                const data = res.data?.data?.data;
                
                if (data) {
                    // Convert nulls to empty strings so React inputs don't complain
                    const sanitizedData = {};
                    for (const key in data) {
                        sanitizedData[key] = data[key] === null ? '' : data[key];
                    }
                    // Extract Date correctly
                    if (sanitizedData.registerDate) {
                        sanitizedData.registerDate = sanitizedData.registerDate.split('T')[0];
                    }
                    setInitialData(sanitizedData);
                } else {
                    toast.error("Supplier not found.");
                    navigate('/suppliers');
                }
            } catch (error) {
                toast.error("Failed to load supplier details.");
                navigate('/suppliers');
            } finally {
                setIsLoading(false);
          
            setIsGlobalLoading(false);
            }
        };
        fetchSupplier();
    }, [id, navigate ,  setIsGlobalLoading]);

    const handleUpdate = async (formData) => {
        setIsSubmitting(true);
        try {
            // Build payload exactly like ADD, but check if we need to send password
            const payload = {
                ...formData,
                image: null, 
                businessRegistrationNumber: "", 
                status: formData.status === 'true', 
                deleted: false,
            };

            // If user did NOT check "Update Password", remove it from payload!
            if (!formData.isUpdatingPassword) {
                delete payload.password;
            }
            
            // Remove the helper flag before sending to API
            delete payload.isUpdatingPassword;

            // Notice we use PATCH here to update
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/supplier/${id}`, payload, getAuthConfig());

            if (res.data.status === 'success' || res.status === 200) {
                toast.success("Supplier successfully updated!");
                navigate('/suppliers'); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update supplier.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="w-full min-h-[calc(100vh-100px)] flex items-center justify-center font-sans text-gray-500">Loading supplier data...</div>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-12 font-sans flex justify-center items-start">
            <SupplierForm 
                mode="edit" 
                initialData={initialData} 
                onSubmitForm={handleUpdate} 
                isSubmitting={isSubmitting} 
            />
        </div>
    );
};

export default EditSupplier;