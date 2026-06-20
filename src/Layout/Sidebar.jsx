import React, { useState, useEffect } from 'react'; 
import { NavLink, useNavigate, useLocation , Link } from 'react-router-dom'; 
import { menuItems } from '../Database/menu'; 
import { menuItems as adminMenu } from '../Database/menu';
import { supplierMenu } from '../Database/supplierMenu';
import useStore from '../Hooks/useStore';

// const Sidebar = ({ isOpen, toggleSidebar }) => { 
//     const navigate = useNavigate(); 
//     const location = useLocation();
//     const [openDropdowns, setOpenDropdowns] = useState(new Set()); 

//     const [customerCounts, setCustomerCounts] = useState({}); 
//     const [partnerCounts, setPartnerCounts] = useState({}); 
//     const [allOrdersTotal, setAllOrdersTotal] = useState(null);

//     const userRole = useStore((state) => state.userRole);
//     const userId = useStore((state) => state.userId);


//     let currentMenuItems = adminMenu; 
//     if (userRole === 'supplier') {
//         currentMenuItems = supplierMenu;
//     }

    // useEffect(() => { 
    //     const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }; 
        
    //     fetch('https://testingbb.trimworldwide.com/api/v1/admin/order-navigation-counts', { headers }) 
    //         .then((r) => r.json()) 
    //         .then((json) => { 
    //             if (json?.data) { 
    //                 const map = {}; 
    //                 json.data.forEach((item) => { map[item.orderStatus] = item.count; }); 
    //                 setCustomerCounts(map); 
    //             } 
    //         }) 
    //         .catch(() => {}); 
            
    //     fetch('https://testingbb.trimworldwide.com/api/v1/admin/partner-order-navigation-counts', { headers }) 
    //         .then((r) => r.json()) 
    //         .then((json) => { 
    //             if (json?.data) { 
    //                 const map = {}; 
    //                 json.data.forEach((item) => { map[item.orderStatus] = item.count; }); 
    //                 setPartnerCounts(map); 
    //             } 
    //         }) 
    //         .catch(() => {}); 
            
    //     fetch('https://testingbb.trimworldwide.com/api/v1/admin/orders?page=1&limit=100', { headers }) 
    //         .then((r) => r.json()) 
    //         .then((json) => { 
    //             if (json?.pagination?.totalItems != null) { 
    //                 setAllOrdersTotal(json.pagination.totalItems); 
    //             } 
    //         }) 
    //         .catch(() => {}); 
    // }, []);




