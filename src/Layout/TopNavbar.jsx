// import React, { useState, useEffect } from 'react';
// import useStore from '../Hooks/useStore';
// import { Navigate, useNavigate } from 'react-router-dom';

// const TopNavbar = ({ toggleSidebar, hideNavbar = false }) => {
//     const showNavbar = useStore((state) => state.showNavbar !== false);
//     const title = useStore((state) => state.title);
//     const actions = useStore((state) => state.actions);
//     const showProfile = useStore((state) => state.showProfile);

//     const navigate = useNavigate();
//     const [userName, setUserName] = useState('Loading...');
//     const [userRole, setUserRole] = useState('');

//     useEffect(() => {
//         const storedName = localStorage.getItem('userName');
//         const storedRole = localStorage.getItem('userRole');
//         setUserName(storedName || 'User');
//         if (storedRole) {
//             let formattedRole = storedRole === 'partner' ? 'Local Partner' : storedRole;
//             setUserRole(formattedRole.charAt(0).toUpperCase() + formattedRole.slice(1));
//         }
//     }, []);
//     if (hideNavbar || !showNavbar) {
//         return null;
//     }

//     return (
//         <header className="w-full bg-white  border border-gray-100 z-50 h-[70px] 2xl:h-[94px]">
//             <nav className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-8 w-full">
//                 <div className="flex items-center gap-2 md:gap-4">
//                     <button
//                         type="button"
//                         onClick={toggleSidebar}
//                         className="md:hidden inline-flex items-center justify-center rounded p-1.5 hover:bg-gray-100 transition-colors"
//                     >
//                         <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-black h-[22px] w-[22px]" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M3.563,4.063c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l16.874,-0.001c0.276,-0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-16.874,0.001Z"></path>
//                             <path d="M3.563,12.501c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l16.874,-0.002c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-16.874,0.002Z"></path>
//                             <path d="M3.563,20.939c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l16.874,-0.002c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-16.874,0.002Z"></path>
//                         </svg>
//                     </button>
//                     <h1 className="font-sans text-lg md:text-xl font-semibold text-black ">
//                         {title}
//                     </h1>
//                 </div>

//                 <div className="flex items-center gap-x-3 ml-auto">

//                     {actions && (
//                         <div className="flex items-center mr-4">
//                             {actions}
//                         </div>
//                     )}

//                     {showProfile && (
//                         <>

//                             <div className="hidden md:flex items-center gap-x-3 cursor-pointer p-2 rounded-lg transition-colors pl-4">
//                                 <button onClick={() => navigate(`/profile`)} type="button" className="h-10 w-10 2xl:h-12 2xl:w-12 bg-black rounded-full flex items-center justify-center ">
//                                     <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" className="text-white h-6 w-6 2xl:h-7 2xl:w-7" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z"></path>
//                                     </svg>
//                                 </button>
//                                 <div className="flex flex-col justify-center text-left">
//                                     <h2 className="font-satoshi font-semibold text-sm 2xl:text-base text-gray-900 leading-tight">
//                                         {userName}
//                                     </h2>
//                                     <p className="text-black text-xs 2xl:text-sm font-normal font-sans">
//                                         {userRole}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Mobile Profile Avatar */}
//                             <button type="button" className="md:hidden inline-flex items-center justify-center rounded ml-2">
//                                 <div className="h-9 w-9 bg-black rounded-full flex items-center justify-center ">
//                                     <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" className="text-white h-[22px] w-[22px]" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z"></path>
//                                     </svg>
//                                 </div>
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default TopNavbar;



import React, { useState, useEffect } from 'react'; 
import useStore from '../Hooks/useStore'; 
import { useNavigate } from 'react-router-dom'; 

