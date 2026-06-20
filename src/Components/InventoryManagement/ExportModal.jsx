import React from 'react';
import { exportToCSV } from '../../utils/csvHelper';     
import { exportToExcel } from '../../utils/excelHelper'; 

export const ExportModal = ({ isOpen, onClose, data, inventoryView }) => {
    if (!isOpen) return null;

    const prepareDataForExport = () => {
        return data.map((p, index) => ({
            "SL": index + 1,
            "Name": p.name,
            "Weight": `${p.weight} ${p.unit}`,
            "Price ($)": p.price,
            "Whole Sale Price ($)": p.wholesalePrice,
            "Product Code": p.productCode,
            "SKU": p.sku,
            "Grind": p.grind || '-',
            "Status": p.status ? 'Active' : 'Inactive'
        }));
    };

    const handleExportCSV = () => {
        const formattedData = prepareDataForExport();
        exportToCSV(formattedData, `inventory_export_${inventoryView}.csv`);
        onClose();
    };

    const handleExportExcel = () => {
        const formattedData = prepareDataForExport();
        exportToExcel(formattedData, `inventory_export_${inventoryView}.xlsx`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[500px] rounded-[16px] shadow-xl flex flex-col font-nunito relative animate-scaleIn p-8">
                
                {/* Close 'X' Button */}
                <button 
                    onClick={onClose} 
                    className="absolute right-6 top-6 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Text */}
                <div className="text-center mb-8 pt-2">
                    <h2 className="text-[22px] font-semibold text-[#1f2937] mb-2">
                        Export products
                    </h2>
                    <p className="text-[15px] text-gray-500">
                        Choose format for current products
                    </p>
                </div>

                {/* Export Options Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    
                    {/* CSV Card */}
                    <div 
                        onClick={handleExportCSV}
                        className="group flex flex-col items-center text-center p-6 border border-gray-200 rounded-[12px] cursor-pointer hover:border-[#86644c] transition-colors"
                    >
                        {/* Icon Circle */}
                        <div className="w-[50px] h-[50px] rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#fef7e8] transition-colors">
                            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#86644c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 0l-2-2m2 2l2-2" />
                            </svg>
                        </div>
                        <h3 className="text-[16px] font-semibold text-gray-900 mb-1">Export as CSV</h3>
                        <p className="text-[13px] text-gray-400">Comma-separated values</p>
                    </div>

                    {/* Excel Card */}
                    <div 
                        onClick={handleExportExcel}
                        className="group flex flex-col items-center text-center p-6 border border-gray-200 rounded-[12px] cursor-pointer hover:border-[#86644c] transition-colors"
                    >
                        {/* Icon Circle */}
                        <div className="w-[50px] h-[50px] rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#fef7e8] transition-colors">
                            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#86644c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 0l-2-2m2 2l2-2" />
                            </svg>
                        </div>
                        <h3 className="text-[16px] font-semibold text-gray-900 mb-1">Export as Excel</h3>
                        <p className="text-[13px] text-gray-400">Open in Excel / Sheets</p>
                    </div>

                </div>

                {/* Footer Cancel Button */}
                <div className="flex justify-end">
                    <button 
                        onClick={onClose}
                        className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};