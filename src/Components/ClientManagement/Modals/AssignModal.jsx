import React, { useState, useMemo, useEffect } from 'react';
import { Spinner } from '../../../Hooks/PageLoader';

export const AssignModal = ({
    isOpen,
    onClose,
    title,
    type = 'employee', // 'employee' or 'partner'
    variant = 'expanded', // 'expanded' (5 columns) or 'simple' (3 columns)
    data = [],
    isLoading,
    onAssign
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isOpen) setSearchQuery('');
    }, [isOpen]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(item => {
            const name = String(item.srName || item.name || '').toLowerCase();
            const email = String(item.email || '').toLowerCase();
            return name.includes(lowerQuery) || email.includes(lowerQuery);
        });
    }, [data, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[900px] max-h-[90vh] rounded-[8px] shadow-2xl flex flex-col font-sans animate-fadeIn">

                <div className="flex items-center justify-between px-8 py-5 border-b border-[#e2e8f0]">
                    <h2 className="text-[20px] font-bold text-[#1f2937] tracking-wide">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="px-8 pt-6 pb-2">
                    <div className="relative flex items-center w-[300px] h-[45px] bg-[#f9fafb] border-[0.66px] border-[#e5e7eb] rounded-[8px] overflow-hidden shadow-inner">
                        <div className="pl-3 pr-2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                        </div>
                        <input
                            type="search"
                            placeholder="Search ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-transparent text-[14px] text-gray-700 focus:outline-none pr-3"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        {/* NO sticky class here, scrolls with the flow */}
                        <thead className="bg-[#f9fafb]">
                            <tr className="border-b border-[#e2e8f0]">
                                {/* Expanded Columns */}
                                {variant === 'expanded' && (
                                    <th className="px-4 py-4 font-bold text-[#374151] text-[14px] w-[80px]">
                                        <div className="flex items-center gap-2">
                                            SL
                                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-gray-400"><path d="M5.64515 3.61291C5.47353 3.61291 5.30192 3.54968 5.16644 3.4142L3.38708 1.63484L1.60773 3.4142C1.34579 3.67613 0.912244 3.67613 0.650309 3.4142C0.388374 3.15226 0.388374 2.71871 0.650309 2.45678L2.90837 0.198712C3.17031 -0.0632236 3.60386 -0.0632236 3.86579 0.198712L6.12386 2.45678C6.38579 2.71871 6.38579 3.15226 6.12386 3.4142C5.98837 3.54968 5.81676 3.61291 5.64515 3.61291Z" fill="currentColor" /><path d="M3.38714 14C3.01681 14 2.70972 13.6929 2.70972 13.3226V0.677419C2.70972 0.307097 3.01681 0 3.38714 0C3.75746 0 4.06456 0.307097 4.06456 0.677419V13.3226C4.06456 13.6929 3.75746 14 3.38714 14Z" fill="currentColor" /><path d="M10.6129 14C10.4413 14 10.2697 13.9368 10.1342 13.8013L7.87611 11.5432C7.61418 11.2813 7.61418 10.8477 7.87611 10.5858C8.13805 10.3239 8.5716 10.3239 8.83353 10.5858L10.6129 12.3652L12.3922 10.5858C12.6542 10.3239 13.0877 10.3239 13.3497 10.5858C13.6116 10.8477 13.6116 11.2813 13.3497 11.5432L11.0916 13.8013C10.9561 13.9368 10.7845 14 10.6129 14Z" fill="currentColor" /><path d="M10.6129 14C10.2426 14 9.93552 13.6929 9.93552 13.3226V0.677419C9.93552 0.307097 10.2426 0 10.6129 0C10.9833 0 11.2904 0.307097 11.2904 0.677419V13.3226C11.2904 13.6929 10.9832 14 10.6129 14Z" fill="currentColor" /></svg>
                                        </div>
                                    </th>
                                )}
                                <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Name</th>
                                <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Email</th>
                                {variant === 'expanded' && <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Current Status</th>}
                                <th className="px-4 py-4 font-bold text-[#374151] text-[14px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                            {isLoading ? (
                                <tr>
                                    {/* Make sure to change colSpan to match your actual number of table columns! */}
                                    <td colSpan="10" className="py-12">
                                        <div className="flex justify-center items-center w-full h-full">
                                            <Spinner />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                // ... rest of your mapped rows
                                filteredData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors h-[64px] text-[#4b5563] text-[14px]">

                                        {/* Expanded Data */}
                                        {variant === 'expanded' && <td className="px-4">{index + 1}</td>}

                                        <td className="px-4 font-medium text-gray-800">{item.srName || item.name || "—"}</td>
                                        <td className="px-4">{item.email || "—"}</td>

                                        {/* Expanded Data */}
                                        {variant === 'expanded' && (
                                            <td className="px-4">
                                                <span className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium text-white ${item.status ? 'bg-[#86644c]' : 'bg-[#ef4444]'}`}>
                                                    {item.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        )}

                                        <td className="px-4">
                                            <button
                                                onClick={() => onAssign(item.id)}
                                                className="px-5 py-2 bg-[#86644c] text-white text-[13px] font-medium rounded-[4px] hover:bg-[#735541] transition-colors shadow-sm"
                                            >
                                                Assign
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={variant === 'expanded' ? 5 : 3} className="text-center py-10 text-gray-500 italic">No results found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-5 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="h-[42px] px-8 bg-[#86644c] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#735541] transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};