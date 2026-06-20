import React, { useState } from 'react';
import FilterModal from './Modals/FilterModal';
import useStore from '../../Hooks/useStore';

const WelcomeBanner = ({ onFilterChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilterType, setActiveFilterType] = useState('All');
    const [activePartner, setActivePartner] = useState(null); 
    const userName = useStore((state) => state.userName);
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleApplyFilters = (type, partner) => {
        setActiveFilterType(type);
        setActivePartner(partner);
        
        if (onFilterChange) {
            onFilterChange(type, partner); 
        }
    };

    const getButtonText = () => {
        if (activeFilterType === 'Local Partner' && activePartner) {
            // FIXED: Use srName here as well so the banner shows "Olaf" instead of "undefined undefined"
            return activePartner.srName; 
        }
        if (activeFilterType === 'Admin' || activeFilterType === 'Local Partner') {
            return activeFilterType; 
        }
        return 'All'; 
    };
    

    return (
        <>
            <div className="relative w-full overflow-hidden bg-[linear-gradient(90deg,#72543f_0%,#f3d7c6_75.52%)] shadow-sm ">
              <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-80"
                    style={{
                        backgroundImage: "url('/Images/texture.webp')",
                        backgroundSize: 'contain',
                        backgroundRepeat: 'repeat'
                    }}
                ></div>

                <div className="relative z-10 px-4 py-4 md:px-6 md:pt-6 flex flex-col sm:flex-row md:justify-between justify-start items-start gap-2 md:gap-6 min-h-[176px]">
                    <div>
                        <h1 className="text-white text-xl lg:text-[30px] font-sans font-semibold leading-tight">
                            Welcome, {userName}.
                        </h1>
                        <p className="text-white/90 text-base md:text-base mt-1 font-sans">
                            Monitor your business analytics and statistics
                        </p>
                    </div>
                    <button
                        onClick={openModal} 
                        className="flex items-center gap-2 px-4 py-2 h-[42px] rounded-md border border-white text-white font-sans font-medium hover:bg-white/10 transition-colors shrink-0 max-w-full"
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M0 0h24m0 24H0"></path>
                            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z"></path>
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                        </svg>
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                            {getButtonText()}
                        </span>
                    </button>
                </div>
            </div>

            <FilterModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onApply={handleApplyFilters}
                initialType={activeFilterType}
                initialPartner={activePartner}
            />
        </>
    );
};

export default WelcomeBanner;