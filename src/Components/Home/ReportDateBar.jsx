// import React, { useState, useEffect, useRef } from 'react'; 
// import { ArrowLeft } from 'lucide-react'; 

// const ReportDateBar = ({ 
//     onBackClick, 
//     startDate, 
//     endDate, 
//     datePreset, 
//     isDropdownOpen, 
//     setIsDropdownOpen, 
//     dropdownRef, 
//     presetOptions, 
//     onPresetSelect, 
//     onStartChange, 
//     onEndChange, 
//     onCloseCustom, 
//     activeRole, 
//     filterNames,
//     localPartners,
//     selectedPartnerId,
//     onPartnerChange,
//     showBackButton = true 
// }) => { 
//     // Internal state for the new custom Local Partner Dropdown
//     const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
//     const partnerDropdownRef = useRef(null);

//     // Close partner dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (partnerDropdownRef.current && !partnerDropdownRef.current.contains(e.target)) {
//                 setIsPartnerDropdownOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const formatDisplayDate = (dateString) => { 
//         if (!dateString) return ''; 
//         return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); 
//     }; 

//     // Derive the display name of the selected partner
//     const selectedPartnerName = selectedPartnerId === 'all' 
//         ? 'All Local Partners' 
//         : localPartners?.find(p => p.id.toString() === selectedPartnerId?.toString())?.srName || 'All Local Partners';

//     return ( 
//         <div className="w-full bg-white flex flex-col py-5"> 
//             <div className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between"> 
                
//                 {/* Left Side: Back Button, Date Badge, and Local Partner Dropdown */}
//                 <div className="flex flex-wrap items-center gap-4"> 
                    
//                     {showBackButton && (
//                         <button onClick={onBackClick} className="text-black hover:bg-black hover:text-white rounded-full transition-colors p-1"> 
//                             <ArrowLeft/> 
//                         </button> 
//                     )}

//                     <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-[14px]"> 
//                         <span className="text-gray-500 font-medium mr-2">Date Range:</span> 
//                         <span className="text-gray-900 font-semibold">{formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</span> 
//                     </div> 

//                     {/* NEW: Fully Styled Custom Local Partner Dropdown */}
//                     {localPartners && localPartners.length > 0 && (
//                         <div className="relative font-sans" ref={partnerDropdownRef}> 
//                             <div onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)} className="flex items-center justify-between w-[220px] pl-3 pr-1.5 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors"> 
//                                 <span className="text-base font-semibold text-input-hover truncate"> 
//                                     {selectedPartnerName} 
//                                 </span> 
//                                 <div className="flex items-center flex-shrink-0"> 
//                                     <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
//                                     <div className={`p-1 text-input-hover transition-transform duration-200 ${isPartnerDropdownOpen ? 'rotate-180' : ''}`}> 
//                                         <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"> 
//                                             <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" /> 
//                                         </svg> 
//                                     </div> 
//                                 </div> 
//                             </div> 
                            
//                             {/* Scrollable dropdown options menu matching the preset menu style */}
//                             {isPartnerDropdownOpen && ( 
//                                 <div className="absolute top-full right-0 w-full mt-1 bg-input-brown rounded shadow-xl z-50 py-1 max-h-[300px] overflow-y-auto custom-scrollbar"> 
//                                     <div 
//                                         onClick={() => { onPartnerChange('all'); setIsPartnerDropdownOpen(false); }} 
//                                         className="px-4 py-2 text-[14px] font-medium text-white hover:bg-input-hover cursor-pointer truncate"
//                                     > 
//                                         All Local Partners 
//                                     </div>
//                                     {localPartners.map((partner) => ( 
//                                         <div 
//                                             key={partner.id} 
//                                             onClick={() => { onPartnerChange(partner.id); setIsPartnerDropdownOpen(false); }} 
//                                             className="px-4 py-2 text-[14px] font-medium text-white hover:bg-input-hover cursor-pointer truncate"
//                                         > 
//                                             {partner.srName} 
//                                         </div> 
//                                     ))} 
//                                 </div> 
//                             )} 
//                         </div> 
//                     )}
//                 </div> 

