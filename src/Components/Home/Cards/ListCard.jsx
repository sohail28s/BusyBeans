import React from 'react';
import { ArrowRight } from 'lucide-react';

const ListCard = ({
    title,
    subtitle,
    data = [],
    showArrowOnValue = false,
    emptyMessage = "data",
    buttonText = "View Report",
    onItemClick,
    onActionClick
}) => {
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '$0.00';
        return `$${parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };
    return (
        <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-lg font-sans flex flex-col h-full">
            <div className="mb-4">
                <h3 className="flex items-center gap-2 text-gray-800 text-[18px] font-semibold leading-tight">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-[#86644C] w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M4 9h4v11H4zm12 4h4v7h-4zm-6-9h4v16h-4z"></path>
                    </svg>
                    <span className="truncate">{title}</span>
                </h3>

                {subtitle && (
                    <p className="text-[14px] font-medium text-[#4b5563] mt-1 flex items-center gap-1.5">
                        {subtitle}
                        <span className=" flex items-center [&>svg]:w-4 [&>svg]:h-4">
                            <ArrowRight />
                        </span>
                    </p>
                )}
            </div>

            <div className="flex-1 flex flex-col">
                {data.length > 0 ? (
                    data.slice(0, 5).map((item, index) => (
                        <div
                            key={index}
                            onClick={() => onItemClick && onItemClick(item)}
                            className="flex items-center justify-between py-3 px-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                        >
                            <span className="text-gray-700 font-medium truncate pr-4">
                                {item.label}
                            </span>

                            <span className="text-gray-900 font-semibold whitespace-nowrap text-sm sm:text-base flex items-center gap-1.5">
                                {formatCurrency(item.value)}

                                {showArrowOnValue && (

                                    <span className="text-gray-400 flex items-center [&>svg]:w-4 [&>svg]:h-4">
                                        <ArrowRight />
                                    </span>
                                )}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-[#64748b] text-[15px] mt-2 mb-4 font-medium">
                        No {emptyMessage} available
                    </p>
                )}
            </div>

            <div className="pt-4 mt-auto border-t border-gray-200">
                <button
                    onClick={onActionClick}
                    className="text-[14px] font-medium text-[#86644C] hover:text-[#6c503d] transition-colors"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default ListCard;