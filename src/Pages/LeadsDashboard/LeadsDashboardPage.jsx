import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { FilterLeadsModal } from '../../ComponentsTemp/LeadsDashboard/FilterLeadsModal';
import { LeadModal } from '../../ComponentsTemp/LeadsDashboard/LeadModal';
import { AssignLeadModal } from '../../ComponentsTemp/LeadsDashboard/AssignLeadModal';
import { DeleteLeadModal } from '../../ComponentsTemp/LeadsDashboard/DeleteLeadModal';
import { getAuthConfig } from '../../utils/orderUtils';
import { formatDate } from '../../utils/orderUtils';

const isDateInRange = (dateString, filterObj) => {
    if (!filterObj || filterObj.type === 'All Dates') return true;
    if (!dateString) return false;

    const targetDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterObj.type) {
        case 'Current Year':
            return targetDate.getFullYear() === today.getFullYear();
        case 'Current Month':
            return targetDate.getFullYear() === today.getFullYear() && targetDate.getMonth() === today.getMonth();
        case 'Current Week': {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() - today.getDay() + 6);
            return targetDate >= startOfWeek && targetDate <= endOfWeek;
        }
        case 'Last year':
            return targetDate.getFullYear() === today.getFullYear() - 1;
        case 'Last 90 days': {
            const ninetyDaysAgo = new Date(today);
            ninetyDaysAgo.setDate(today.getDate() - 90);
            return targetDate >= ninetyDaysAgo && targetDate <= now;
        }
        case 'Last 14 days': {
            const fourteenDaysAgo = new Date(today);
            fourteenDaysAgo.setDate(today.getDate() - 14);
            return targetDate >= fourteenDaysAgo && targetDate <= now;
        }
        case 'Last month': {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return targetDate >= startOfLastMonth && targetDate <= endOfLastMonth;
        }
        case 'Last Week':
        case 'Previous Week': {
            const startOfLastWeek = new Date(today);
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
            const endOfLastWeek = new Date(today);
            endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
            return targetDate >= startOfLastWeek && targetDate <= endOfLastWeek;
        }
        case 'Date Range': {
            if (!filterObj.start || !filterObj.end) return true;
            const start = new Date(filterObj.start);
            start.setHours(0, 0, 0, 0);
            const end = new Date(filterObj.end);
            end.setHours(23, 59, 59, 999);
            return targetDate >= start && targetDate <= end;
        }
        default:
            return true;
    }
};

const KANBAN_CONFIG = [
    { key: 'newEnquiry', label: 'New Enquiry', statusString: 'New Enquiry' },
    { key: 'contacted', label: 'Contacted', statusString: 'Contacted' },
    { key: 'quoted', label: 'Quoted', statusString: 'Quoted' },
    { key: 'demoScheduled', label: 'Demo/Scheduled', statusString: 'Demo/Scheduled' },
    { key: 'negotiation', label: 'Negotiation', statusString: 'Negotiation' },
    { key: 'nurture', label: 'Nurture', statusString: 'Nurture' },
    { key: 'won', label: 'Won', statusString: 'WON' }, 
    { key: 'lost', label: 'Lost', statusString: 'Lost' },
];



const LeadCard = ({ lead, colKey, onEdit, onAssign, onDelete }) => {
    const navigate = useNavigate();
    const isAssigned = lead.assignedSalesRep !== null || lead.assignedEmployee !== null || lead.assignedBy !== null;
    const visitDate = formatDate(lead.siteVisitDate);
    const followUpDate = formatDate(lead.followUpNextDate);

    const handleDragStart = (e) => {
        e.dataTransfer.setData('leadId', lead.id);
        e.dataTransfer.setData('sourceColKey', colKey);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="group bg-white border border-[#e2e8f0] rounded-[12px] p-4 relative shadow-sm cursor-pointer hover:shadow-md transition-all shrink-0 min-h-[105px] overflow-hidden"
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-[15px] text-[#1f2937] leading-tight pr-2">{lead.machineName || 'Unknown Machine'}</h3>
                
                <div className="hidden group-hover:flex items-center gap-2.5 text-[#94a3b8] bg-white pl-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(lead); }} title="Edit" className="hover:text-black transition-colors">
                        <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAssign(lead); }} title="Assign" className="hover:text-black transition-colors">
                        <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(lead); }} title="Delete" className="hover:text-black transition-colors">
                        <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            
            <div className="flex justify-between items-start mb-5 gap-2">
                <div className="text-[14px] text-[#4b5563] leading-relaxed overflow-hidden">
                    <p className="font-semibold text-black truncate">{lead.company}</p>
                    <p className="text-[#94a3b8] text-[13px] truncate">{lead.role || 'No Role'}</p>
                </div>
                
                {(visitDate || followUpDate) && (
                    <div className="flex flex-col gap-0.5 text-[13px] font-medium text-[#94a3b8] text-right shrink-0 pl-2">
                        {visitDate && <p>V:{visitDate}</p>}
                        {followUpDate && <p>F:{followUpDate}</p>}
                    </div>
                )}
            </div>
            
            {isAssigned && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white px-3 py-[2px] rounded-t-[6px] text-[11px] font-semibold tracking-wide">
                    Assigned
                </div>
            )}
        </div>
    );
};