const Sidebar = ({ isOpen, toggleSidebar }) => { 
    const navigate = useNavigate(); 
    const location = useLocation();
    
    // 1. Pull user data from Zustand
    const userRole = useStore((state) => state.userRole);
    const userId = useStore((state) => state.userId);

    // 2. Determine which menu to show
    let menuItems = adminMenu;
    if (userRole === 'supplier') {
        menuItems = supplierMenu;
    }

    const [openDropdowns, setOpenDropdowns] = useState(new Set()); 
    const [customerCounts, setCustomerCounts] = useState({}); 
    const [partnerCounts, setPartnerCounts] = useState({}); 
    const [allOrdersTotal, setAllOrdersTotal] = useState(null);

    // 3. Dynamic Fetching based on Role
    useEffect(() => { 
        const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }; 
        
        if (userRole === 'admin') {
            // --- ADMIN APIs ---
            fetch('https://testingbb.trimworldwide.com/api/v1/admin/order-navigation-counts', { headers }) 
                .then((r) => r.json()) 
                .then((json) => { 
                    if (json?.data) { 
                        const map = {}; 
                        json.data.forEach((item) => { map[item.orderStatus] = item.count; }); 
                        setCustomerCounts(map); 
                    } 
                }).catch(() => {}); 
                
            fetch('https://testingbb.trimworldwide.com/api/v1/admin/partner-order-navigation-counts', { headers }) 
                .then((r) => r.json()) 
                .then((json) => { 
                    if (json?.data) { 
                        const map = {}; 
                        json.data.forEach((item) => { map[item.orderStatus] = item.count; }); 
                        setPartnerCounts(map); 
                    } 
                }).catch(() => {}); 
                
            fetch('https://testingbb.trimworldwide.com/api/v1/admin/orders?page=1&limit=100', { headers }) 
                .then((r) => r.json()) 
                .then((json) => { 
                    if (json?.pagination?.totalItems != null) { 
                        setAllOrdersTotal(json.pagination.totalItems); 
                    } 
                }).catch(() => {}); 
        } 
        else if (userRole === 'supplier' && userId) {
            // --- SUPPLIER APIs ---
            fetch(`https://testingbb.trimworldwide.com/api/v1/admin/order-navigation-counts/supplier/${userId}`, { headers }) 
                .then((r) => r.json()) 
                .then((json) => { 
                    if (json?.data) { 
                        const map = {}; 
                        json.data.forEach((item) => { map[item.orderStatus] = item.count; }); 
                        setCustomerCounts(map); 
                    } 
                }).catch(() => {}); 
                
            fetch(`https://testingbb.trimworldwide.com/api/v1/admin/partner-order-navigation-counts/supplier/${userId}`, { headers }) 
                .then((r) => r.json()) 
                .then((json) => { 
                    if (json?.data) { 
                        const map = {}; 
                        json.data.forEach((item) => { map[item.orderStatus] = item.count; }); 
                        setPartnerCounts(map); 
                    } 
                }).catch(() => {}); 
        }
    }, [userRole, userId]);
    // ── Helpers ───────────────────────────────────────────────────── 
    const handleLogout = () => { 
        localStorage.clear(); 
        navigate('/sign-in'); 
    }; 

    const toggleDropdown = (title) => { 
        setOpenDropdowns((prev) => {
            const next = new Set(prev);
            next.has(title) ? next.delete(title) : next.add(title);
            return next;
        });
    }; 
    const hasActiveChild = (item) => item.children?.some((child) => location.pathname === child.path);

    // const getCountForChild = (parentTitle, childTitle) => {


    //     if (parentTitle === 'Customer Orders') { 
    //         const map = { 
    //             'New Orders': customerCounts['Order Placed'], 
    //             'All Orders': allOrdersTotal, 
    //             'Upcoming Orders': customerCounts['Upcomming Orders'], 
    //             'Dispatched Orders': customerCounts['Dispatched to Supplier'], 
    //             'Acknowledged Orders': customerCounts['Acknowledged'], 
    //             'Shipped Orders': customerCounts['Dispatched'], 
    //             'Cancelled Orders': customerCounts['Cancelled'], 
    //         }; 
    //         return map[childTitle] ?? null; 
    //     } 
    //     if (parentTitle === 'Partner Orders') { 
    //         const map = { 
    //             'New Partner Orders': partnerCounts['Order Placed'], 
    //             'Dispatched Orders': partnerCounts['Dispatched to Supplier'], 
    //             'Acknowledged Orders': partnerCounts['Acknowledged'], 
    //             'Shipped Orders': partnerCounts['Dispatched'], 
    //             'Cancelled Orders': partnerCounts['Cancelled'], 
    //         }; 
    //         return map[childTitle] ?? null; 
    //     } 
    //     return null; 
    // };





    // ── Count badge mapping ───────────────────────────────────────── 