const TopNavbar = ({ toggleSidebar, hideNavbar = false }) => { 
    const showNavbar = useStore((state) => state.showNavbar !== false); 
    const title = useStore((state) => state.title); 
    const actions = useStore((state) => state.actions); 
    const showProfile = useStore((state) => state.showProfile); 
    const navigate = useNavigate(); 
    
    const [userName, setUserName] = useState('Loading...'); 
    const [userRole, setUserRole] = useState(''); 
    const [rawRole, setRawRole] = useState(''); // Need this to determine routing logic
    const [userId, setUserId] = useState(null);
    
    useEffect(() => { 
        const storedName = localStorage.getItem('userName'); 
        const storedRole = localStorage.getItem('userRole'); 
        const storedId = localStorage.getItem('userId');
        
        setUserName(storedName || 'User'); 
        setUserId(storedId);
        
        if (storedRole) { 
            setRawRole(storedRole); // Store the exact string ('admin', 'supplier', 'partner')
            let formattedRole = storedRole === 'partner' ? 'Local Partner' : storedRole; 
            setUserRole(formattedRole.charAt(0).toUpperCase() + formattedRole.slice(1)); 
        } 
    }, []); 

    // --- Dynamic Profile Routing Logic ---
    const handleProfileClick = () => {
        if (!userId) {
            console.warn("No User ID found in storage.");
            return;
        }

        if (rawRole === 'supplier') {
            navigate(`/suppliers/details/${userId}`);
        } else if (rawRole === 'partner') {
            navigate(`/sale-representative/details/${userId}`);
        } else {
            // Default Admin behavior
            navigate(`/profile`);
        }
    };
    
    if (hideNavbar || !showNavbar) { 
        return null; 
    } 
    
    return ( 
        <header className="w-full bg-white border border-gray-100 z-50 h-[70px] 2xl:h-[94px]"> 
            <nav className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-8 w-full"> 
                <div className="flex items-center gap-2 md:gap-4"> 
                    <button type="button" onClick={toggleSidebar} className="md:hidden inline-flex items-center justify-center rounded p-1.5 hover:bg-gray-100 transition-colors" > 
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-black h-[22px] w-[22px]" xmlns="http://www.w3.org/2000/svg"> 
                            <path d="M3.563,4.063c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l16.874,-0.001c0.276,-0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-16.874,0.001Z"></path> 
                            <path d="M3.563,12.501c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l16.874,-0.002c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-16.874,0.002Z"></path> 
                            <path d="M3.563,20.939c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l16.874,-0.002c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-16.874,0.002Z"></path> 
                        </svg> 
                    </button> 
                    <h1 className="font-sans text-lg md:text-xl font-semibold text-black "> 
                        {title} 
                    </h1> 
                </div> 
                
                <div className="flex items-center gap-x-3 ml-auto"> 
                    {actions && ( 
                        <div className="flex items-center mr-4"> 
                            {actions} 
                        </div> 
                    )} 
                    
                    {showProfile && ( 
                        <> 
                            <div className="hidden md:flex items-center gap-x-3 cursor-pointer p-2 rounded-lg transition-colors pl-4" onClick={handleProfileClick}> 
                                <button type="button" className="h-10 w-10 2xl:h-12 2xl:w-12 bg-black rounded-full flex items-center justify-center "> 
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" className="text-white h-6 w-6 2xl:h-7 2xl:w-7" xmlns="http://www.w3.org/2000/svg"> 
                                        <path d="M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z"></path> 
                                    </svg> 
                                </button> 
                                <div className="flex flex-col justify-center text-left"> 
                                    <h2 className="font-satoshi font-semibold text-sm 2xl:text-base text-gray-900 leading-tight"> 
                                        {userName} 
                                    </h2> 
                                    <p className="text-black text-xs 2xl:text-sm font-normal font-sans"> 
                                        {userRole} 
                                    </p> 
                                </div> 
                            </div> 
                            
                            {/* Mobile Profile Avatar */} 
                            <button onClick={handleProfileClick} type="button" className="md:hidden inline-flex items-center justify-center rounded ml-2"> 
                                <div className="h-9 w-9 bg-black rounded-full flex items-center justify-center "> 
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" className="text-white h-[22px] w-[22px]" xmlns="http://www.w3.org/2000/svg"> 
                                        <path d="M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z"></path> 
                                    </svg> 
                                </div> 
                            </button> 
                        </> 
                    )} 
                </div> 
            </nav> 
        </header> 
    ); 
}; 

export default TopNavbar;