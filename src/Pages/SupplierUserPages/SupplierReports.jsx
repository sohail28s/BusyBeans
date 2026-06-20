import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../Hooks/useStore';
const ClipboardChartIcon = () => (
    <svg className="w-6 h-6 text-[#86644c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path d="M9 3m0 2a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <path d="M9 17v-5" />
        <path d="M12 17v-4" />
        <path d="M15 17v-3" />
    </svg>
);

const DocumentListIcon = () => (
    <svg className="w-[22px] h-[22px] text-[#86644c]" viewBox="0 0 16 16" fill="currentColor">
        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zM1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
        <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
    </svg>
);

export const SupplierReportManagement = () => {
    const navigate = useNavigate();
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
     const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
      const userId = useStore(state => state.userId);
       const userRole = useStore((state) => state.userRole);

    // --- Page Configuration ---
    useEffect(() => {
        setTitle('Supplier Reports Management');
        setActions(null);
        setShowProfile(false);
     
        return () => {
            setTitle('');
            setActions(null);
            setShowProfile(true);
           
        };
    }, [setTitle, setActions  , setShowProfile]);

    // --- Report Data Array ---
    const reports = [
        { title: 'Assigned Order Report', path: '/supplier/reports/assigned-orders', icon: <ClipboardChartIcon /> },
        { title: 'Order Status Report', path: '/supplier/reports/orders-status', icon: <ClipboardChartIcon /> },
        { title: 'Top Products Ordered Report', path: '/supplier/reports/top-products-ordered', icon: <ClipboardChartIcon /> },
        
    ];

    return (
        <div className="w-full min-h-[calc(100vh-100px)] shadow-lg bg-whitep-6 md:p-8 font-sans">
            <div className=" mx-auto">
                {/* 3-Column Grid matching reference CSS parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {reports.map((report, index) => (
                        <div 
                            key={index}
                            onClick={() => navigate(report.path)}
                            className="group flex flex-row items-center justify-start gap-3 bg-white text-brand-brown  border-[0.66px] border-[#e5e7eb] rounded-[8px] p-5 cursor-pointer transition-all duration-200 hover:border-[#86644c] hover:bg-brand-brown hover:text-white  shadow-md  min-h-[140px] "
                        >
                            {/* Icon Container */}
                            <div className="flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                                {report.icon}
                            </div>
                            
                            {/* Title */}
                            <p className="text-[20px] font-semibold  text-left leading-[28px] m-0">
                                {report.title}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default SupplierReportManagement;