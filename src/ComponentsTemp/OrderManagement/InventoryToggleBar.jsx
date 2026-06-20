import React, { useState } from 'react'; 
import PartnerSelectionModal from './Modals/PartnerSelectionModal'; 

const InventoryToggleBar = ({ view, setView, partner, setPartner, onOpenAddProduct, onOpenChangePrice, showActionButtons = true }) => { 
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false); 

    const handleConfirmPartner = (selectedPartnerData) => { 
        setPartner(selectedPartnerData); 
        setView('partner'); 
        setIsPartnerModalOpen(false); 
    }; 

    return ( 
        <> 
            <div className="w-full bg-white rounded-[8px] border border-gray-200 px-6 py-6 shadow-sm flex flex-col md:flex-row items-center justify-between font-sans gap-4"> 
                {/* Left Side: Toggle Buttons */} 
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto"> 
                    <span className="text-gray-700 font-semibold text-[16px] whitespace-nowrap"> 
                        View Products: 
                    </span> 
                    
                    <div className="flex rounded-[8px] border border-gray-200 overflow-hidden"> 
                        {/* Admin Button */} 
                        <button 
                            onClick={() => { 
                                setView('admin'); 
                                setPartner(null); 
                            }} 
                            // Added cursor-pointer here
                            className={`cursor-pointer px-6 py-2.5 text-[14px] font-medium transition-colors ${ 
                                view === 'admin' ? 'bg-brand-brown text-white' : 'bg-white text-gray-700 hover:bg-gray-50' 
                            }`} 
                        > 
                            Admin 
                        </button> 
                        
                        <div className="w-[1px] bg-gray-200"></div> 
                        
                        {/* Local Partner Button */} 
                        <button 
                            onClick={() => setIsPartnerModalOpen(true)} 
                            // Added cursor-pointer here
                            className={`cursor-pointer flex items-center gap-2 px-6 py-2.5 text-[14px] font-medium transition-colors ${ 
                                view === 'partner' ? 'bg-brand-brown text-white' : 'bg-white text-gray-700 hover:bg-gray-50' 
                            }`} 
                        > 
                            {view === 'partner' && partner ? partner.formattedName : 'Local Partner'} 
                            
                            {/* Clear Partner "X" icon */} 
                            {view === 'partner' && partner && ( 
                                <span 
                                    // Added cursor-pointer here as well so the X shows a pointer
                                    className="cursor-pointer ml-1 text-white opacity-75 hover:opacity-100 text-[18px] leading-none z-10" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setPartner(null); 
                                        setView('admin'); 
                                    }} 
                                > 
                                    × 
                                </span> 
                            )} 
                        </button> 
                    </div> 
                </div> 

                {/* Right Side: Action Buttons - Conditionally Rendered ONLY if view is 'partner' */} 
                {showActionButtons && view === 'partner' && ( 
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end"> 
                        <button 
                            onClick={onOpenAddProduct} 
                            // Added cursor-pointer here
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-brand-brown text-white rounded-md font-medium text-[14px] transition-all hover:opacity-90" 
                        > 
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
                            Add Product 
                        </button> 
                        <button 
                            onClick={onOpenChangePrice} 
                            // Added cursor-pointer here
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-brand-brown text-brand-brown rounded-md font-medium text-[14px] transition-all hover:bg-gray-50" 
                        > 
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
                            Change Price 
                        </button> 
                    </div> 
                )} 
            </div> 
            
            <PartnerSelectionModal 
                isOpen={isPartnerModalOpen} 
                onClose={() => setIsPartnerModalOpen(false)} 
                onConfirm={handleConfirmPartner} 
            /> 
        </> 
    ); 
}; 

export default InventoryToggleBar;