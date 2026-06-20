import React, { useState } from 'react';
import { useNavigate  , Link} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { Spinner } from '../../Hooks/PageLoader';

  const Login = () => {
    const navigate = useNavigate();
    const [activeRole, setActiveRole] = useState('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    };

    const generateDummyDevToken = () => {
        return 'dev-token-mock-' + Math.random().toString(36).substring(2, 15);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let isValid = true;
        const newFieldErrors = { email: '', password: '' };

        if (!formData.email) {
            newFieldErrors.email = 'Please enter your email';
            isValid = false;
        }
        if (formData.password.length < 6) {
            newFieldErrors.password = 'password must be at least 6 characters';
            isValid = false;
        }

        if (!isValid) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setLoading(true);

        // Dynamically set the endpoint based on the selected role tab
        let endpoint = '';
        if (activeRole === 'admin') {
            endpoint = 'https://testingbb.trimworldwide.com/api/v1/admin/login';
        } else if (activeRole === 'supplier') {
            endpoint = 'https://testingbb.trimworldwide.com/api/v1/admin/login/supplier';
        } else if (activeRole === 'partner') {
            endpoint = 'https://testingbb.trimworldwide.com/api/v1/admin/login/sales-rep';
        }

        const currentDevToken = generateDummyDevToken();

        try {
            const response = await axios.post(endpoint, {
                email: formData.email,
                password: formData.password,
                devtoken: currentDevToken
            });

            const responseData = response.data;
            const token = responseData.data?.token || responseData.token;
            const user = responseData.data?.user || responseData.user;

            if (token) {
                // 1. Core Auth Tokens
                localStorage.setItem('accessToken', token);
                localStorage.setItem('devToken', currentDevToken);
                localStorage.setItem('isLoggedIn', 'true');
                
                // 2. Global Role Identifier
                localStorage.setItem('userRole', activeRole);

                if (user) {
                    // 3. Standardize User Information
                    localStorage.setItem('userId', user.id || user._id || '');
                    
                    // Dynamically grab the correct name field based on who logged in
                    const displayName = user.name || user.supplierName || user.srName || user.firstName || 'User';
                    localStorage.setItem('userName', displayName);
                    
                    localStorage.setItem('userEmail', user.email || '');

                    // 4. Save Role-Specific Meta Data if it exists
                    if (user.partnerType) {
                        localStorage.setItem('partnerType', user.partnerType);
                    }
                    if (user.supplierType) {
                        localStorage.setItem('supplierType', user.supplierType);
                    }

                    // 5. Store the entire raw user object as a string. 
                    // This is great for future-proofing! If you ever need their specific 
                    // address, phoneNum, or status, you can just parse this object.
                    localStorage.setItem('userData', JSON.stringify(user));
                }

                toast.success('Successfully logged in!');
                navigate('/');
            } else {
                toast.error('Login successful, but no security token was received.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login Fetch Error:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Invalid email or password.');
            } else if (error.request) {
                toast.error('Unable to connect to the server. Please check your internet connection.');
            } else {
                toast.error('An unexpected error occurred.');
            }
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center p-3  bg-cover bg-no-repeat bg-[url('/Images/signInBackgroundImage.webp')]">
      <div className="w-full  sm:w-[85%] md:w-[80%] xl:w-3/5 
       max-w-[calc(100vw-1.5rem)] grid grid-cols-1 md:grid-cols-2 rounded-lg border border-brand-brown backdrop-blur-md overflow-hidden shadow-2xl md:min-h-[85vh] 
        ">
        
        {/* Left Column: Logo & Links */}
        <div className="flex flex-col items-center justify-between pt-7 pb-1 sm:p-12 border-b md:border-b-0 md:border-r-2 border-brand-brown bg-black/10">
          <div className="flex-1 flex items-center justify-center">
            <img 
              alt="Busy Bean Logo" 
              src="/Images/logo.webp" 
              className="object-contain w-[112px] h-[39px] sm:w-full sm:h-36"
            />
          </div>
          <div className="hidden sm:flex flex-wrap justify-center gap-4 text-white font-switzer text-sm mt-8">
            <a href="/terms" className="hover:text-gray-200 transition-colors">Terms of Services</a>
            <a href="/privacy" className="hover:text-gray-200 transition-colors">Privacy Policy</a>
            <a href="/support" className="hover:text-gray-200 transition-colors">Help & Support</a>
          </div>
        </div>

        {/* Right Column: Login Form / Loading GIF */}
        <div className="flex flex-col justify-center py-12 px-3 sm:px-8 md:px-14 bg-black/10 gap-0">
          <h1 className="font-satoshi text-lg md:text-xl lg:text-3xl font-black text-white mb-6 leading-tight">
            Sign In to Busy Bean
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner/>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
              
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="font-satoshi font-medium text-white text-sm">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email" 
                  className={`w-full bg-white text-black placeholder-gray-400 rounded-md px-4 py-3 focus:outline-none ${fieldErrors.email ? 'border border-brand-brown border-b-2' : 'border border-transparent'}`}
                />
                {/* Red text under input */}
                {fieldErrors.email && (
                  <span className="text-red-500 text-xs font-medium mt-1">{fieldErrors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="font-satoshi font-medium text-white text-sm">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="password" 
                    className={`w-full bg-white text-black placeholder-gray-400 rounded-md pl-4 pr-12 py-3 focus:outline-none ${fieldErrors.password ? 'border border-brand-brown border-b-2' : 'border border-transparent'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                {/* Red text under input */}
                {fieldErrors.password && (
                  <span className="text-red-500 text-xs font-medium mt-0">{fieldErrors.password}</span>
                )}
                
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-sm text-gray-200 hover:text-white transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Role Selection Checkboxes */}
              <div className="flex flex-col gap-3 mt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${activeRole === 'admin' ? 'bg-blue-500 border-blue-500' : 'bg-white border-white'}`}>
                    {activeRole === 'admin' && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <span className="font-sans text-white font-medium text-sm select-none">Admin</span>
                  <input type="checkbox" className="hidden" checked={activeRole === 'admin'} onChange={() => setActiveRole('admin')} />
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${activeRole === 'supplier' ? 'bg-blue-500 border-blue-500' : 'bg-white border-white'}`}>
                    {activeRole === 'supplier' && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <span className="font-sans text-white font-medium text-sm select-none">Supplier</span>
                  <input type="checkbox" className="hidden" checked={activeRole === 'supplier'} onChange={() => setActiveRole('supplier')} />
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${activeRole === 'partner' ? 'bg-blue-500 border-blue-500' : 'bg-white border-white'}`}>
                    {activeRole === 'partner' && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <span className="font-sans text-white font-medium text-sm select-none">Local Partner</span>
                  <input type="checkbox" className="hidden" checked={activeRole === 'partner'} onChange={() => setActiveRole('partner')} />
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-brand-brown hover:bg-[#6c503d] text-white font-satoshi font-medium py-3 rounded-md transition-colors mt-2 shadow-lg"
              >
                Sign In
              </button>
              
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;