const KanbanColumn = ({ colConfig, count, leads, isFirst, onDropCard, onEdit, onAssign, onDelete }) => {
    const handleDragOver = (e) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        const sourceColKey = e.dataTransfer.getData('sourceColKey');
        
        if (leadId && sourceColKey) {
            onDropCard(Number(leadId), sourceColKey, colConfig.key, colConfig.statusString);
        }
    };

    const clipPathStyle = isFirst
        ? 'polygon(0px 0px, calc(100% - 15px) 0px, 100% 50%, calc(100% - 15px) 100%, 0px 100%)'
        : 'polygon(0px 0px, calc(100% - 15px) 0px, 100% 50%, calc(100% - 15px) 100%, 0px 100%, 15px 50%)';

    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col w-[320px] min-w-[320px] shrink-0 h-full min-h-[300px]"
        >
            <div 
                className="h-[48px] bg-[#86644c] text-white flex items-center justify-center font-medium text-[14px] mb-3 relative shrink-0"
                style={{ clipPath: clipPathStyle }}
            >
                <span className={!isFirst ? "ml-3" : ""}>{colConfig.label}</span>
                <span className="ml-1 text-blue-200 text-[13px]">({count})</span>
            </div>
            
            <div className="flex-1 bg-white/50 border border-[#e2e8f0] rounded-b-[12px] p-3 flex flex-col gap-3 transition-colors hover:bg-gray-50/50 pb-8">
                {leads && leads.length > 0 ? (
                    leads.map(lead => (
                        <LeadCard 
                            key={lead.id} 
                            lead={lead} 
                            colKey={colConfig.key} 
                            onEdit={onEdit} 
                            onAssign={onAssign} 
                            onDelete={onDelete} 
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 text-[13px] mt-4 italic pointer-events-none">Drop here</div>
                )}
            </div>
        </div>
    );
};

