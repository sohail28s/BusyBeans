

import React from 'react';

const ReportHeader = ({ title, subtitle, dateRange, searchTerm, setSearchTerm, onDownloadClick, onFilterClick , showFilterButton }) => {
    // Put this right before your return() statement
  return (
    <div className="w-full mb-6 font-sans">
        <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl  font-bold text-gray-900">{title}</h2>
            {/* Swapped hardcoded text with the subtitle prop so it dynamically shows the customer/product name! */}
            <p className="text-[#374151] text-lg uppercase tracking-wide mt-1">{subtitle || "BUSY BEAN COFFEE, INC"}</p>
            <p className="text-gray-500 text-base mt-1">{dateRange}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Search Bar - Set to white bg, gray text, and 42px height to match buttons */}
            <div className="relative w-full sm:w-80">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-[42px] pl-9 pr-4 bg-white text-gray-700 text-[16px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#86644C] focus:ring-1 focus:ring-[#86644C] transition-colors"
                />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                
                {/* Download Button matching your exact CSS reference */}
                <button 
                    onClick={onDownloadClick} 
                    className="flex items-center justify-center gap-2 h-[42px] px-4 bg-white text-[#86644C] border border-[#86644C] rounded-[6px] font-medium text-[16px] hover:bg-[#86644C] hover:text-white transition-colors duration-150"
                >
                    Download CSV
                </button>

                {/* Filter Button matching the Download button */}
                {showFilterButton && (
                    <button 
                        onClick={onFilterClick} 
                        className="flex items-center justify-center gap-2 h-[42px] px-4 bg-white text-[#86644C] border border-[#86644C] rounded-[6px] font-medium text-[16px] hover:bg-[#86644C] hover:text-white transition-colors duration-150 group"
                    >
                        <svg className="w-4 h-4 fill-current group-hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z"></path>
                        </svg>
                        Filters
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default ReportHeader;