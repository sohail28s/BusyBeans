import React, { useState, useEffect } from 'react';

export const InvoiceFilterBar = ({ 
    activeTab, 
    onTabChange, 
    onBack, 
    showSyncButton, 
    syncButtonLabel, 
    selectedCount, 
    onSync, 
    isSyncing 
}) => {
    const TABS = [
        { label: "Synced Invoices", value: "synced" },
        { label: "Unsynced Invoices", value: "not-synced" },
        { label: "Synced Payments", value: "synced-paid" },
        { label: "Unsynced Payments", value: "unsynced-paid" }
    ];

    return (
        <div className="w-full flex items-center justify-between font-sans mb-6">
            
            {/* Left Side: Back Button + Tabs */}
            <div className="flex items-center gap-[16px] flex-wrap">
                
                {/* Back Button */}
                <button 
                    onClick={onBack}
                    className="w-[32px] h-[32px] flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-black"
                    title="Go Back"
                >
                    <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                </button>

                {/* Segmented Tabs Container */}
                <div className="flex items-center flex-wrap ">
                    {TABS.map((tab, index) => {
                        const isActive = activeTab === tab.value;
                        return (
                            <div 
                                key={tab.value}
                                onClick={() => onTabChange(tab.value)}
                                className={`
                                    h-[45px] px-[20px] flex items-center justify-center text-[14px] font-semibold cursor-pointer transition-colors shadow-sm
                                    border-[0.66px] border-[#e5e7eb]
                                    ${isActive 
                                        ? 'bg-black text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }
                                    ${index !== 0 ? 'ml-[-0.66px]' : ''}
                                `}
                            >
                                {tab.label}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: Sync Button */}
            {showSyncButton && (
                <button 
                    onClick={onSync}
                    disabled={selectedCount === 0 || isSyncing}
                    className="h-[45px] px-[24px] flex items-center justify-center gap-[8px] bg-[#8B624A] text-white text-[15px] font-bold rounded-[6px] hover:bg-[#6c4f3b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSyncing ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {syncButtonLabel}
                </button>
            )}
        </div>
    );
};