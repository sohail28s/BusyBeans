import React, { useState, useEffect, useRef } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import useStore from '../../Hooks/useStore'; 
import { UpdateStageModal } from '../../ComponentsTemp/LeadsDashboard/DetailPageModels/UpdateStageModal'; 
import { MarkLostModal } from '../../ComponentsTemp/LeadsDashboard/DetailPageModels/MarkLostModal'; 
import { ScheduleModal } from '../../ComponentsTemp/LeadsDashboard/DetailPageModels/SceduleModal'; 
import { QuotationModal } from '../../ComponentsTemp/LeadsDashboard/DetailPageModels/QuotationModal'; 
import { getAuthConfig , formatMoney , formatDateWithTime , formatDate } from '../../utils/orderUtils'; 

const STAGES = ['New Enquiry', 'Contacted', 'Quoted', 'Demo/Scheduled', 'Negotiation', 'Nurture', 'WON']; 
const CUSTOMER_STATUSES = ['Interested', 'Not Interested', 'In Future']; 
const LEAD_TAGS = ['Hot Lead', 'Warm Lead', 'Cold Lead']; 

export const LeadDetails = () => { 
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setShowProfile = useStore((state) => state.setShowProfile); 
     const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);
    
    const [lead, setLead] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    const [scheduleType, setScheduleType] = useState(null); 
    const [modals, setModals] = useState({ stage: false, lost: false, quotation: false }); 
    
    // Tag Editor States 
    const [isEditingTag, setIsEditingTag] = useState(false); 
    const [tempTag, setTempTag] = useState(''); 
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false); 
    const tagDropdownRef = useRef(null); 

    // --- Handle Outside Click for Custom Tag Dropdown --- 
    useEffect(() => { 
        const handleOutsideClick = (e) => { 
            if (isTagDropdownOpen && tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) { 
                setIsTagDropdownOpen(false); 
            } 
        }; 
        document.addEventListener('mousedown', handleOutsideClick); 
        return () => document.removeEventListener('mousedown', handleOutsideClick); 
    }, [isTagDropdownOpen]); 

    // --- 1. Top Navbar Setup --- 
   useEffect(() => {
    if (lead) {
        setTitle(
            <div className="text-xl font-semibold flex items-center gap-2">
                <button 
                    onClick={() => navigate('/leads')} 
                    className="mr-2 hover:bg-gray-100 p-1 rounded-full transition-colors text-gray-800"
                >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
                    </svg>
                </button>
                <span 
                    className="cursor-pointer hover:text-[#86644c] transition-colors text-gray-500" 
                    onClick={() => navigate('/leads')}
                >
                    Leads
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-[#1f2937]">{lead.company}</span>
            </div>
        );
    } else {
        setTitle('Lead Details');
    }
    
    setActions(null);
    setShowProfile(false);
    
    // ❌ REMOVED: setIsGlobalLoading(true); from here

    return () => {
        setTitle('');
        setActions(null);
        setShowProfile(true);
        
        // ❌ REMOVED: setIsGlobalLoading(false); from here
    };
// Note: I also removed setIsGlobalLoading from the dependency array below
}, [lead, navigate, setTitle, setActions, setShowProfile]);

    // --- 2. Fetch Lead Data --- 
    const fetchLeadData = async () => { 
        setIsLoading(true); 
        setIsGlobalLoading(true);
        try { 
            const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/leads/${id}`, getAuthConfig()); 
            if (res.data?.success) { 
                setLead(res.data.data); 
            } 
        } catch (error) { 
            toast.error("Failed to load lead details."); 
        } finally { 
            setIsLoading(false); 
            setIsGlobalLoading(false);
        } 
    }; 

    useEffect(() => { 
        fetchLeadData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [id]); 

    // --- 3. Instant API Actions --- 
    const handleMarkWon = async () => { 
        const loadingId = toast.loading("Marking as won..."); 
        try { 
            await axios.patch(`https://testingbb.trimworldwide.com/api/v1/leads/${id}/won`, {}, getAuthConfig()); 
            toast.update(loadingId, { render: "Lead marked as Won!", type: "success", isLoading: false, autoClose: 3000 }); 
            fetchLeadData(); 
        } catch (error) { 
            toast.update(loadingId, { render: "Failed to mark won.", type: "error", isLoading: false, autoClose: 3000 }); 
        } 
    }; 

    const handleCustomerStatusChange = async (e) => { 
        const newStatus = e.target.value; 
        try { 
            await axios.patch(`https://testingbb.trimworldwide.com/api/v1/leads/${id}`, { customerStatus: newStatus }, getAuthConfig()); 
            toast.success("Customer status updated."); 
            fetchLeadData(); 
        } catch (error) { 
            toast.error("Failed to update status."); 
        } 
    }; 

    const handleConfirmTagUpdate = async () => { 
        const loadingId = toast.loading("Updating tag..."); 
        try { 
            await axios.patch(`https://testingbb.trimworldwide.com/api/v1/leads/${id}`, { tag: tempTag }, getAuthConfig()); 
            toast.update(loadingId, { render: "Lead tag updated.", type: "success", isLoading: false, autoClose: 3000 }); 
            setIsEditingTag(false); 
            setIsTagDropdownOpen(false); 
            fetchLeadData(); 
        } catch (error) { 
            toast.update(loadingId, { render: "Failed to update tag.", type: "error", isLoading: false, autoClose: 3000 }); 
        } 
    }; 

    if (isLoading || !lead) { 
        return <div className="w-full min-h-[calc(100vh-100px)] flex items-center justify-center text-gray-500 font-sans bg-[#f8fafc]">Loading Lead Details...</div>; 
    } 

    // --- Dynamic Progress Bar Logic --- 
    const displayStages = [...STAGES]; 
    const normalizedStatus = lead.status?.toUpperCase() || ''; 
    let currentStageIndex = STAGES.findIndex(s => s.toUpperCase() === normalizedStatus); 
    let isLost = false; 

    if (normalizedStatus === 'LOST') { 
        displayStages[6] = 'LOST'; 
        currentStageIndex = 6; 
        isLost = true; 
    } else if (normalizedStatus === 'WON') { 
        currentStageIndex = 6; 
    } 

    return ( 
        <div className="w-full pt-10 px-6 2xl:px-12 pb-10 font-sans"> 
            
            {/* --- Action Buttons --- */} 
            <div className="flex justify-end items-center gap-3 mb-4"> 
                <button onClick={() => setModals(p => ({ ...p, stage: true }))} className="bg-[#1E293B] text-white px-4 py-2 lg:px-6 lg:py-3 lg:text-sm rounded-lg font-medium text-xs hover:bg-black transition-colors"> 
                    Update Stage 
                </button> 
                <button onClick={handleMarkWon} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 lg:px-6 lg:py-3 lg:text-sm rounded-lg font-medium text-xs hover:bg-gray-50 transition-colors flex items-center gap-2"> 
                    <span className="text-green-600">✓</span> Mark Won 
                </button> 
                <button onClick={() => setModals(p => ({ ...p, lost: true }))} className="bg-red-500 text-white px-4 py-2 lg:px-6 lg:py-3 lg:text-sm rounded-lg font-medium text-xs hover:bg-red-600 transition-colors flex items-center gap-2"> 
                    <span>✕</span> Mark Lost 
                </button> 
            </div> 

            {/* --- Dark Header Section --- */} 
            <div className="bg-[#2C2C2C] text-white rounded-2xl p-6 shadow-md flex flex-col gap-5 lg:flex-row justify-between items-center"> 
                <div> 
                    <h1 className="text-2xl font-bold mb-1 max-lg:text-center">{lead.company}</h1> 
                    <p className="text-gray-400 text-sm"> 
                        Lead ID: L{String(lead.id).padStart(4, '0')} • Created {formatDateWithTime(lead.createdAt)} • Source: {lead.leadSource || 'N/A'} 
                    </p> 
                </div> 
                <div className="flex items-center gap-3"> 
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium uppercase tracking-wide text-center ${isLost ? 'bg-red-500' : normalizedStatus === 'WON' ? 'bg-green-600' : 'bg-gray-600'} text-white`}> 
                        {lead.status} 
                    </span> 
                    
                    {/* --- Dynamic Tag Editor Section --- */} 
                    {isEditingTag ? ( 
                        <div className="flex items-center gap-2 relative"> 
                            <div ref={tagDropdownRef} onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)} className="relative flex items-center justify-between w-[140px] h-[34px] bg-white border-2 border-[#2684ff] rounded-[4px] px-3 cursor-pointer" > 
                                <span className="text-gray-800 text-[13px] font-medium leading-none truncate"> 
                                    {tempTag} 
                                </span> 
                                <div className="flex items-center h-full"> 
                                    <span className="w-[1px] h-[16px] bg-gray-300 mx-2"></span> 
                                    <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg> 
                                </div> 
                                {isTagDropdownOpen && ( 
                                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg z-50 overflow-hidden"> 
                                        {LEAD_TAGS.map((tag) => ( 
                                            <div key={tag} onClick={(e) => { e.stopPropagation(); setTempTag(tag); setIsTagDropdownOpen(false); }} className={`px-3 py-2 text-[13px] cursor-pointer ${tempTag === tag ? 'bg-[#2684ff] text-white' : 'text-gray-700 hover:bg-blue-300'}`} > 
                                                {tag} 
                                            </div> 
                                        ))} 
                                    </div> 
                                )} 
                            </div> 
                            <button onClick={handleConfirmTagUpdate} className="w-[34px] h-[34px] rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm shrink-0"> 
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" className="text-white" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                            </button> 
                            <button onClick={() => { setIsEditingTag(false); setIsTagDropdownOpen(false); }} className="w-[34px] h-[34px] rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm shrink-0"> 
                                <span className="text-white text-lg leading-none font-bold relative -top-[1px]">×</span>
                            </button> 
                        </div> 
                    ) : ( 
                        <button onClick={() => { setIsEditingTag(true); setTempTag(lead.tag || 'Hot Lead'); }} className="bg-white text-[#86644c] px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-gray-100 transition-colors"> 
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path></svg>
                            {lead.tag || 'Add Tag'} 
                        </button> 
                    )} 
                </div> 
            </div> 

            {/* --- Dynamic Progress Stepper --- */} 
            <div className="bg-white rounded-2xl p-6 shadow-sm overflow-x-auto"> 
                <div className="relative flex justify-between items-center min-w-[800px] px-4"> 
                    <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-0"></div> 
                    {displayStages.map((stage, index) => { 
                        const isCompleted = index < currentStageIndex; 
                        const isCurrent = index === currentStageIndex; 
                        
                        let circleClass = 'bg-white border-gray-200 text-gray-500'; 
                        if (isCompleted) { 
                            circleClass = 'bg-green-500 border-green-500 text-white'; 
                        } else if (isCurrent) { 
                            circleClass = 'bg-black border-black text-white'; 
                        } 
                        
                        return ( 
                            <div key={stage} className="flex flex-col items-center relative z-10 bg-white px-2"> 
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors border-2 ${circleClass}`}> 
                                    {isCompleted ? ( 
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg> 
                                    ) : ( 
                                        index + 1 
                                    )} 
                                </div> 
                                <span className={`text-xs font-medium whitespace-nowrap ${isCurrent ? (isLost ? 'text-black font-bold' : 'text-black font-bold') : 'text-gray-500'}`}> 
                                    {stage} 
                                </span> 
                            </div> 
                        ); 
                    })} 
                </div> 
            </div> 

            {/* --- Top 3 Info Cards --- */} 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> 
                
                {/* Business */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <h3 className="text-gray-500 text-sm font-medium mb-4">Business</h3> 
                    <div className="space-y-3"> 
                        <div className="flex items-start gap-3"> 
                            <div className="mt-1 text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"></path></svg>
                            </div> 
                            <div> 
                                <p className="text-sm font-medium text-gray-900">Type: {lead.businessType || 'N/A'}</p> 
                                <p className="text-sm text-gray-500">{lead.city || 'N/A'}</p> 
                            </div> 
                        </div> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path></svg>
                            </div> 
                            <p className="text-sm text-gray-900">Source: {lead.leadSource || 'N/A'}</p> 
                        </div> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg>
                            </div> 
                            <p className="text-sm text-gray-900">Lead Date: {formatDateWithTime(lead.leadDate)}</p> 
                        </div> 
                    </div> 
                </div> 

                {/* Primary Contact */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <h3 className="text-gray-500 text-sm font-medium mb-4">Primary Contact</h3> 
                    <div className="space-y-3"> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                            </div> 
                            <p className="text-sm font-medium text-gray-900">{lead.contactName || 'N/A'}</p> 
                        </div> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path></svg>
                            </div> 
                            <p className="text-sm text-gray-900">{lead.contactPhone || 'N/A'}</p> 
                        </div> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path></svg>
                            </div> 
                            <p className="text-sm text-gray-900">{lead.contactEmail || 'N/A'}</p> 
                        </div> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="m20.1 7.7-1 1c1.8 1.8 1.8 4.6 0 6.5l1 1c2.5-2.3 2.5-6.1 0-8.5zM18 9.8l-1 1c.5.7.5 1.6 0 2.3l1 1c1.2-1.2 1.2-3 0-4.3zM14 1H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 19H4V4h10v16z"></path></svg>
                            </div> 
                            <p className="text-sm text-gray-900">Preferred: {lead.preferredContact || 'N/A'}</p> 
                        </div> 
                    </div> 
                </div> 

                {/* Commercial */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <h3 className="text-gray-500 text-sm font-medium mb-4">Commercial</h3> 
                    <div className="space-y-3"> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path></svg>
                            </div> 
                            <p className="text-sm font-medium text-gray-900">Est. Value: {formatMoney(lead.estimatedValue)}</p> 
                        </div> 
                        <div className="flex items-center gap-3"> 
                            <div className="text-gray-400">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                            </div> 
                            <p className="text-sm text-gray-900">Role: {lead.role || 'N/A'}</p> 
                        </div> 
                    </div> 
                </div> 
            </div> 

            {/* --- 2 Columns: Follow-up & Customer Status --- */} 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                {/* Follow-up */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <div className="flex justify-between items-center mb-4"> 
                        <h3 className="text-gray-900 text-sm font-bold">Follow-up</h3> 
                        <button onClick={() => setScheduleType('followUp')} className="text-xs text-[#86644c] hover:underline" > Schedule </button> 
                    </div> 
                    <div className="space-y-2"> 
                        <div className="flex items-center gap-2"> 
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-400" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg>
                            <p className="text-sm text-gray-900">Next: {formatDateWithTime(lead.followUpNextDate)}</p> 
                        </div> 
                        <div className="flex items-center gap-2"> 
                            {lead.followUpNeeded ? (
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-green-500" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                            ) : (
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-300" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                            )}
                            <p className="text-sm text-gray-900">Needed: {lead.followUpNeeded ? 'Yes' : 'No'}</p> 
                        </div> 
                        {lead.followUpFeedback && ( 
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600"> 
                                {lead.followUpFeedback} 
                            </div> 
                        )} 
                    </div> 
                </div> 

                {/* Customer Status */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <h3 className="text-gray-900 text-sm font-bold mb-4">Customer Status</h3> 
                    <div className="relative"> 
                        <select 
                            value={lead.customerStatus || ''} 
                            onChange={handleCustomerStatusChange} 
                            className="w-full h-[40px] px-3 bg-white border border-gray-200 text-gray-700 text-[14px] rounded outline-none focus:border-[#86644c] focus:ring-1 focus:ring-[#86644c] cursor-pointer appearance-none" 
                        > 
                            <option value="" disabled>Select Status</option> 
                            {CUSTOMER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)} 
                        </select> 
                        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg> 
                    </div> 
                </div> 
            </div> 

            {/* --- 2 Columns: Quotation & Site Visit --- */} 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                {/* Quotation */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <div className="flex justify-between items-center mb-4"> 
                        <h3 className="text-gray-900 text-sm font-bold">Quotation</h3> 
                        <button onClick={() => setModals(p => ({ ...p, quotation: true }))} className="text-xs text-[#86644c] hover:underline"> Send Quotation </button> 
                    </div> 
                    <div className="space-y-2"> 
                        <div className="flex items-center gap-2"> 
                            {lead.quotationSent ? (
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-green-500" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                            ) : (
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-400" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>
                            )}
                            <p className="text-sm text-gray-900">Sent: {lead.quotationSent ? 'Yes' : 'No'}</p> 
                        </div> 
                        {lead.quotationSent && (
                            <>
                                <div className="flex items-center gap-2"> 
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-400" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>
                                    <p className="text-sm text-gray-900">Amount: {formatMoney(lead.quotationAmount)}</p> 
                                </div> 
                                <div className="flex items-center gap-2"> 
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-400" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg>
                                    <p className="text-sm text-gray-900">Date: {formatDateWithTime(lead.quotationDateSent)}</p> 
                                </div> 
                            </>
                        )}
                    </div> 
                </div> 

                {/* Site Visit */} 
                <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                    <div className="flex justify-between items-center mb-4"> 
                        <h3 className="text-gray-900 text-sm font-bold">Site Visit</h3> 
                        <button onClick={() => setScheduleType('siteVisit')} className="text-xs text-[#86644c] hover:underline" > Schedule Visit </button> 
                    </div> 
                    <div className="space-y-2"> 
                        <div className="flex items-center gap-2"> 
                            {lead.siteVisitScheduled ? (
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-green-500" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                            ) : (
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-400" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path></svg>
                            )}
                            <p className="text-sm text-gray-900">Scheduled: {lead.siteVisitScheduled ? 'Yes' : 'No'}</p> 
                        </div> 
                        {lead.siteVisitScheduled && (
                            <>
                                <div className="flex items-center gap-2"> 
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-400" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg>
                                    <p className="text-sm text-gray-900">Date: {formatDateWithTime(lead.siteVisitDate)}</p> 
                                </div> 
                                <div className="flex items-center gap-2"> 
                                    {lead.siteVisitCompleted ? (
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-green-500" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                                    ) : (
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-gray-300" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                                    )}
                                    <p className="text-sm text-gray-900">Completed: {lead.siteVisitCompleted ? 'Yes' : 'No'}</p> 
                                </div> 
                                {lead.siteVisitNotes && ( 
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600"> 
                                        {lead.siteVisitNotes} 
                                    </div> 
                                )} 
                            </>
                        )}
                    </div> 
                </div> 
            </div> 

            {/* --- Requirement Snapshot --- */} 
            <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                <h3 className="text-gray-500 text-sm font-medium mb-4">Requirement Snapshot</h3> 
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6"> 
                    <div> 
                        <p className="text-xs text-gray-400 mb-1">Type</p> 
                        <p className="text-sm font-semibold text-gray-900">{lead.snapshotType || 'N/A'}</p> 
                    </div> 
                    <div> 
                        <p className="text-xs text-gray-400 mb-1">Use Case</p> 
                        <p className="text-sm font-semibold text-gray-900">{lead.snapshotUseCase || 'N/A'}</p> 
                    </div> 
                    <div> 
                        <p className="text-xs text-gray-400 mb-1">Volume</p> 
                        <p className="text-sm font-semibold text-gray-900">{lead.snapshotVolume || 'N/A'}</p> 
                    </div> 
                    <div> 
                        <p className="text-xs text-gray-400 mb-1">Timeline</p> 
                        <p className="text-sm font-semibold text-gray-900">{lead.snapshotTimeline || 'N/A'}</p> 
                    </div> 
                </div> 
                <div className="mt-6 pt-6 border-t border-gray-100"> 
                    <p className="text-xs text-gray-400 mb-2">Additional Notes</p> 
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes || 'No additional notes.'}</p> 
                </div> 
            </div> 

            {/* --- LOST LEAD INFORMATION BLOCK --- */} 
            {isLost && ( 
                <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-2xl p-6 shadow-sm"> 
                    <h3 className="text-[16px] font-bold text-[#991b1b] flex items-center gap-2 mb-4"> 
                        <span className="text-[18px]">✕</span> Lost Lead Information 
                    </h3> 
                    <div className="flex flex-col gap-4"> 
                        <div className="flex flex-col gap-0.5"> 
                            <p className="text-[13px] text-[#ef4444] font-medium">Lost Reason</p> 
                            <p className="text-[15px] font-bold text-[#7f1d1d]">{lead.lostReason || 'N/A'}</p> 
                        </div> 
                        <div className="flex flex-col gap-0.5"> 
                            <p className="text-[13px] text-[#ef4444] font-medium">Customer Feedback</p> 
                            <p className="text-[14px] text-[#7f1d1d]">{lead.customerFeedback || 'N/A'}</p> 
                        </div> 
                    </div> 
                </div> 
            )} 

            {/* --- Activity Logs --- */} 
            <div className="bg-white rounded-2xl p-6 shadow-sm"> 
                <h3 className="text-gray-900 text-lg font-bold mb-6 flex items-center gap-2"> 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></svg> 
                    Activity Logs 
                </h3> 
                <div className="relative border-l-2 border-gray-100 ml-2 space-y-8"> 
                    {lead.LeadLogs && lead.LeadLogs.length > 0 ? ( 
                        [...lead.LeadLogs].map(log => ( 
                            <div key={log.id} className="ml-6 relative"> 
                                <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.type === 'status' || log.action?.includes('status') ? 'bg-blue-500' : 'bg-gray-400'}`}></div> 
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start"> 
                                    <div> 
                                        <p className="text-sm font-medium text-gray-900">{log.details || log.message}</p> 
                                        <p className="text-xs text-gray-500 mt-1">by {log.entityName || 'System'}</p> 
                                    </div> 
                                    <span className="text-xs text-gray-400 mt-1 sm:mt-0">{formatDateWithTime(log.createdAt)}</span> 
                                </div> 
                            </div> 
                        )) 
                    ) : ( 
                        <div className="ml-6 text-sm text-gray-500 italic">No activity logs recorded.</div> 
                    )} 
                </div> 
            </div> 

            {/* --- Modals --- */}
            <UpdateStageModal isOpen={modals.stage} onClose={() => setModals(p => ({ ...p, stage: false }))} lead={lead} onSuccess={fetchLeadData} /> 
            <MarkLostModal isOpen={modals.lost} onClose={() => setModals(p => ({ ...p, lost: false }))} lead={lead} onSuccess={fetchLeadData} /> 
            <ScheduleModal isOpen={!!scheduleType} type={scheduleType} onClose={() => setScheduleType(null)} lead={lead} onSuccess={fetchLeadData} /> 
            <QuotationModal isOpen={modals.quotation} onClose={() => setModals(p => ({ ...p, quotation: false }))} lead={lead} onSuccess={fetchLeadData} /> 
        </div> 
    ); 
}; 

export default LeadDetails;