const LeadsDashboard = () => {
   
    const setTitle = useStore((state) => state.setTitle);
    const setShowProfile = useStore((state) => state.setShowProfile);
      const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
  

    const [rawBoardData, setRawBoardData] = useState(null); 
    const [boardData, setBoardData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    const [modalState, setModalState] = useState({ edit: false, assign: false, delete: false, filter: false, create: false });
    const [selectedLead, setSelectedLead] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        leadStage: 'All Leads',
        followUp: { type: 'All Dates', start: null, end: null },
        siteVisit: { type: 'All Dates', start: null, end: null }
    });
    useEffect(() => {
        setTitle('Lead Management');
        setShowProfile(false); 
        setActions(<React.Fragment></React.Fragment>); 
        return () => { 
            setTitle(''); 
            setShowProfile(true); 
            setActions(null);
        };
    }, []);

    const setActions = useStore((state) => state.setActions);

    // --- 2. Fetch Initial Kanban Data ---
    const fetchLeads = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const res = await axios.get('https://testingbb.trimworldwide.com/api/v1/leads/kanban', getAuthConfig());
            if (res.data?.success) {
                setRawBoardData(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load Kanban board.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    // --- 3. FRONTEND FILTERING ENGINE ---
    useEffect(() => {
        if (!rawBoardData) return;

        const newFilteredBoard = {};
        
        Object.keys(rawBoardData).forEach(colKey => {
            const filteredColumnLeads = rawBoardData[colKey].filter(lead => {
                const passFollowUp = isDateInRange(lead.followUpNextDate, activeFilters.followUp);
                const passSiteVisit = isDateInRange(lead.siteVisitDate, activeFilters.siteVisit);
                return passFollowUp && passSiteVisit;
            });
            newFilteredBoard[colKey] = filteredColumnLeads;
        });

        setBoardData(newFilteredBoard);
    }, [rawBoardData, activeFilters]);

    // --- 4. Handle Drag & Drop Event ---
    const handleDropCard = async (leadId, sourceColKey, targetColKey, targetStatusString) => {
        if (sourceColKey === targetColKey) return;

        const newRawBoard = { ...rawBoardData };
        
        const leadToMoveIndex = newRawBoard[sourceColKey].findIndex(l => l.id === leadId);
        if (leadToMoveIndex === -1) return;
        
        const [leadToMove] = newRawBoard[sourceColKey].splice(leadToMoveIndex, 1);
        leadToMove.status = targetStatusString;
        
        newRawBoard[targetColKey].unshift(leadToMove); 
        
        setRawBoardData(newRawBoard);

        try {
            const payload = { status: targetStatusString };
            await axios.patch(`https://testingbb.trimworldwide.com/api/v1/leads/${leadId}`, payload, getAuthConfig());
        } catch (error) {
            toast.error("Failed to move lead. Reverting...");
            fetchLeads(); 
        }
    };

    const handleActionClick = (type, lead) => {
        setSelectedLead(lead);
        setModalState(p => ({ ...p, [type]: true }));
    };

    const removeFilter = (filterKey) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterKey]: filterKey === 'leadStage' ? 'All Leads' : { type: 'All Dates', start: null, end: null }
        }));
    };

    const getFilterDateDisplay = (filterObj) => {
        if (filterObj.type === 'Date Range' && filterObj.start && filterObj.end) {
            return `${formatDate(filterObj.start)} - ${formatDate(filterObj.end)}`;
        }
        return filterObj.type;
    };

    // --- 6. Determine Visible Columns ---
    const visibleColumns = KANBAN_CONFIG.filter(col => 
        activeFilters.leadStage === 'All Leads' || col.label === activeFilters.leadStage
    );

    const hasActiveFilters = activeFilters.leadStage !== 'All Leads' || activeFilters.followUp.type !== 'All Dates' || activeFilters.siteVisit.type !== 'All Dates';

    if (isLoading) {
        return <div className="w-full  min-h-[calc(100vh-100px)] flex items-center justify-center text-gray-500 font-sans bg-white ">Loading leads dashboard...</div>;
    }
    return (
        <div className="w-full px-6 min-h-[calc(100vh-100px)] bg-whitefont-sans flex flex-col relative">
            
            {/* Inline Header & Actions (Not fixed, naturally part of the page) */}
            <div className="px-6 pt-6 pb-3 flex items-center justify-end gap-3">
                <button 
                    onClick={() => setModalState(p => ({ ...p, filter: true }))} 
                    className="flex items-center gap-2 h-[40px] px-4 bg-white border border-[#e2e8f0] text-gray-700 text-[14px] font-medium rounded-[6px] hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path></svg>
                    Filters
                </button>
                <button 
                    onClick={() => setModalState(p => ({ ...p, create: true }))} 
                    className="h-[40px] px-5 bg-[#86644c] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm whitespace-nowrap"
                >
                    Add New Lead
                </button>
            </div>

            {/* Filter Badges Area */}
            {hasActiveFilters && (
                <div className="px-6 pb-4 flex flex-wrap gap-3">
                    {activeFilters.leadStage !== 'All Leads' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded-full text-[13px] text-[#4b5563] shadow-sm">
                            <span>Stage: {activeFilters.leadStage}</span>
                            <button onClick={() => removeFilter('leadStage')} className="text-gray-400 hover:text-red-500 font-bold transition-colors">✕</button>
                        </div>
                    )}
                    {activeFilters.followUp.type !== 'All Dates' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded-full text-[13px] text-[#4b5563] shadow-sm">
                            <span>Follow-up: {getFilterDateDisplay(activeFilters.followUp)}</span>
                            <button onClick={() => removeFilter('followUp')} className="text-gray-400 hover:text-red-500 font-bold transition-colors">✕</button>
                        </div>
                    )}
                    {activeFilters.siteVisit.type !== 'All Dates' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded-full text-[13px] text-[#4b5563] shadow-sm">
                            <span>Site Visit: {getFilterDateDisplay(activeFilters.siteVisit)}</span>
                            <button onClick={() => removeFilter('siteVisit')} className="text-gray-400 hover:text-red-500 font-bold transition-colors">✕</button>
                        </div>
                    )}
                </div>
            )}
            <div className="w-full overflow-x-auto custom-scrollbar px-6 pb-6">
                <div className="flex h-full min-w-max gap-2 items-start">
                    {boardData && visibleColumns.map((colConfig, index) => {
                        const columnLeads = boardData[colConfig.key] || [];
                        return (
                            <KanbanColumn 
                                key={colConfig.key}
                                colConfig={colConfig}
                                count={columnLeads.length}
                                leads={columnLeads}
                                isFirst={index === 0}
                                onDropCard={handleDropCard}
                                onEdit={(lead) => handleActionClick('edit', lead)}
                                onAssign={(lead) => handleActionClick('assign', lead)}
                                onDelete={(lead) => handleActionClick('delete', lead)}
                            />
                        );
                    })}
                </div>
            </div>

           

            <FilterLeadsModal 
                isOpen={modalState.filter} 
                onClose={() => setModalState(p => ({ ...p, filter: false }))}
                onApply={(filters) => setActiveFilters(filters)}
            />

            <LeadModal 
                isOpen={modalState.create || modalState.edit} 
                onClose={() => {
                    setModalState(p => ({ ...p, create: false, edit: false }));
                    setSelectedLead(null);
                }}
                initialData={modalState.edit ? selectedLead : null}
                onSuccess={fetchLeads} 
            />

            <AssignLeadModal 
                isOpen={modalState.assign}
                onClose={() => {
                    setModalState(p => ({ ...p, assign: false }));
                    setSelectedLead(null);
                }}
                lead={selectedLead}
                onSuccess={fetchLeads}
            />

            <DeleteLeadModal 
                isOpen={modalState.delete}
                onClose={() => {
                    setModalState(p => ({ ...p, delete: false }));
                    setSelectedLead(null);
                }}
                lead={selectedLead}
                onSuccess={fetchLeads} 
            />

        </div>
    );
};

export default LeadsDashboard;




