import React, { useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const navigate = useNavigate();
    
    // Form State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Visibility State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation: Ensure fields are filled
        if (!password || !confirmPassword) {
            return toast.error("Please fill in both fields.");
        }
        
        // 2. Validation: Basic length check
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters long.");
        }
        
        // 3. Validation: Ensure both fields match exactly
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        // Start loading state
        setIsSubmitting(true);
        const loadingId = toast.loading("Updating password...");

        // 4. Mock API Call: Simulate a 1-second delay for better UX, then succeed
        setTimeout(() => {
            setIsSubmitting(false);
            
            toast.update(loadingId, { 
                render: "Password updated successfully!", 
                type: "success", 
                isLoading: false, 
                autoClose: 2000 
            });
            
            // Navigate back to the sign-in page
            navigate('/sign-in');
        }, 1000);
    };

    // Reusable Eye Icon Component
    const EyeIcon = ({ isVisible, onClick }) => (
        <button 
            type="button" 
            onClick={onClick} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8C6D4F] focus:outline-none transition-colors"
        >
            {isVisible ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            )}
        </button>
    );

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
                            Reset Password
                        </p>
                        <p className="font-normal text-center text-white/60 font-satoshi text-sm sm:text-base mt-2">
                            Please enter and confirm your new password below.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="font-satoshi space-y-3 sm:space-y-4 pb-10 w-full">
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex flex-col justify-between w-full">
                            
                            <div className="space-y-4 sm:space-y-5 w-full">
                                
                                {/* New Password Input */}
                                <div className="flex flex-col gap-y-1.5 sm:gap-y-2 w-full">
                                    <label className="text-white font-medium text-sm sm:text-base">New Password</label>
                                    <div className="relative">
                                        <input 
                                            placeholder="Enter New Password" 
                                            className="border border-[#374151] bg-transparent text-white rounded-[4px] outline-none focus:border-[#8C6D4F] focus:ring-1 focus:ring-[#8C6D4F] pl-3 pr-10 py-2.5 text-sm sm:text-base min-h-[40px] w-full min-w-0 transition-colors" 
                                            type={showPassword ? "text" : "password"} 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <EyeIcon 
                                            isVisible={showPassword} 
                                            onClick={() => setShowPassword(!showPassword)} 
                                        />
                                    </div>
                                </div>

                                {/* Confirm New Password Input */}
                                <div className="flex flex-col gap-y-1.5 sm:gap-y-2 w-full">
                                    <label className="text-white font-medium text-sm sm:text-base">Confirm New Password</label>
                                    <div className="relative">
                                        <input 
                                            placeholder="Confirm New Password" 
                                            className="border border-[#374151] bg-transparent text-white rounded-[4px] outline-none focus:border-[#8C6D4F] focus:ring-1 focus:ring-[#8C6D4F] pl-3 pr-10 py-2.5 text-sm sm:text-base min-h-[40px] w-full min-w-0 transition-colors" 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <EyeIcon 
                                            isVisible={showConfirmPassword} 
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
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
                                        "Confirm"
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

export default ResetPassword;