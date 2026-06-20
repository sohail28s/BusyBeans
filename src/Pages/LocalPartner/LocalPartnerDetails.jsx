import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { AddressModal } from '../../ComponentsTemp/Shared/AddressModal'; 
import { formatDate } from '../../utils/orderUtils'; 

const AddressBlock = ({ addressObj, phone }) => { 
    if (!addressObj) return <span className="text-gray-500 italic text-sm">No address provided</span>; 
    
    const line1 = addressObj.address || addressObj.addressLineOne; 
    const line2 = addressObj.addressLineTwo || addressObj.territoryName; 
    const town = addressObj.city || addressObj.town; 
    const cityStateZip = [town, addressObj.state, addressObj.zipCode].filter(Boolean).join(', '); 
    
    return ( 
        <div className="text-sm text-gray-700 space-y-1 uppercase"> 
            {line1 && <div>{line1}</div>} 
            {line2 && <div>{line2}</div>} 
            {cityStateZip && <div>{cityStateZip}</div>} 
            {addressObj.country && <div>{addressObj.country}</div>} 
            {phone && <div>{phone}</div>} 
        </div> 
    ); 
}; 

const InfoRow = ({ label, value, isLink, linkType, linkValue, isBlue }) => ( 
    <div className="flex items-center h-12 border-b border-gray-200 [&>span]:w-44 last:border-0"> 
        <span className="text-gray-500 font-medium text-[14px]">{label}</span> 
        {isLink ? ( 
            <a href={`${linkType}:${linkValue}`} className="text-blue-600 font-medium text-[14px] hover:underline"> 
                {value || "—"} 
            </a> 
        ) : ( 
            <div className={`text-[14px] ${isBlue ? 'text-blue-600' : 'font-semibold text-gray-900'}`}> 
                {value || "—"} 
            </div> 
        )} 
    </div> 
); 

const EditableAddressCard = ({ addressObj, onEditClick }) => ( 
    <div className="bg-gray-50 p-4 rounded-md flex flex-col justify-between border border-gray-100"> 
        <AddressBlock addressObj={addressObj} /> 
        <div className="pt-4"> 
            <button onClick={onEditClick} className="text-xs px-4 py-1.5 rounded-[4px] border border-gray-300 text-gray-700 font-medium hover:bg-gray-200 transition-colors" > 
                Edit 
            </button> 
        </div> 
    </div> 
); 

