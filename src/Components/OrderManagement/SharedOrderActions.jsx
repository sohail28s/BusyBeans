
import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 

export const CustomSelect = ({ label, options, value, onChange, placeholder, disabled, emptyMessage }) => { 
    const [isOpen, setIsOpen] = useState(false); 
    const selectRef = useRef(null); 
    
    useEffect(() => { 
        const handleClickOutside = (event) => { 
            if (selectRef.current && !selectRef.current.contains(event.target)) { 
                setIsOpen(false); 
            } 
        }; 
        document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, []); 

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder; 
    
    return ( 
        <div className="space-y-2 relative w-full" ref={selectRef}> 
            {label && <label className="block font-medium text-gray-900">{label}</label>} 
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)} 
                className={`w-full h-[48px] bg-white border border-gray-300 rounded-md flex items-center justify-between px-3 outline-none transition-shadow ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`} 
            > 
                <span className={`truncate text-[16px] ${!value ? 'text-gray-400' : 'text-gray-900'}`}> 
                    {selectedLabel} 
                </span> 
                <svg className={`w-4 h-4 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /> 
                </svg> 
            </div> 
            
            {isOpen && ( 
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-[250px] overflow-y-auto py-1"> 
                    {options.length > 0 ? ( 
                        options.map(opt => { 
                            const isSelected = opt.value === value; 
                            return ( 
                                <div 
                                    key={opt.value} 
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }} 
                                    className={`px-4 py-3 text-[16px] cursor-pointer transition-colors ${ isSelected ? 'bg-menu-active-blue text-blue-700' : 'bg-white text-gray-800 hover:bg-gray-50' }`} 
                                > 
                                    {opt.label} 
                                </div> 
                            ); 
                        }) 
                    ) : ( 
                        <div className="px-4 py-3 text-[16px] text-gray-500 italic">{emptyMessage || "No options available"}</div> 
                    )} 
                </div> 
            )} 
        </div> 
    ); 
}; 

export const ActionModal = ({ isOpen, onClose, mode }) => { 
    const [orderId, setOrderId] = useState(''); 
    const [orderType, setOrderType] = useState(''); 
    const [emailType, setEmailType] = useState('order-confirmation'); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    if (!isOpen) return null; 
    
    // --- Dynamic Config based on 'mode' prop --- 
    const isSendMode = mode === 'send'; 
    const title = isSendMode ? 'Send Email' : 'Delete Invoice'; 
    const btnText = isSendMode ? 'Send' : 'Delete'; 
    
    // Dynamic Labels & Placeholders 
    const typeLabel = isSendMode ? 'Order Type*' : 'User Type*'; 
    const typePlaceholder = isSendMode ? 'Select Order Type' : 'Select User Type'; 
    
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        if (!orderId.trim()) { toast.error('Order ID is required.'); return; } 
        if (!orderType) { toast.error(`Please ${typePlaceholder.toLowerCase()}.`); return; } 
        
        setIsSubmitting(true); 
        try { 
            let payload; 
            let endpoint; 
            if (isSendMode) { 
                payload = { orderId: orderId.trim(), orderType: orderType, emailType: emailType }; 
                endpoint = 'https://testingbb.trimworldwide.com/api/v1/admin/order-management/email-helper'; 
            } else { 
                payload = { id: orderId.trim(), orderType: orderType }; 
                endpoint = 'https://testingbb.trimworldwide.com/api/v1/admin/order-management/delete-invoice'; 
            } 
            
            const res = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
            if (res.data.status === 'success' || res.status === 200) { 
                toast.success(`${isSendMode ? 'Email sent' : 'Invoice deleted'} successfully!`); 
                setTimeout(() => { setOrderId(''); setOrderType(''); onClose(); }, 0); 
            } else { 
                throw new Error(res.data.message || `Failed to ${isSendMode ? 'send email' : 'delete invoice'}.`); 
            } 
        } catch (error) { 
            console.error(`${mode} action failed:`, error); 
            const errorMsg = error.response?.data?.message || error.message || "Action failed. Please check the Order ID."; 
            toast.error(errorMsg); 
        } finally { 
            setIsSubmitting(false); 
        } 
    }; 
    
    const ORDER_TYPE_OPTIONS = [ 
        { label: "Customer", value: "customer" }, 
        { label: "Local Partner", value: "local-partner" } 
    ]; 
    
    const EMAIL_TYPE_OPTIONS = [ 
        { label: "Order Confirmation", value: "order-confirmation" }, 
        { label: "Order Dispatch", value: "order-dispatch" }, 
        { label: "Send Invoice", value: "send-invoice" }, 
        { label: "Invoice Reminder", value: "invoice-reminder" }, 
        { label: "Paid Invoice", value: "paid-invoice" }, 
        { label: "Order Shipped", value: "order-shipped" } 
    ]; 

    return ( 
        
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 font-sans "> 
            <div className="bg-white rounded-lg shadow-xl w-[90%] md:w-[600px] flex flex-col relative animate-fade-in overflow-hidden min-h-[300px]"> 
                
                {isSubmitting && ( 
                    <div className="absolute inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg"> 
                        <h2 className="absolute top-[24px] text-[24px] font-sans font-semibold text-gray-900 tracking-wide">{title}</h2> 
                        <img src="/path-to-your-coffee-cup-animation.gif" alt="Loading..." className="w-[120px] h-[120px] object-contain drop-shadow-md animate-pulse" /> 
                    </div> 
                )} 

                <div className="relative p-6 flex items-center justify-center shrink-0"> 
                    <h2 className="font-bold text-2xl text-center text-gray-900">{title}</h2> 
                    <button 
                        onClick={onClose} 
                        disabled={isSubmitting} 
                        className="absolute right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 outline-none"
                    > 
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z" fill="currentColor"></path>
                        </svg>
                    </button> 
                </div> 

                <div className="flex-1 px-6 pb-6 pt-2"> 
                    <form onSubmit={handleSubmit} className="space-y-4"> 
                        <div className="space-y-2 flex flex-col"> 
                            <label className="font-medium text-gray-900">Order ID*</label> 
                            {/* FIXED INPUT FIELD: Explicit bg-white, text-gray-900, placeholder-gray-400 */}
                            <input 
                                type="text" 
                                placeholder="Enter Order ID" 
                                value={orderId} 
                                onChange={(e) => setOrderId(e.target.value)} 
                                className="w-full h-[48px] bg-white border border-gray-300 rounded-md px-3 outline-none text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-gray-400 transition-colors" 
                            /> 
                        </div> 
                        
                        <CustomSelect 
                            label={typeLabel} 
                            options={ORDER_TYPE_OPTIONS} 
                            value={orderType} 
                            onChange={setOrderType} 
                            disabled={isSubmitting} 
                            placeholder={typePlaceholder} 
                        /> 

                        {isSendMode && ( 
                            <CustomSelect 
                                label="Email Type*" 
                                options={EMAIL_TYPE_OPTIONS} 
                                value={emailType} 
                                onChange={setEmailType} 
                                disabled={isSubmitting} 
                                placeholder="Select Email Type"
                            /> 
                        )} 

                        <div className="flex justify-end gap-3 pt-4"> 
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={isSubmitting} 
                                className="border border-brand-brown text-brand-brown px-6 py-3 rounded-lg hover:bg-brand-brown hover:text-white transition-colors disabled:opacity-50 font-medium" 
                            > 
                                Cancel 
                            </button> 
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !orderId.trim() || !orderType} 
                                className="bg-brand-brown text-white px-10 py-3 rounded-lg border border-brand-brown hover:bg-white hover:text-brand-brown transition-colors disabled:opacity-50 font-medium" 
                            > 
                                {btnText} 
                            </button> 
                        </div> 
                    </form> 
                </div> 
            </div> 
        </div> 
    ); 
}; 

export const ActionPageLayout = ({ title, description, buttonText, mode }) => { 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    
    return ( 
        // 1. Changed wrapper font to font-sans
        <div className="w-full min-h-[calc(100vh-100px)] bg-white flex flex-col items-center justify-center font-sans px-4 lg:pt-20"> 
            <div className="text-center max-w-2xl"> 
                
                {/* 2. Explicitly added font-sans to the Title */}
                <h1 className="text-4xl font-bold font-sans text-gray-800 mb-4 tracking-tight">
                    {title}
                </h1> 
                
                {/* 3. Explicitly added font-sans to the Description */}
                <p className="text-[16px] font-sans text-gray-500 leading-relaxed mb-8 ">
                    {description}
                </p> 
                
                {/* 4. Explicitly added font-sans to the Button */}
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="h-[56px] px-6 bg-brand-brown text-white text-[18px] font-semibold font-sans rounded-lg shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200 focus:outline-none" 
                > 
                    {buttonText} 
                </button> 
                
            </div> 
            
            {/* The modal inside will still use its own font-nunito class defined earlier in the file */}
            <ActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode={mode} /> 
        </div> 
    ); 
};