//                 {/* Right Side: Date Preset Selectors */}
//                 <div className="flex items-center"> 
//                     {datePreset === 'Custom' ? ( 
//                         <div className="flex items-center gap-3 animate-fadeIn"> 
//                             <div className="flex items-center gap-2"> 
//                                 <span className="text-base font-semibold text-[#212b36]">Start Date:</span> 
//                                 <input type="date" value={startDate} onChange={onStartChange} className="px-3 py-2 bg-white text-[#212b36] border border-gray-300 rounded text-sm focus:outline-none focus:border-[#86644C] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer" /> 
//                             </div> 
//                             <div className="flex items-center gap-2"> 
//                                 <span className="text-base font-semibold text-[#212b36]">End Date:</span> 
//                                 <input type="date" value={endDate} onChange={onEndChange} className="px-3 py-2 bg-white text-[#212b36] border border-gray-300 rounded text-sm focus:outline-none focus:border-[#86644C] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer" /> 
//                             </div> 
//                             <button onClick={onCloseCustom} className="ml-1 w-[42px] h-[42px] flex items-center justify-center border border-[#86644C] bg-white text-[#86644C] rounded-lg hover:bg-brand-brown hover:text-white transition-colors"> 
//                                 <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"> <path d="M 15.854 12.854 C 15.854 12.854 15.854 12.854 15.854 12.854 L 11 8 L 15.854 3.146 C 15.854 3.146 15.854 3.146 15.854 3.146 C 15.906 3.094 15.944 3.033 15.968 2.968 C 16.034 2.79 15.996 2.582 15.854 2.439 L 13.561 0.146 C 13.418 0.0029999 13.21 -0.0350001 13.032 0.0319999 C 12.967 0.0559999 12.906 0.0939999 12.854 0.146 C 12.854 0.146 12.854 0.146 12.854 0.146 L 8 5 L 3.146 0.146 C 3.146 0.146 3.146 0.146 3.146 0.146 C 3.094 0.0939999 3.033 0.0559999 2.968 0.0319999 C 2.79 -0.0340001 2.582 0.00299991 2.439 0.146 L 0.145999 2.439 C 0.00299895 2.582 -0.0350011 2.79 0.031999 2.968 C 0.055999 3.033 0.093999 3.094 0.145999 3.146 C 0.145999 3.146 0.145999 3.146 0.145999 3.146 L 5 8 L 0.145999 12.854 C 0.145999 12.854 0.145999 12.854 0.145999 12.854 C 0.093999 12.906 0.055999 12.967 0.031999 13.032 C -0.034001 13.21 0.00299895 13.418 0.145999 13.561 L 2.439 15.854 C 2.582 15.997 2.79 16.035 2.968 15.968 C 3.033 15.944 3.094 15.906 3.146 15.854 C 3.146 15.854 3.146 15.854 3.146 15.854 L 8 11 L 12.854 15.854 C 12.854 15.854 12.854 15.854 12.854 15.854 C 12.906 15.906 12.967 15.944 13.032 15.968 C 13.21 16.034 13.418 15.997 13.561 15.854 L 15.854 13.561 C 15.997 13.418 16.035 13.21 15.968 13.032 C 15.944 12.967 15.906 12.906 15.854 12.854 Z" /> </svg> 
//                             </button> 
//                         </div> 
//                     ) : ( 
//                         <div className="relative" ref={dropdownRef}> 
//                             <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between w-[170px] pl-3 pr-1.5 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors"> 
//                                 <span className="text-base font-semibold text-input-hover truncate"> {datePreset} </span> 
//                                 <div className="flex items-center flex-shrink-0"> 
//                                     <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
//                                     <div className={`p-1 text-input-hover transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}> 
//                                         <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"> <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" /> </svg> 
//                                     </div> 
//                                 </div> 
//                             </div> 
//                             {isDropdownOpen && ( 
//                                 <div className="absolute top-full right-0 w-full mt-1 bg-input-brown rounded shadow-xl z-50 py-1 max-h-[300px] overflow-y-auto custom-scrollbar"> 
//                                     {presetOptions.map((option) => ( 
//                                         <div key={option} onClick={() => onPresetSelect(option)} className="px-4 py-2 text-[14px] font-medium text-white hover:bg-input-hover cursor-pointer"> 
//                                             {option} 
//                                         </div> 
//                                     ))} 
//                                 </div> 
//                             )} 
//                         </div> 
//                     )} 
//                 </div> 
//             </div> 
//             {activeRole && ( 
//                 <div className="flex items-center gap-2 w-max ml-auto px-4 mx-10 py-2 bg-gray-50 rounded-md"> 
//                     <span className="text-sm font- font-medium text-gray-600">Filter:</span> 
//                     <span className="text-sm font-sans font-semibold text-gray-900"> {activeRole === 'admin' ? 'Admin' : activeRole === 'local_partner' ? 'Local Partners' : activeRole === 'employee' ? 'Employee' : 'All'} </span> 
//                 </div> 
//             )} 
//         </div> 
//     ); 
// }; 

// export default ReportDateBar;




import React, { useState, useEffect, useRef } from 'react'; 
import { ArrowLeft } from 'lucide-react'; 