const LocalPartnerDetails = () => { 
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
    
    const [partnerData, setPartnerData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); 
    const [selectedAddressData, setSelectedAddressData] = useState(null); 
    const [addressModalType, setAddressModalType] = useState('shipping'); 

    const getAuthConfig = () => ({ 
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } 
    }); 

    const fetchPartnerDetails = useCallback(async () => { 
        setIsLoading(true); 
        setIsGlobalLoading(true); 
        try { 
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/sales-rep/${id}`, getAuthConfig()); 
            setPartnerData(res.data?.data?.data || res.data?.data || null); 
        } catch (error) { 
            toast.error("Failed to load partner details."); 
            navigate('/sale-representative'); 
        } finally { 
            setIsLoading(false); 
            setIsGlobalLoading(false); 
        } 
    }, [id, navigate, setIsGlobalLoading]); 

    useEffect(() => { 
        fetchPartnerDetails(); 
    }, [fetchPartnerDetails]); 

    useEffect(() => { 
        setShowProfile(false); 
        if (!partnerData) return; 

        const customTitleNode = ( 
            <div className="flex items-center text-2xl font-bold text-gray-800"> 
                <span>Local partner / <span className="text-[#86644c] font-bold">{partnerData.srName}</span></span> 
                <span className={`ml-1 px-1 rounded-2xl text-sm font-medium ${partnerData.status ? 'bg-[#219653] text-white' : 'bg-[#ef4444] text-white'}`}> 
                    {partnerData.status ? 'Active' : 'Inactive'} 
                </span> 
            </div> 
        ); 

        const customActionsNode = ( 
            <div className="flex items-center gap-4 text-[13px] font-medium text-gray-700"> 
                <button onClick={() => navigate(`/sale-representative/edit/${id}`)} className="text-[#3b82f6] hover:underline transition-colors" > 
                    Edit Profile 
                </button> 
                <span className="text-gray-300">|</span> 
                <button onClick={() => navigate(`/sale-representative/pending-pullouts/${id}`)} className="text-[#3b82f6] hover:underline transition-colors" > 
                    Pending Pullouts 
                </button> 
            </div> 
        ); 

        setTitle(customTitleNode); 
        setActions(customActionsNode); 

        return () => { 
            setTitle(''); 
            setActions(null); 
            setShowProfile(true); 
        }; 
    }, [partnerData, navigate, setTitle, setActions, id, setShowProfile]); 

    const primaryPhone = partnerData?.countryCode && partnerData?.phoneNumber ? `${partnerData.countryCode} ${partnerData.phoneNumber}` : null; 

    const handleOpenAddressModal = (type, addressData = null) => { 
        setAddressModalType(type);
        setSelectedAddressData(addressData); 
        setIsAddressModalOpen(true); 
    }; 

    if (isLoading || !partnerData) return null; 

    return ( 
        <div className="w-full min-h-[calc(100vh-100px)] bg-white p-6 lg:p-8 font-sans flex justify-center items-start "> 
            <div className="w-full max-w-[1200px] bg-white border border-[#e2e8f0] rounded-[8px] p-8 shadow-[0px_8px_13px_-3px_rgba(0,0,0,0.07)] space-y-8"> 
                
                {/* --- TOP GRID: Info & Main Address --- */} 
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12"> 
                    <div> 
                        <InfoRow label="Contact" value={partnerData.srName} /> 
                        <InfoRow label="Email" value={partnerData.email} isLink linkType="mailto" linkValue={partnerData.email} /> 
                        <InfoRow label="Partner Type" value={partnerData.partnerType} /> 
                        <InfoRow label="Created At" value={formatDate(partnerData.createdAt)} /> 
                        <InfoRow label="Credit Limits" value={partnerData.creditLimit || ''} /> 
                        <InfoRow label="Account Connected" value={partnerData.isAccountConnected ? "Yes" : "No"} /> 
                        <InfoRow label="Bank Account Connected" value={partnerData.defaultBankAccount ? "Yes" : "No"} /> 
                        <InfoRow label="Stripe Customer Connected" value={partnerData.stripeCustomerId ? "Yes" : "No"} /> 
                    </div> 
                    <div className="pt-2"> 
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Address</h3> 
                        <AddressBlock addressObj={partnerData} phone={primaryPhone} /> 
                    </div> 
                </div> 

                {/* --- BUTTONS SECTION --- */} 
                <div className="w-full flex justify-end gap-3 pt-4"> 
                    <button 
                        onClick={() => handleOpenAddressModal('shipping', null)} 
                        className="rounded-lg border border-[#86644c] text-[#86644c] hover:bg-[#86644c] hover:text-white transition-colors duration-150 shadow-sm px-6 py-2.5 font-medium text-[14px]" 
                    > 
                        Add Shipping Address 
                    </button> 
                    <button 
                        onClick={() => handleOpenAddressModal('billing', null)} 
                        className={`rounded-lg border px-6 py-2.5 font-medium text-[14px] shadow-sm transition-colors duration-150 ${partnerData.billingAddresses?.length > 0 ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-[#86644c] bg-[#86644c] text-white hover:bg-[#735541]' }`} 
                        disabled={partnerData.billingAddresses?.length > 0} 
                        title={partnerData.billingAddresses?.length > 0 ? "Only one billing address is allowed" : "Add Billing Address"} 
                    > 
                        Add Billing Address 
                    </button> 
                </div> 

                {/* --- BILLING ADDRESSES GRID --- */} 
                <div className="pt-4 border-t border-gray-100"> 
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Address</h2> 
                    {partnerData.billingAddresses?.length > 0 ? ( 
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> 
                            {partnerData.billingAddresses.map(addr => ( 
                                <EditableAddressCard 
                                    key={addr.id} 
                                    addressObj={addr} 
                                    onEditClick={() => handleOpenAddressModal('billing', addr)} 
                                /> 
                            ))} 
                        </div> 
                    ) : ( 
                        <p className="text-gray-400 italic text-[14px]">No billing address added.</p> 
                    )} 
                </div> 

                {/* --- ADDITIONAL SHIPPING ADDRESSES GRID --- */} 
                <div className="pt-4"> 
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Shipping Addresses</h2> 
                    {partnerData.addresses?.length > 0 ? ( 
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> 
                            {partnerData.addresses.map(addr => ( 
                                <EditableAddressCard 
                                    key={addr.id} 
                                    addressObj={addr} 
                                    onEditClick={() => handleOpenAddressModal('shipping', addr)} 
                                /> 
                            ))} 
                        </div> 
                    ) : ( 
                        <p className="text-gray-400 italic text-[14px]">No additional shipping addresses added.</p> 
                    )} 
                </div> 
            </div> 

            {/* FIX: Mount the modal conditionally so it resets its state entirely every time it opens! */}
            {isAddressModalOpen && (
                <AddressModal 
                    isOpen={isAddressModalOpen} 
                    onClose={() => {
                        setIsAddressModalOpen(false);
                        setSelectedAddressData(null); // Clear data entirely on close
                    }} 
                    customerId={id} 
                    userType="sales-rep" 
                    addressType={addressModalType} 
                    initialData={selectedAddressData} 
                    onSuccess={fetchPartnerDetails}
                /> 
            )}
        </div> 
    ); 
}; 

export default LocalPartnerDetails;