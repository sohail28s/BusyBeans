import React from 'react';

export const PageStatsHeader = ({ 
    cardTitle = "Total Orders", 
    totalValue = 0,
    secondCardTitle,
    secondTotalValue,
    buttonText, 
    buttonLoadingText = "Processing...", 
    isButtonLoading = false, 
    onButtonClick 
}) => {
    return (
        <div className="flex flex-col mb-6">
            {buttonText && (
                <div className='flex justify-end mb-4'>
                    <button
                        onClick={onButtonClick}
                        disabled={isButtonLoading}
                        className="h-[45px] px-4 py-2 bg-[#86644c] text-white text-base font-sans font-medium rounded-[6px] hover:bg-[#735541] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {isButtonLoading ? buttonLoadingText : buttonText}
                    </button>
                </div>
            )}

            {/* Stats Cards Row */}
            <div className='flex flex-wrap gap-6 text-left'>
                
                {/* Primary Card (Always renders) */}
                <div className="w-[300px] bg-[#f9fafb] border-[0.66px] border-[#e2e8f0] rounded-[8px] p-6 shadow-sm flex flex-col justify-center">
                    <h3 className="text-[16px] font-semibold text-black mb-4">{cardTitle}</h3>
                    <p className="text-[20px] font-medium text-black">{totalValue}</p>
                </div>

                {/* Secondary Card (Only renders if secondCardTitle is passed!) */}
                {secondCardTitle && (
                    <div className="w-[300px] bg-[#f9fafb] border-[0.66px] border-[#e2e8f0] rounded-[8px] p-6 shadow-sm flex flex-col justify-center">
                        <h3 className="text-[16px] font-semibold text-black mb-4">{secondCardTitle}</h3>
                        <p className="text-[20px] font-medium text-black">{secondTotalValue}</p>
                    </div>
                )}
                
            </div>
            
        </div>
    );
};