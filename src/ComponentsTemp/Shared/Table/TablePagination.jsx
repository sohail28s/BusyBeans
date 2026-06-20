import React, { useState, useEffect, useRef } from 'react';

const PaginationSelect = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative font-sans" ref={selectRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-[8px] cursor-pointer text-[#4b5563] hover:text-[#3b82f6] transition-colors">
                <span className="text-[16px]">{value}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
            </div>
            {isOpen && (
                <div className="absolute bottom-[calc(100%+8px)] right-0 w-[80px] bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-[9999] py-1">
                    {options.map(opt => (
                        <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`px-4 py-2 text-[14px] cursor-pointer transition-colors text-center ${opt === value ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-white text-[#4b5563] hover:bg-gray-50'}`}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TablePagination = ({ 
    pagination, 
    setPagination, 
    variant = 'detailed', // 'detailed' | 'simple'
    limitOptions = [10, 25, 50, 100] // Default custom entries
}) => {
    // Math for total pages and page ranges
    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
    let startPage = Math.max(1, pagination.page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    const pageNumbers = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);

    // Math for the "Results X-Y" text
    const startItem = pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1;
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

    // Handlers
    const handlePageChange = (newPage) => {
        setPagination(p => ({ ...p, page: newPage }));
    };

    const handleLimitChange = (newLimit) => {
        setPagination(p => ({ ...p, limit: Number(newLimit), page: 1 }));
    };

    // Shared Page Buttons UI
    const renderPageButtons = () => (
        <div className="flex items-center gap-[12px]">
            <button onClick={() => handlePageChange(1)} disabled={pagination.page <= 1} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&laquo;</button>
            <button onClick={() => handlePageChange(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&lsaquo;</button>
            {pageNumbers.map(num => (
                <button key={num} onClick={() => handlePageChange(num)} className={`w-[32px] h-[32px] flex items-center justify-center transition-colors text-[16px] ${pagination.page === num ? 'text-[#2563eb] font-medium' : 'hover:text-[#3b82f6]'}`}>
                    {num}
                </button>
            ))}
            <button onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))} disabled={pagination.page >= totalPages} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&rsaquo;</button>
            <button onClick={() => handlePageChange(totalPages)} disabled={pagination.page >= totalPages} className="w-[32px] h-[32px] flex items-center justify-center hover:text-[#3b82f6] disabled:opacity-40 transition-colors text-[20px]">&raquo;</button>
        </div>
    );

    // Variant 2: Simple (Everything Centered, no "Results" text)
    if (variant === 'simple') {
        return (
            <div className="w-full pt-[24px] flex flex-row items-center justify-center gap-8 text-[16px] text-gray-500 bg-white relative z-10 overflow-visible">
                {renderPageButtons()}
                <PaginationSelect options={limitOptions} value={pagination.limit} onChange={handleLimitChange} />
            </div>
        );
    }

    // Variant 1: Detailed (Text Left, Nav Center, Dropdown Right)
    return (
        <div className="w-full pt-[24px] flex flex-row items-center justify-center text-[16px] text-gray-500 bg-white relative z-10 overflow-visible">
            <div className="absolute left-0 flex items-center pl-[12px] text-[14px] text-[#4b5563] font-medium tracking-wide">
                Results {startItem}-{endItem} total {pagination.total}
            </div>
            {renderPageButtons()}
            <div className="absolute right-0 flex items-center pr-[12px]">
                <PaginationSelect options={limitOptions} value={pagination.limit} onChange={handleLimitChange} />
            </div>
        </div>
    );
};