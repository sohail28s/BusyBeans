// import { create } from 'zustand';

// const useStore = create((set) => ({
//   title: '',
//   setTitle: (newTitle) => set({ title: newTitle }),

//   actions: null,
//   setActions: (newActions) => set({ actions: newActions }),
  
//   isGlobalLoading: false,
//   setIsGlobalLoading: (status) => set({ isGlobalLoading: status }),
  
//   userName: localStorage.getItem('userName') || 'Administrator',
//   accessToken: localStorage.getItem('accessToken') || null,

//   showProfile: true,
//   setShowProfile: (val) => set({ showProfile: val }),

//   // --- NEW: Navbar Visibility State ---
//   showNavbar: true,
//   setShowNavbar: (val) => set({ showNavbar: val }),
// }));

// export default useStore;









import { create } from 'zustand';

// Helper function to safely parse the user object from local storage
const getSafeUserData = () => {
    try {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const useStore = create((set) => ({
    // --- UI State ---
    title: '',
    setTitle: (newTitle) => set({ title: newTitle }),
    
    actions: null,
    setActions: (newActions) => set({ actions: newActions }),
    
    isGlobalLoading: false,
    setIsGlobalLoading: (status) => set({ isGlobalLoading: status }),
    
    showProfile: true,
    setShowProfile: (val) => set({ showProfile: val }),
    
    showNavbar: true,
    setShowNavbar: (val) => set({ showNavbar: val }),

    // --- Authentication & Multi-Role State ---
    accessToken: localStorage.getItem('accessToken') || null,
    userId: localStorage.getItem('userId') || null,
    userName: localStorage.getItem('userName') || 'User',
    userRole: localStorage.getItem('userRole') || null, // 'admin', 'supplier', or 'partner'
    userData: getSafeUserData(),

    // --- Actions for Login/Logout ---
    
    // Call this immediately after a successful login to update the global state without reloading the page
    setAuthStatus: (authData) => set((state) => ({
        ...state,
        ...authData
    })),

    // Call this inside your handleLogout function to wipe the state clean instantly
    clearAuth: () => set({
        accessToken: null,
        userId: null,
        userName: 'User',
        userRole: null,
        userData: null
    })
}));

export default useStore;