import React, { useState, useEffect, useRef } from 'react';

// --- Constants ---
const LEAD_STAGES = [
    'All Leads', 'New Enquiry', 'Contacted', 'Quoted', 
    'Demo/Scheduled', 'Negotiation', 'Nurture', 'Won', 'Lost'
];

const DATE_OPTIONS = [
    'All Dates', 'Current Year', 'Current Month', 'Current Week', 
    'Last year', 'Last 90 days', 'Last 14 days', 'Last month', 
    'Last Week', 'Previous Week', 'Date Range'
];

// --- Helper Functions ---
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
};

const StandardSelect = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2 font-sans relative" ref={ref}>
            <label className="text-[14px] font-medium text-[#374151]">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between h-[43px] px-4 bg-white border border-[#e2e8f0] rounded-[6px] cursor-pointer hover:border-[#86644c] transition-colors"
            >
                <span className="text-[14px] text-gray-900">{value}</span>
                <div className="flex items-center text-gray-400">
                    <span className="w-[1px] h-5 bg-[#e2e8f0] mx-2"></span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            {isOpen && (
                <div className="absolute top-[72px] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 max-h-[200px] overflow-y-auto custom-scrollbar py-1">
                    {options.map((opt) => (
                        <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value === opt ? 'bg-[#eff6ff] text-[#2563eb] font-medium' : 'text-gray-900 hover:bg-gray-50'}`}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 2. Custom Custom Calendar Component
const RangeCalendar = ({ onRangeSelected, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selection, setSelection] = useState({ start: null, end: null });

    const handleDayClick = (day) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        
        if (!selection.start || (selection.start && selection.end)) {
            // First click: Set Start Date
            setSelection({ start: clickedDate, end: null });
        } else {
            // Second click: Set End Date & Close
            let start = selection.start;
            let end = clickedDate;
            if (end < start) { start = clickedDate; end = selection.start; } // Swap if backwards
            
            setSelection({ start, end });
            onRangeSelected({ start, end });
            onClose();
        }
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
    const today = new Date();

    return (
        <div className="absolute top-[72px] left-0 w-[300px] bg-white border border-[#e2e8f0] rounded-[8px] shadow-xl z-50 p-4 font-sans">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-[14px] font-bold text-gray-800">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-gray-400 mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`blank-${b}`} className="h-8"></div>)}
                {daysArray.map(day => {
                    const currentLoopDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isToday = currentLoopDate.toDateString() === today.toDateString();
                    const isStart = selection.start?.toDateString() === currentLoopDate.toDateString();
                    const isEnd = selection.end?.toDateString() === currentLoopDate.toDateString();
                    const isInRange = selection.start && selection.end && currentLoopDate > selection.start && currentLoopDate < selection.end;

                    let classes = "h-8 flex items-center justify-center text-[13px] rounded-full cursor-pointer transition-colors ";
                    if (isStart || isEnd) classes += "bg-[#86644c] text-white font-bold";
                    else if (isInRange) classes += "bg-orange-50 text-[#86644c]";
                    else if (isToday) classes += "text-blue-600 font-bold border border-blue-200";
                    else classes += "text-gray-700 hover:bg-gray-100";

                    return (
                        <div key={day} onClick={() => handleDayClick(day)} className={classes}>
                            {day}
                        </div>
                    );
                })}
            </div>
            {/* Helper Text */}
            <div className="mt-3 text-center text-[11px] text-gray-400">
                {!selection.start ? "Click to select Start Date" : "Click to select End Date"}
            </div>
        </div>
    );
};

// 3. Dynamic Date Filter (Handles Dropdown AND Calendar transformation)
const DateFilterField = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const ref = useRef(null);

    const isRangeMode = value.type === 'Date Range';
    const displayValue = isRangeMode && value.start && value.end 
        ? `${formatDate(value.start)}  →  ${formatDate(value.end)}` 
        : value.type;

    useEffect(() => {
        const handleClickOutside = (e) => { 
            if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setIsCalendarOpen(false); }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionSelect = (opt) => {
        if (opt === 'Date Range') {
            onChange({ ...value, type: opt, start: null, end: null });
            setIsOpen(false);
            setIsCalendarOpen(true); // Auto-open calendar
        } else {
            onChange({ type: opt, start: null, end: null });
            setIsOpen(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 font-sans relative" ref={ref}>
            <label className="text-[14px] font-medium text-[#374151]">{label}</label>
            
            <div className="flex items-center gap-3">
                {/* Input Bar */}
                <div 
                    onClick={() => { isRangeMode ? setIsCalendarOpen(!isCalendarOpen) : setIsOpen(!isOpen) }}
                    className="flex-1 flex items-center justify-between h-[43px] px-4 bg-white border border-[#e2e8f0] rounded-[6px] cursor-pointer hover:border-[#86644c] transition-colors"
                >
                    <span className={`text-[14px] ${isRangeMode && value.start ? 'text-black font-medium' : 'text-gray-600'}`}>
                        {displayValue}
                    </span>
                    
                    {/* The | and Arrow ONLY show if NOT Date Range */}
                    {!isRangeMode && (
                        <div className="flex items-center text-gray-400">
                            <span className="w-[1px] h-5 bg-[#e2e8f0] mx-2"></span>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    )}
                </div>

                {/* The External Calendar Icon ONLY shows IF Date Range */}
                {isRangeMode && (
                    <button 
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={`w-[43px] h-[43px] flex items-center justify-center border rounded-[6px] transition-colors ${isCalendarOpen ? 'bg-orange-50 border-[#86644c] text-[#86644c]' : 'bg-white border-[#e2e8f0] text-gray-500 hover:text-black hover:border-gray-300'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                )}
            </div>

            {/* Dropdown Options */}
            {isOpen && !isRangeMode && (
                <div className="absolute top-[72px] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 max-h-[250px] overflow-y-auto custom-scrollbar py-1">
                    {DATE_OPTIONS.map((opt) => (
                        <div key={opt} onClick={() => handleOptionSelect(opt)} className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value.type === opt ? 'bg-[#eff6ff] text-[#2563eb] font-medium' : 'text-gray-900 hover:bg-gray-50'}`}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}

            {/* Calendar Popover */}
            {isCalendarOpen && isRangeMode && (
                <RangeCalendar 
                    onClose={() => setIsCalendarOpen(false)}
                    onRangeSelected={({start, end}) => onChange({ ...value, start, end })}
                />
            )}
        </div>
    );
};

// ==============================================
// MAIN MODAL COMPONENT
// ==============================================
export const FilterLeadsModal = ({ isOpen, onClose, onApply }) => {
    // Initial Filter States
    const [filters, setFilters] = useState({
        leadStage: 'All Leads',
        followUp: { type: 'All Dates', start: null, end: null },
        siteVisit: { type: 'All Dates', start: null, end: null }
    });

    const handleClearAll = () => {
        setFilters({
            leadStage: 'All Leads',
            followUp: { type: 'All Dates', start: null, end: null },
            siteVisit: { type: 'All Dates', start: null, end: null }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[500px] rounded-[6px] shadow-2xl flex flex-col font-sans animate-fadeIn">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0]">
                    <h2 className="text-[20px] font-bold text-[#1f2937] tracking-wide">Filter Leads</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body Fields */}
                <div className="px-6 py-8 flex flex-col gap-6">
                    <StandardSelect 
                        label="Lead Stage" 
                        value={filters.leadStage} 
                        options={LEAD_STAGES} 
                        onChange={(val) => setFilters(p => ({ ...p, leadStage: val }))} 
                    />
                    <DateFilterField 
                        label="Follow-up Date" 
                        value={filters.followUp} 
                        onChange={(val) => setFilters(p => ({ ...p, followUp: val }))} 
                    />
                    <DateFilterField 
                        label="Site Visit Date" 
                        value={filters.siteVisit} 
                        onChange={(val) => setFilters(p => ({ ...p, siteVisit: val }))} 
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#e2e8f0] flex items-center justify-between bg-white rounded-b-[6px]">
                    <button 
                        onClick={handleClearAll} 
                        className="text-[#ef4444] text-[14px] font-medium hover:underline focus:outline-none"
                    >
                        Clear All
                    </button>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose} 
                            className="h-[40px] px-5 bg-white border border-[#e2e8f0] text-[#4b5563] text-[14px] font-medium rounded-[8px] hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                onApply(filters);
                                onClose();
                            }} 
                            className="h-[40px] px-6 bg-[#86644c] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};