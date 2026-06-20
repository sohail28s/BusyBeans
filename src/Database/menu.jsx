export const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <path d="M 3 13 H 11 V 3 H 3 V 13 Z M 3 21 H 11 V 15 H 3 V 21 Z M 13 21 H 21 V 11 H 13 V 21 Z M 13 3 V 9 H 21 V 3 H 13 Z" />,
      children: []
    },
    {
      title: 'Order Management',
      icon: <path d="M 7 18 C 5.9 18 5.01 18.9 5.01 20 S 5.9 22 7 22 S 9 21.1 9 20 S 8.1 18 7 18 Z M 1 2 V 4 H 3 L 6.6 11.59 L 5.25 14.04 C 5.09 14.32 5 14.65 5 15 C 5 16.1 5.9 17 7 17 H 19 V 15 H 7.42 C 7.28 15 7.17 14.89 7.17 14.75 L 7.2 14.63 L 8.1 13 H 15.55 C 16.3 13 16.96 12.59 17.3 11.97 L 20.88 5.48 A 1.003 1.003 0 0 0 20 4 H 5.21 L 4.27 2 H 1 Z" />,
      children: [
        { title: 'Create Order', path: '/orders/create' },
        { title: 'Emails', path: '/orders/emails' },
        { title: 'Email Logs', path: '/orders/email-logs' },
        { title: 'Delete Invoice', path: '/orders/delete-invoice' }
      ]
    },
    {
      title: 'QuickBook Invoices',
      icon: <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />,
      children: [
        { title: 'Partner Invoices', path: '/orders/quickbooks/partner' },
        { title: 'Customer Invoices', path: '/orders/quickbooks/customer' },
        { title: 'Pullout intent sync', path: '/Quickbooks/invoices' },
      ]
    },
    {
      title: 'Partner Orders',
      icon: <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />,
      children: [
        { title: 'New Partner Orders', path: '/orders/partnerOrders/new-orders' },
        { title: 'Dispatched Orders', path: '/orders/partnerOrders/dispatched' },
        { title: 'Acknowledged Orders', path: '/orders/partnerOrders/acknowledged' },
        { title: 'Shipped Orders', path: '/orders/partnerOrders/shipped' },
        { title: 'Cancelled Orders', path: '/orders/partnerOrders/cancelled' },
      ]
    },
    {
      title: 'Customer Orders',
      icon: <path d="M 18 6 H 16 C 16 3.79 14.21 2 12 2 S 8 3.79 8 6 H 6 C 4.9 6 4 6.9 4 8 V 20 C 4 21.1 4.9 22 6 22 H 18 C 19.1 22 20 21.1 20 20 V 8 C 20 6.9 19.1 6 18 6 Z M 10 10 C 10 10.55 9.55 11 9 11 S 8 10.55 8 10 V 8 H 10 V 10 Z M 12 4 C 13.1 4 14 4.9 14 6 H 10 C 10 4.9 10.9 4 12 4 Z" />,
      children: [
        { title: 'New Orders', path: '/orders/new-orders' },
        { title: 'All Orders', path: '/orders/all-orders' },
        { title: 'Upcoming Orders', path: '/orders/upcoming' },
        { title: 'Acknowledged Orders', path: '/orders/acknowledged' },
        { title: 'Dispatched Orders', path: '/orders/assigned' },
        { title: 'Shipped Orders', path: '/orders/shiped' },
        { title: 'Cancelled Orders', path: '/orders/cancelled' },
      ]
    },
    {
      title: 'Supplier Management',
      icon: <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />,
      children: [
        { title: 'All Supplier', path: '/suppliers' },
      ]
    },
    {
      title: 'Client Management',
      icon: <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />,
      children: [
        { title: 'All Clients', path: '/customers' },
      ]
    },
    {
      title: 'Local Partners',
      icon: <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />,
      children: [
        { title: 'All Local Patners', path: '/sale-representative' },
      ]
    },
    {
      title: 'Leads Dashboard',
      path: '/leads',
      icon: <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />,
      children: []
    },
    {
      title: 'Machine Subscriptions',
      icon: <path d="M18 6V4h2V2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14v-2h-4.03A4.966 4.966 0 0 0 18 16v-5H8v5c0 1.64.81 3.09 2.03 4H6V4h2v2c0 .55.45 1 1 1h8c.55 0 1-.45 1-1z" />,
      children: [
        { title: 'Subscription', path: '/subscription' },
        { title: 'Purchased', path: '/purchased' },
        { title: 'Addons', path: '/addons' }
      ]
    },
    {
      title: 'Invoice Management',
      icon: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />,
      children: [
        { title: 'Create Invoices', path: '/create-invoice' },
        { title: 'All Invoices', path: '/all-invoices' },
        { title: 'Customer Invoices', path: '/invoices' },
        { title: 'Direct Invoices', path: '/direct-invoices' },
      ]
    },
    {
      title: 'Payment Pullouts',
      icon: <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" />,
      children: [
        { title: 'Pullouts', path: '/pullouts' },
      ]
    },
    {
      title: 'Inventory Mangement',
      icon: <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4l16-.02V7z" />,
      children: [
        { title: 'Inventory Stock', path: '/inventory/stock' },
      ]
    },
    {
      title: 'Category Mangement',
      icon: <path d="m12 2-5.5 9h11z M3 13.5h8v8H3z M17.5 13c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5z" />,
      children: [
        { title: 'Category', path: '/category' },
      ]
    },
    {
      title: 'Employee Mangement',
      icon: <path d="M10 4c2.21 0 4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4s1.79-4 4-4z M10.67 13.02c-.22-.01-.44-.02-.67-.02-2.42 0-4.68.67-6.61 1.82-.88.52-1.39 1.5-1.39 2.53V20h9.26a6.963 6.963 0 0 1-.59-6.98z M20.75 16c0-.22-.03-.42-.06-.63l1.14-1.01-1-1.73-1.45.49c-.32-.27-.68-.48-1.08-.63L18 11h-2l-.3 1.49c-.4.15-.76.36-1.08.63l-1.45-.49-1 1.73 1.14 1.01c-.03.21-.06.41-.06.63s.03.42.06.63l-1.14 1.01 1 1.73 1.45-.49c.32.27.68.48 1.08.63L16 21h2l.3-1.49c.4-.15.76-.36 1.08-.63l1.45.49 1-1.73-1.14-1.01c.03-.21.06-.41.06-.63z M17 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />,
      children: [
        { title: 'Employee', path: '/employee' },
        { title: 'Payouts', path: '/payouts' },
      ]
    },
    {
      title: 'Zone Mangement',
      icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />,
      children: [
        { title: 'All Countries', path: '/countries' },
      ]
    },
    {
      title: 'Shipping Charges Management',
      path: '/shipping-charges',
      icon: <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />,
      children: []
    },
    {
      title: 'Report Management',
      path: '/reports',
      icon: <path d="M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2 1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93 0-1.1-.9-2-2-2z" />,
      children: []
    },
    {
      title: 'Testing Requests',
      path: '/tasting-requests',
      icon: <path d="M18 6V4h2V2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14v-2h-4.03A4.966 4.966 0 0 0 18 16v-5H8v5c0 1.64.81 3.09 2.03 4H6V4h2v2c0 .55.45 1 1 1h8c.55 0 1-.45 1-1z" />,
      children: []
    },
    {
      title: 'QuickBooks',
      icon: <path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1 2 6v2h20V6z" />,
      children: [
        { title: 'Go to Quickbooks', path:'https://accounts.intuit.com/app/sign-in?redirect_uri=https%3A%2F%2Fappcenter.intuit.com%2Fapp%2Fconnect%2Foauth2%3Fclient_id%3DABoSKGEIR0Xd3KjnFMAYnSocOp67PPbRcm9OjsFMgC5dryPYpJ%26redirect_uri%3Dhttps%253A%252F%252Fstageadmin.busybeancoffee.com%252FQuickbooks%26response_type%3Dcode%26scope%3Dcom.intuit.quickbooks.accounting%2520openid%2520profile%2520email%2520phone%2520address%26state%3D2trbrgxc&single_sign_on=false&app_group=QBO&asset_alias=Intuit.devx.appsdotcomreverseproxy&partner_uid_button=google&appfabric=true'},
        { title: 'Clients', path: '/Quickbooks/clients' }
      ]
    },
    {
      title: 'Logout',
      path:'#',
      icon: <path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />,
      children: [
      ]
    },
    
  ];