const ReportDateBar = ({ 
    onBackClick, 
    startDate, 
    endDate, 
    datePreset, 
    isDropdownOpen, 
    setIsDropdownOpen, 
    dropdownRef, 
    presetOptions, 
    onPresetSelect, 
    onStartChange, 
    onEndChange, 
    onCloseCustom, 
    activeRole, 
    filterNames, 
    localPartners, 
    selectedPartnerId, 
    onPartnerChange, 
    showBackButton = true,
    showDateRangeBar = true // NEW PROP: Defaults to true so it doesn't break your existing pages
}) => { 
    // Internal state for the new custom Local Partner Dropdown 
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false); 
    const partnerDropdownRef = useRef(null); 

    // Close partner dropdown when clicking outside 
    useEffect(() => { 
        const handleClickOutside = (e) => { 
            if (partnerDropdownRef.current && !partnerDropdownRef.current.contains(e.target)) { 
                setIsPartnerDropdownOpen(false); 
            } 
        }; 
        document.addEventListener('mousedown', handleClickOutside); 
        return () => document.removeEventListener('mousedown', handleClickOutside); 
    }, []); 

    const formatDisplayDate = (dateString) => { 
        if (!dateString) return ''; 
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); 
    }; 

    // Derive the display name of the selected partner 
    const selectedPartnerName = selectedPartnerId === 'all' 
        ? 'All Local Partners' 
        : localPartners?.find(p => p.id.toString() === selectedPartnerId?.toString())?.srName || 'All Local Partners'; 

    return ( 
        <div className="w-full bg-white flex flex-col py-5"> 
            <div className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between"> 
                
                {/* Left Side: Back Button, Date Badge, and Local Partner Dropdown */} 
                <div className="flex flex-wrap items-center gap-4"> 
                    {showBackButton && ( 
                        <button onClick={onBackClick} className="text-black hover:bg-black hover:text-white rounded-full transition-colors p-1"> 
                            <ArrowLeft/> 
                        </button> 
                    )} 
                    
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-[14px]"> 
                        <span className="text-gray-500 font-medium mr-2">Date Range:</span> 
                        <span className="text-gray-900 font-semibold">{formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</span> 
                    </div> 
                    
                    {/* NEW: Fully Styled Custom Local Partner Dropdown */} 
                    {localPartners && localPartners.length > 0 && ( 
                        <div className="relative font-sans" ref={partnerDropdownRef}> 
                            <div onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)} className="flex items-center justify-between w-[220px] pl-3 pr-1.5 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors"> 
                                <span className="text-base font-semibold text-input-hover truncate"> 
                                    {selectedPartnerName} 
                                </span> 
                                <div className="flex items-center flex-shrink-0"> 
                                    <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
                                    <div className={`p-1 text-input-hover transition-transform duration-200 ${isPartnerDropdownOpen ? 'rotate-180' : ''}`}> 
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"> 
                                            <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" /> 
                                        </svg> 
                                    </div> 
                                </div> 
                            </div> 
                            {/* Scrollable dropdown options menu matching the preset menu style */} 
                            {isPartnerDropdownOpen && ( 
                                <div className="absolute top-full right-0 w-full mt-1 bg-input-brown rounded shadow-xl z-50 py-1 max-h-[300px] overflow-y-auto custom-scrollbar"> 
                                    <div onClick={() => { onPartnerChange('all'); setIsPartnerDropdownOpen(false); }} className="px-4 py-2 text-[14px] font-medium text-white hover:bg-input-hover cursor-pointer truncate" > 
                                        All Local Partners 
                                    </div> 
                                    {localPartners.map((partner) => ( 
                                        <div key={partner.id} onClick={() => { onPartnerChange(partner.id); setIsPartnerDropdownOpen(false); }} className="px-4 py-2 text-[14px] font-medium text-white hover:bg-input-hover cursor-pointer truncate" > 
                                            {partner.srName} 
                                        </div> 
                                    ))} 
                                </div> 
                            )} 
                        </div> 
                    )} 
                </div> 

                {/* Right Side: Date Preset Selectors (NOW CONDITIONALLY RENDERED) */} 
                {showDateRangeBar && (
                    <div className="flex items-center"> 
                        {datePreset === 'Custom' ? ( 
                            <div className="flex items-center gap-3 animate-fadeIn"> 
                                <div className="flex items-center gap-2"> 
                                    <span className="text-base font-semibold text-[#212b36]">Start Date:</span> 
                                    <input type="date" value={startDate} onChange={onStartChange} className="px-3 py-2 bg-white text-[#212b36] border border-gray-300 rounded text-sm focus:outline-none focus:border-[#86644C] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer" /> 
                                </div> 
                                <div className="flex items-center gap-2"> 
                                    <span className="text-base font-semibold text-[#212b36]">End Date:</span> 
                                    <input type="date" value={endDate} onChange={onEndChange} className="px-3 py-2 bg-white text-[#212b36] border border-gray-300 rounded text-sm focus:outline-none focus:border-[#86644C] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer" /> 
                                </div> 
                                <button onClick={onCloseCustom} className="ml-1 w-[42px] h-[42px] flex items-center justify-center border border-[#86644C] bg-white text-[#86644C] rounded-lg hover:bg-brand-brown hover:text-white transition-colors"> 
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"> 
                                        <path d="M 15.854 12.854 C 15.854 12.854 15.854 12.854 15.854 12.854 L 11 8 L 15.854 3.146 C 15.854 3.146 15.854 3.146 15.854 3.146 C 15.906 3.094 15.944 3.033 15.968 2.968 C 16.034 2.79 15.996 2.582 15.854 2.439 L 13.561 0.146 C 13.418 0.0029999 13.21 -0.0350001 13.032 0.0319999 C 12.967 0.0559999 12.906 0.0939999 12.854 0.146 C 12.854 0.146 12.854 0.146 12.854 0.146 L 8 5 L 3.146 0.146 C 3.146 0.146 3.146 0.146 3.146 0.146 C 3.094 0.0939999 3.033 0.0559999 2.968 0.0319999 C 2.79 -0.0340001 2.582 0.00299991 2.439 0.146 L 0.145999 2.439 C 0.00299895 2.582 -0.0350011 2.79 0.031999 2.968 C 0.055999 3.033 0.093999 3.094 0.145999 3.146 C 0.145999 3.146 0.145999 3.146 0.145999 3.146 L 5 8 L 0.145999 12.854 C 0.145999 12.854 0.145999 12.854 0.145999 12.854 C 0.093999 12.906 0.055999 12.967 0.031999 13.032 C -0.034001 13.21 0.00299895 13.418 0.145999 13.561 L 2.439 15.854 C 2.582 15.997 2.79 16.035 2.968 15.968 C 3.033 15.944 3.094 15.906 3.146 15.854 C 3.146 15.854 3.146 15.854 3.146 15.854 L 8 11 L 12.854 15.854 C 12.854 15.854 12.854 15.854 12.854 15.854 C 12.906 15.906 12.967 15.944 13.032 15.968 C 13.21 16.034 13.418 15.997 13.561 15.854 L 15.854 13.561 C 15.997 13.418 16.035 13.21 15.968 13.032 C 15.944 12.967 15.906 12.906 15.854 12.854 Z" /> 
                                    </svg> 
                                </button> 
                            </div> 
                        ) : ( 
                            <div className="relative" ref={dropdownRef}> 
                                <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between w-[170px] pl-3 pr-1.5 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors"> 
                                    <span className="text-base font-semibold text-input-hover truncate"> 
                                        {datePreset} 
                                    </span> 
                                    <div className="flex items-center flex-shrink-0"> 
                                        <span className="w-[1px] h-5 bg-[#ccc] mx-1.5"></span> 
                                        <div className={`p-1 text-input-hover transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}> 
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"> 
                                                <path d="M 4.516 7.548 C 4.952 7.102 5.559 7.067 6.092 7.548 L 10 11.295 L 13.908 7.548 C 14.441 7.067 15.049 7.102 15.482 7.548 C 15.918 7.993 15.89 8.745 15.482 9.163 C 15.076 9.581 10.787 13.665 10.787 13.665 C 10.57 13.888 10.285 14 10 14 S 9.43 13.888 9.211 13.665 C 9.211 13.665 4.924 9.581 4.516 9.163 S 4.08 7.993 4.516 7.548 Z" /> 
                                            </svg> 
                                        </div> 
                                    </div> 
                                </div> 
                                {isDropdownOpen && ( 
                                    <div className="absolute top-full right-0 w-full mt-1 bg-input-brown rounded shadow-xl z-50 py-1 max-h-[300px] overflow-y-auto custom-scrollbar"> 
                                        {presetOptions.map((option) => ( 
                                            <div key={option} onClick={() => onPresetSelect(option)} className="px-4 py-2 text-[14px] font-medium text-white hover:bg-input-hover cursor-pointer"> 
                                                {option} 
                                            </div> 
                                        ))} 
                                    </div> 
                                )} 
                            </div> 
                        )} 
                    </div> 
                )}
            </div> 
            
            {activeRole && ( 
                <div className="flex items-center gap-2 w-max ml-auto px-4 mx-10 py-2 bg-gray-50 rounded-md"> 
                    <span className="text-sm font- font-medium text-gray-600">Filter:</span> 
                    <span className="text-sm font-sans font-semibold text-gray-900"> 
                        {activeRole === 'admin' ? 'Admin' : activeRole === 'local_partner' ? 'Local Partners' : activeRole === 'employee' ? 'Employee' : 'All'} 
                    </span> 
                </div> 
            )} 
        </div> 
    ); 
}; 

export default ReportDateBar;