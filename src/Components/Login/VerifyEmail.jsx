import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve the email passed from the Forgot Password page.
    // Fallback to a placeholder if accessed directly.
    const email = location.state?.email || 'admin@gmail.com';

    // OTP State
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Timer State
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Handle Timer Countdown
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Format time to MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Handle OTP Input Change
    const handleChange = (index, e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Take only the last character if they paste multiple or type fast
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-advance to the next input if a number is typed
        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        }

        // Check if all 4 digits are filled to trigger submission
        if (value && index === 3) {
            const fullCode = newOtp.join('');
            if (fullCode.length === 4) {
                verifyCode(fullCode);
            }
        }
    };

    // Handle Backspace for easier editing
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    // Dummy Verification Logic
    const verifyCode = (code) => {
        if (code === '1234') {
            toast.success("Email verified successfully!");
            navigate('/reset-password');
        } else {
            toast.error("Invalid OTP code. Try 1234.");
            // Optional: Clear the input on failure
            // setOtp(['', '', '', '']);
            // inputRefs[0].current.focus();
        }
    };

    // Handle Resend Click
    const handleResend = () => {
        if (!canResend) return;
        
        // Dummy resend logic
        toast.info(`New code sent to ${email}`);
        setTimeLeft(60);
        setCanResend(false);
        setOtp(['', '', '', '']);
        inputRefs[0].current.focus();
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#3e342c] p-4">
            
            <div className="border border-[#8C6D4F] rounded-xl bg-[#322a23] w-full min-w-0 max-w-[calc(100vw-1.5rem)] sm:max-w-none sm:w-4/6 md:w-[70%] lg:w-3/5 xl:w-2/4 py-5 sm:py-6 flex flex-col items-center gap-y-3 sm:gap-y-4 px-3 sm:px-0 shadow-2xl">
                
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
                            Verify Your email
                        </p>
                        <p className="font-normal text-center text-white/60 font-satoshi text-sm sm:text-base break-words mt-2">
                            Please enter the 4 digit code sent to {email}{' '}
                            <button 
                                onClick={() => navigate(-1)} 
                                className="text-white underline hover:no-underline ml-1"
                            >
                                Edit
                            </button>
                        </p>
                    </div>

                    {/* Form Area */}
                    <div className="font-satoshi space-y-3 sm:space-y-4 pb-4">
                        <div className="space-y-4 sm:space-y-6 flex flex-col justify-between">
                            
                            {/* OTP Inputs */}
                            <div className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-6">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        inputMode="numeric"
                                        min="0"
                                        type="number"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        // Hiding the number spin buttons and styling to match the reference
                                        className="w-12 h-14 sm:w-16 sm:h-[72px] md:w-20 md:h-[88px] rounded-lg border border-[#374151] bg-white text-black text-4xl sm:text-5xl md:text-6xl text-center flex items-center justify-center min-w-0 outline-none focus:border-[#8C6D4F] focus:ring-2 focus:ring-[#8C6D4F] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                ))}
                            </div>

                            {/* Timer and Resend */}
                            <div>
                                <div className="space-y-2 flex justify-center flex-col items-center mt-4">
                                    <p className="text-white/60 text-sm sm:text-base font-medium tracking-wider">
                                        {formatTime(timeLeft)}
                                    </p>
                                    <button 
                                        onClick={handleResend}
                                        disabled={!canResend}
                                        className={`text-base sm:text-lg underline touch-manipulation py-1 transition-colors ${
                                            canResend 
                                                ? 'text-[#8C6D4F] hover:text-[#735a40] cursor-pointer' 
                                                : 'text-[#8C6D4F]/50 cursor-not-allowed'
                                        }`}
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;