const getCountForChild = (parentTitle, childTitle) => { 
    // --- ADMIN MAPPING --- 
    if (userRole === 'admin') { 
        if (parentTitle === 'Customer Orders') { 
            const map = { 
                'New Orders': customerCounts['Order Placed'], 
                'All Orders': allOrdersTotal, 
                'Upcoming Orders': customerCounts['Upcomming Orders'], 
                'Acknowledged Orders': customerCounts['Acknowledged'], 
                'Dispatched Orders': customerCounts['Dispatched to Supplier'], 
                'Shipped Orders': customerCounts['Dispatched'], 
                'Cancelled Orders': customerCounts['Cancelled'], 
            }; 
            return map[childTitle] ?? null; 
        } 
        if (parentTitle === 'Partner Orders') { 
            const map = { 
                'New Partner Orders': partnerCounts['Order Placed'], 
                'Dispatched Orders': partnerCounts['Dispatched to Supplier'], 
                'Acknowledged Orders': partnerCounts['Acknowledged'], 
                'Shipped Orders': partnerCounts['Dispatched'], 
                'Cancelled Orders': partnerCounts['Cancelled'], 
            }; 
            return map[childTitle] ?? null; 
        } 
    } 
    
    // --- SUPPLIER MAPPING --- 
    else if (userRole === 'supplier') { 
        if (parentTitle === 'Customer Orders') { 
            const map = { 
                // Fix: Look for 'Order Placed' instead of 'Dispatched to Supplier'
                'New Orders': customerCounts['Dispatched to Supplier'], 
                 'Acknowledged Orders': customerCounts['Acknowledged'], 
                'Shipped Orders': customerCounts['Dispatched'],               
            }; 
            return map[childTitle] ?? null; 
        } 
        if (parentTitle === 'Partner Orders') { 
            const map = { 
                // Fix: Look for 'Order Placed' instead of 'Dispatched to Supplier'
                'New Orders': partnerCounts['Dispatched to Supplier'],  
                'Acknowledged Orders': partnerCounts['Acknowledged'], 
                'Shipped Orders': partnerCounts['Dispatched'], 

            }; 
            return map[childTitle] ?? null; 
        } 
    } 
    return null; 
};
    return ( 
        <> 
            {isOpen && ( 
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300" onClick={toggleSidebar} /> 
            )} 
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-[280px] md:w-[240px] lg:w-[290px] xl:w-[278px] bg-white border-r-2 border-gray-100 flex flex-col z-50 transform transition-transform duration-300 ease-in-out font-sans ${ isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0' }`} > 
                
                <div className="h-[70px] 2xl:h-[94px] border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0"> 
                    <Link to="/" className="flex items-center justify-between w-full md:w-auto active:scale-[0.98]"> 
                        <img alt="Busy Beans Logo" src="/Images/logosidebar.png" className="h-11 md:h-[70px] w-[125px] md:w-[200px] object-contain" /> 
                    </Link> 
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-black transition-colors" aria-label="Close menu" > 
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-gray-700" height="28" width="28" xmlns="http://www.w3.org/2000/svg"><path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path></svg> 
                    </button> 
                </div> 
                
                <div className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar"> 
                    {menuItems.map((item, index) => { 
                        const hasDropdown = item.children && item.children.length > 0; 
                        const isDropdownOpen = openDropdowns.has(item.title); 
                        const childIsActive = hasDropdown && hasActiveChild(item);

                        if (item.title === 'Logout') { 
                            return ( 
                                <div key={index} className="flex flex-col w-full px-2 mt-4 mb-2"> 
                                    <button onClick={handleLogout} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium transition-colors w-full bg-white text-black hover:bg-black hover:text-white" > 
                                        <div className="flex items-center gap-3"> 
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-90 transition-colors"> 
                                                {item.icon} 
                                            </svg> 
                                            <span>{item.title}</span> 
                                        </div> 
                                    </button> 
                                </div> 
                            ); 
                        } 

                        return ( 
                            <div key={index} className="flex flex-col w-full px-2"> 
                                
                                {hasDropdown ? ( 
                                    <button onClick={() => toggleDropdown(item.title)} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm lg:text-base font-medium transition-colors w-full group active:scale-[0.98] ${ childIsActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white' }`} > 
                                        <div className="flex items-center gap-2 "> 
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-90 transition-colors"> 
                                                {item.icon} 
                                            </svg> 
                                            <span >{item.title}</span> 
                                        </div> 
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 512" className={`flex-shrink-0 transition-transform duration-200 ease-in-out ${isDropdownOpen ? 'rotate-90' : 'rotate-0'}`} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" > 
                                            <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path> 
                                        </svg> 
                                    </button> 
                                ) : ( 
                                    /* ── Regular nav link ── */
                                    <NavLink to={item.path} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }} className={({ isActive }) => `  active:scale-[0.98] flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-black text-white shadow-md' : 'bg-white text-black hover:bg-black hover:text-white' } `} > 
                                        <div className="flex items-center gap-3"> 
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-90"> 
                                                {item.icon} 
                                            </svg> 
                                            <span>{item.title}</span> 
                                        </div> 
                                    </NavLink> 
                                )} 

                                {/* ── Dropdown children ── */}
                                {hasDropdown && isDropdownOpen && ( 
                                    <div className="flex flex-col gap-1 mt-1 animate-fade-in-up"> 
                                        {item.children.map((child, childIndex) => {
                                            const count = getCountForChild(item.title, child.title);
                                            return (
                                                /* Fix #1: Apply Exact Ref Styling for Children NavLinks */
                                                <NavLink 
                                                    key={childIndex} 
                                                    to={child.path} 
                                                    onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }} 
                                                    className={({ isActive }) => `
                                                        flex gap-x-2 justify-between items-center min-h-[44px] py-3 px-3 rounded-lg font-sans font-medium active:scale-[0.98] duration-200 touch-manipulation md:min-h-0 md:py-2 md:px-2
                                                        ${isActive ? 'bg-[#86644c] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:bg-[#86644c] hover:text-white'}
                                                    `} 
                                                > 
                                                    <p>{child.title}</p> 
                                                    {count != null && count !== 0 && (
                                                        <span>{count.toLocaleString()}</span>
                                                    )}
                                                </NavLink> 
                                            );
                                        })} 
                                    </div> 
                                )} 
                                <hr className="w-full border-t border-gray-200 my-1" /> 
                            </div> 
                        ); 
                    })} 
                </div> 
            </aside> 
        </> 
    ); 










   
}; 
export default Sidebar;

