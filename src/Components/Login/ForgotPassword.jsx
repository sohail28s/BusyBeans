import React, { useState } from 'react';
import { useNavigate  , Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userTypeOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'customer', label: 'Customer' },
        { value: 'supplier', label: 'Supplier' },
    ];

    // Custom styles for react-select to match your reference and requirements
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '40px',
            backgroundColor: 'transparent',
            borderColor: state.isFocused ? '#8C6D4F' : '#374151', // Adjust to your actual border color
            boxShadow: state.isFocused ? '0 0 0 1px #8C6D4F' : 'none',
            '&:hover': {
                borderColor: '#8C6D4F'
            },
            borderRadius: '4px',
            cursor: 'pointer'
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '2px 12px',
        }),
        input: (provided) => ({
            ...provided,
            color: '#fff',
            margin: '0px',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9ca3af', // text-gray-400
            fontSize: '14px',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#fff',
            fontSize: '14px',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#9ca3af',
            padding: '8px',
            '&:hover': {
                color: '#fff',
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#6f4e37', // Match input-brown requirement
            borderRadius: '4px',
            marginTop: '4px',
            border: '1px solid #374151',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? '#8C6D4F' 
                : state.isFocused 
                    ? '#322a23' // Match input-brown-hover requirement
                    : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            '&:active': {
                backgroundColor: '#8C6D4F',
            }
        }),
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            return toast.error("Please enter your email.");
        }
        if (!userType) {
            return toast.error("Please select a user type.");
        }

        setIsSubmitting(true);
        const loadingId = toast.loading("Sending OTP...");

        try {
            const response = await axios.post(
                'https://testingbb.trimworldwide.com/api/v1/admin/forgot-password/',
                { email: email }
            );

            if (response.data?.status === 'success' || response.status === 200) {
                toast.update(loadingId, { 
                    render: "OTP sent successfully!", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 2000 
                });
                navigate('/verify-email', { state: { email: email } });
            } else {
                throw new Error(response.data?.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error("Forgot Password Error:", error);
            toast.update(loadingId, { 
                render: error.response?.data?.message || "An error occurred. Please try again.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#3e342c] p-4">
            <div className="border border-[#8C6D4F] rounded-xl bg-[#322a23] w-full min-w-0 max-w-[calc(100vw-1.5rem)] sm:max-w-none sm:w-4/6 md:w-[70%] lg:w-3/5 xl:w-2/4 py-5 sm:py-6 flex flex-col items-center gap-y-3 sm:gap-y-4 px-3 sm:px-0 shadow-2xl">
                
                {/* Logo */}
                <div className="w-36 sm:w-60 md:w-72 lg:w-80 shrink-0">
                    <img 
                        alt="logo" 
                        className="h-full w-full object-contain" 
                        src="/Images/logosidebar.png" 
                        
                    />
                </div>

                <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full sm:w-11/12 md:w-[70%] lg:w-3/5 px-1 sm:px-0">
                    
                    {/* Headers */}
                    <div>
                        <p className="font-satoshi text-white font-black text-xl sm:text-2xl lg:text-3xl text-center">
                            Forgot Password
                        </p>
                        <p className="font-normal text-center text-white/60 font-satoshi text-sm sm:text-base mt-2">
                            Add your email and we will send you a one time password (OTP)
                        </p>
                    </div>

                    {/* Form */}
                    <div className="font-satoshi space-y-3 sm:space-y-4 pb-10 w-full">
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex flex-col justify-between w-full">
                            
                            <div className="space-y-3 sm:space-y-4 w-full">
                                
                                {/* Email Input */}
                                <div className="flex flex-col gap-y-1.5 sm:gap-y-2 w-full">
                                    <label className="text-white font-medium text-sm sm:text-base">Email</label>
                                    <input 
                                        placeholder="Enter Email" 
                                        className="border border-[#374151] bg-transparent text-gray-800 bg-white rounded-[4px] outline-none focus:border-[#8C6D4F] focus:ring-1 focus:ring-[#8C6D4F] px-3 py-2.5 text-sm sm:text-base min-h-[40px] w-full min-w-0 transition-colors" 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Select User Type */}
                                <div className="flex flex-col gap-y-1.5 sm:gap-y-2 w-full">
                                    <label className="text-white font-medium text-sm sm:text-base">Select User Type</label>
                                    <div className="w-full min-w-0">
                                        <Select
                                            options={userTypeOptions}
                                            styles={customSelectStyles}
                                            placeholder="Select User Type"
                                            value={userType}
                                            onChange={setUserType}
                                            isSearchable={false}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="font-medium rounded-[4px] bg-[#8C6D4F] hover:bg-[#735a40] text-white w-full py-2.5 sm:py-3 text-sm sm:text-base min-h-[44px] touch-manipulation transition-colors disabled:opacity-70 flex justify-center items-center"
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        "Continue"
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;