import React, { useState, useEffect, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { getAuthConfig } from '../../utils/orderUtils'; 

const formatProfileDate = (dateString) => { 
    if (!dateString) return '—'; 
    const date = new Date(dateString); 
    if (isNaN(date.getTime())) return '—'; 
    return date.toLocaleString('en-US'); 
}; 

const ViewField = ({ label, value }) => ( 
    <div className="space-y-1"> 
        <p className="text-sm text-gray-500">{label}</p> 
        <p className="text-sm font-medium text-gray-800">{value || '—'}</p> 
    </div> 
); 

const EditField = ({ label, name, value, onChange, type = "text", placeholder }) => ( 
    <div className="space-y-1"> 
        <p className="text-sm text-gray-500">{label}</p> 
        <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#86644C] transition-colors" 
        /> 
    </div> 
); 

export const ProfilePage = () => { 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    
    const [isLoading, setIsLoading] = useState(true); 
    const [isEditing, setIsEditing] = useState(false); 
    const [isSaving, setIsSaving] = useState(false); 
    const [profileData, setProfileData] = useState(null); 
    
    const [formData, setFormData] = useState({ 
        name: '', email: '', supportEmail: '', countryCode: '', 
        phoneNumber: '', address: '', country: '', state: '', 
        city: '', zipCode: '', password: '' 
    }); 

    useEffect(() => { 
        setTitle( 
            <div className="flex items-center gap-3 cursor-pointer transition-opacity " onClick={() => navigate(-1)}> 
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" className="text-black hover:bg-black hover:text-white font-bold rounded-full"> 
                    <line x1="19" y1="12" x2="5" y2="12"></line> 
                    <polyline points="12 19 5 12 12 5"></polyline> 
                </svg> 
                <span className="font-semibold text-lg text-black">Profile</span> 
            </div> 
        ); 
        return () => setTitle(''); 
    }, [navigate, setTitle]); 

    const fetchProfile = useCallback(async () => { 
        setIsLoading(true); 
        setIsGlobalLoading(true); 
        try { 
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/profile`, getAuthConfig()); 
            if (res.data?.status === 'success' && res.data.data) { 
                const data = res.data.data; 
                setProfileData(data); 
                setFormData({ 
                    name: data.name || '', email: data.email || '', supportEmail: data.supportEmail || '', 
                    countryCode: data.countryCode || '', phoneNumber: data.phoneNumber || '', 
                    address: data.address || '', country: data.country || '', state: data.state || '', 
                    city: data.city || '', zipCode: data.zipCode || '', password: '' 
                }); 
            } else { 
                toast.error("Failed to load profile data."); 
            } 
        } catch (error) { 
            console.error("Profile fetch error:", error); 
            toast.error("Error fetching profile."); 
        } finally { 
            setIsLoading(false); 
            setIsGlobalLoading(false); 
        } 
    }, [setIsGlobalLoading]); 

    useEffect(() => { 
        fetchProfile(); 
    }, [fetchProfile]); 

    const handleChange = (e) => { 
        setFormData({ ...formData, [e.target.name]: e.target.value }); 
    }; 

    const handleSave = async () => { 
        setIsSaving(true); 
        const loadingId = toast.loading("Saving profile..."); 
        try { 
            const payload = { 
                name: formData.name, email: formData.email, supportEmail: formData.supportEmail, 
                countryCode: formData.countryCode, phoneNumber: formData.phoneNumber, 
                address: formData.address, country: formData.country, state: formData.state, 
                city: formData.city, zipCode: formData.zipCode, 
            }; 
            if (formData.password && formData.password.trim() !== '') { 
                payload.password = formData.password; 
            } 
            const idToUpdate = profileData?.id || 1; 
            const res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/profile-update/${idToUpdate}`, payload, getAuthConfig()); 
            
            if (res.data?.status === 'success' || res.status === 200) { 
                toast.update(loadingId, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 2000 }); 
                setIsEditing(false); 
                fetchProfile(); 
            } else { 
                throw new Error("Failed to update."); 
            } 
        } catch (error) { 
            toast.update(loadingId, { render: "Failed to update profile.", type: "error", isLoading: false, autoClose: 3000 }); 
        } finally { 
            setIsSaving(false); 
        } 
    }; 

    const handleCancel = () => { 
        setFormData({ 
            name: profileData.name || '', email: profileData.email || '', supportEmail: profileData.supportEmail || '', 
            countryCode: profileData.countryCode || '', phoneNumber: profileData.phoneNumber || '', 
            address: profileData.address || '', country: profileData.country || '', state: profileData.state || '', 
            city: profileData.city || '', zipCode: profileData.zipCode || '', password: '' 
        }); 
        setIsEditing(false); 
    }; 

    if (isLoading) return null; 
    if (!profileData) return <div className="p-8 text-center text-red-500 font-sans">Profile not found.</div>; 

    return ( 
        <div className="w-full mx-auto  py-8 px-8 lg:p-10 font-sans bg-white min-h-[calc(100vh-94px)]"> 
            <div className="bg-white border border-gray-100 shadow-[0px_4px_20px_-5px_#00000012] rounded-lg p-8 lg:p-12"> 
                
                {/* --- Top Metadata Row --- */} 
                <div className="grid grid-cols-2 gap-8 mb-10 text-sm text-gray-500"> 
                    <div className="space-y-4"> 
                        <div> <p>User ID</p> <p className="font-medium text-gray-800">{profileData.id}</p> </div> 
                        <div> <p>Created At</p> <p className="font-medium text-gray-800">{formatProfileDate(profileData.createdAt)}</p> </div> 
                    </div> 
                    <div className="space-y-4"> 
                        <div> <p>Latest OTP</p> <p className="font-medium text-gray-800">{profileData.latestOtp || '—'}</p> </div> 
                        <div> <p>Updated At</p> <p className="font-medium text-gray-800">{formatProfileDate(profileData.updatedAt)}</p> </div> 
                    </div> 
                </div> 

                {/* --- Main Two Columns --- */} 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 mb-10"> 
                    
                    {/* Column 1: Login Details */} 
                    <div className="space-y-6"> 
                        <h2 className="text-[20px] font-bold text-[#86644C] mb-2">1. Login Details</h2> 
                        <div className="grid grid-cols-2 gap-6"> 
                            {isEditing ? <EditField label="Name" name="name" value={formData.name} onChange={handleChange} /> : <ViewField label="Name" value={profileData.name} />} 
                            {isEditing ? <EditField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} /> : <ViewField label="Email" value={profileData.email} />} 
                        </div> 
                        {isEditing ? ( 
                            <EditField label="Support Email" name="supportEmail" type="email" value={formData.supportEmail} onChange={handleChange} /> 
                        ) : ( 
                            <ViewField label="Support Email" value={profileData.supportEmail} /> 
                        )} 
                        <div className="space-y-1"> 
                            <p className="text-sm text-gray-500">Phone Number</p> 
                            {isEditing ? ( 
                                <div className="flex items-center gap-3"> 
                                    <input type="text" name="countryCode" value={formData.countryCode} onChange={handleChange} className="w-16 h-10 px-2 text-center bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#86644C] transition-colors" /> 
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#86644C] transition-colors" /> 
                                </div> 
                            ) : ( 
                                <p className="text-sm font-medium text-gray-800"> {profileData.countryCode} {profileData.phoneNumber} </p> 
                            )} 
                        </div> 
                    </div> 

                    {/* Column 2: Address Details */} 
                    <div className="space-y-6"> 
                        <h2 className="text-[20px] font-bold text-[#86644C] mb-2">2. Address Details</h2> 
                        <div className="grid grid-cols-2 gap-6"> 
                            {isEditing ? <EditField label="Address" name="address" value={formData.address} onChange={handleChange} /> : <ViewField label="Address" value={profileData.address} />} 
                            {isEditing ? <EditField label="Country" name="country" value={formData.country} onChange={handleChange} /> : <ViewField label="Country" value={profileData.country} />} 
                        </div> 
                        <div className="grid grid-cols-2 gap-6"> 
                            {isEditing ? <EditField label="State" name="state" value={formData.state} onChange={handleChange} /> : <ViewField label="State" value={profileData.state} />} 
                            {isEditing ? <EditField label="City" name="city" value={formData.city} onChange={handleChange} /> : <ViewField label="City" value={profileData.city} />} 
                        </div> 
                        <div className="w-1/2 pr-3"> 
                            {isEditing ? <EditField label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} /> : <ViewField label="Zip Code" value={profileData.zipCode} />} 
                        </div> 
                    </div> 
                </div> 

                {/* --- Password Section --- */} 
                <div className="space-y-6 mb-8 w-full md:w-1/2 pr-8"> 
                    <h2 className="text-[20px] font-bold text-[#86644C] mb-2">3. Change Password</h2> 
                    {isEditing ? ( 
                        <EditField label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter new password (optional)" /> 
                    ) : ( 
                        <ViewField label="New Password" value="******" /> 
                    )} 
                </div> 

                {/* --- Action Buttons --- */} 
                <div className="flex justify-end gap-3 mt-8"> 
                    {isEditing ? ( 
                        <> 
                            <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 bg-[#86644C] text-white text-sm font-medium rounded hover:bg-[#6c4f3b] transition-colors ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`} > 
                                {isSaving ? 'Saving...' : 'Save'} 
                            </button> 
                            <button onClick={handleCancel} disabled={isSaving} className="px-6 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50 transition-colors" > 
                                Cancel 
                            </button> 
                        </> 
                    ) : ( 
                        <button onClick={() => setIsEditing(true)} className="px-8 py-2.5 bg-[#86644C] text-white text-sm font-medium rounded hover:bg-[#6c4f3b] transition-colors" > 
                            Edit 
                        </button> 
                    )} 
                </div> 
            </div> 
        </div> 
    ); 
}; 

export default ProfilePage;