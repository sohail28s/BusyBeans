import React from 'react';

export const supplierMenu = [
    {
        title: 'Dashboard',
        path: '/',
        icon: <path d="M 3 13 H 11 V 3 H 3 V 13 Z M 3 21 H 11 V 15 H 3 V 21 Z M 13 21 H 21 V 11 H 13 V 21 Z M 13 3 V 9 H 21 V 3 H 13 Z" />,
        children: []
    },
    {
        title: 'Partner Orders',
        // Partner icon (handshake/deal concept)
        icon: <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />,
        children: [
            { title: 'New Orders', path: '/supplier/partner/new-orders' },
            { title: 'Acknowledged Orders', path: '/supplier/partner/acknowledged-orders' },
            { title: 'Shipped Orders', path: '/supplier/partner/shipped-orders' }
        ]
    },
    {
        title: 'Customer Orders',
        // Shopping cart / Order icon
        icon: <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />,
        children: [
            { title: 'New Orders', path: '/supplier/assigned-orders' },
            { title: 'Acknowledged Orders', path: '/supplier/acknowledge-orders' },
            { title: 'Shipped Orders', path: '/supplier/shiped-orders' }
        ]
    },
    {
        title: 'Report Management',
        // Chart / Report icon
        icon: <path d="M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2 1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93 0-1.1-.9-2-2-2z" />,
        path: '/supplier/reports',
        children: []
    },
    {
        title: 'Logout',
        // Standard Power/Logout icon
        icon: <path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />,
        path: '#',
        children: []
    }
];