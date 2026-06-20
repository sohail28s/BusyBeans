import React from 'react';

const SalesCard = ({ 
    title, 
    totalSales, 
    orders, 
    avgOrderValue, 
    vsLastMonthPercent, 
    monthClosed,
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
        <>
        <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-lg font-sans flex flex-col justify-between">
            
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-gray-800 text-lg font-semibold">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-[#86644C] w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M4 9h4v11H4zm12 4h4v7h-4zm-6-9h4v16h-4z"></path>
                    </svg>
                    <span className="truncate">{title}</span>
                </h3>
            </div>

            <div className="flex-1">
           
                <div>
                    <p className="text-[30px] font-bold text-gray-900 leading-tight">
                        {formatCurrency(totalSales)}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Total Sales
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100">
                    <div>
                        <p className="text-lg font-bold text-gray-800">
                            {orders || 0}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                            Orders
                        </p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-800">
                            {formatCurrency(avgOrderValue)}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                            Avg Order Value
                        </p>
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                    {monthClosed ? (
                        <p className="text-sm font-medium text-gray-500">
                            {monthClosed}
                        </p>
                    ) : (
                        <p className={`text-sm font-medium ${vsLastMonthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            vs Last Month (MTD) {vsLastMonthPercent >= 0 ? '▲' : '▼'} {vsLastMonthPercent >= 0 ? '+' : ''}{vsLastMonthPercent}%
                        </p>
                    )}
                </div>

                <div className="pt-3 mt-1">
                    <button 
                        onClick={onActionClick} 
                        className="text-sm font-medium text-[#86644C] hover:text-[#6c503d] transition-colors"
                    >
                        View Report →
                    </button>
                </div>
            </div>

        </div>
        </>
    );
};

export default SalesCard;






