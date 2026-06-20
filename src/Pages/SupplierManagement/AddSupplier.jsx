import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { SupplierForm } from '../../ComponentsTemp/SupplierManagement/SupplierForm'; // Adjust path

const AddSupplier = () => {
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setTitle('Add New Supplier');
        return () => setTitle('');
    }, [setTitle]);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    const handleAdd = async (formData) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                image: null, 
                businessRegistrationNumber: "", 
                status: formData.status === 'true', 
                deleted: false,
                registerDate: formData.registerDate || new Date().toISOString().split('T')[0],
            };

            const res = await axios.post('https://testingbb.trimworldwide.com/api/v1/admin/supplier', payload, getAuthConfig());

            if (res.data.status === 'success' || res.status === 200 || res.status === 201) {
                toast.success("Supplier successfully added!");
                navigate('/suppliers'); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add supplier.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-whitep-6 md:p-12 font-sans flex justify-center items-start">
            <SupplierForm mode="add" onSubmitForm={handleAdd} isSubmitting={isSubmitting} />
        </div>
    );
};

export default AddSupplier;