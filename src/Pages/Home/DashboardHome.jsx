import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import useStore from '../../Hooks/useStore'; 
import WelcomeBanner from '../../Components/Home/WelcomeBanner'; 
import SalesCard from '../../Components/Home/Cards/SalesCard'; 
import ListCard from '../../Components/Home/Cards/ListCard'; 
import EmployeeListCard from '../../Components/Home/Cards/EmployeeListCard'; 

const formatDate = (dateObj) => { 
    const year = dateObj.getFullYear(); 
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const day = String(dateObj.getDate()).padStart(2, '0'); 
    return `${year}-${month}-${day}`; 
}; 

const today = new Date(); 
const mtdStart = formatDate(new Date(today.getFullYear(), today.getMonth(), 1)); 
const mtdEnd = formatDate(today); 

const lastMonthStart = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)); 
const lastMonthEnd = formatDate(new Date(today.getFullYear(), today.getMonth(), 0)); 

const ytdStart = formatDate(new Date(today.getFullYear(), 0, 1));
const ytdEnd = formatDate(new Date(today.getFullYear(), 11, 31));

const DashboardHome = () => { 
  
    const setTitle = useStore((state) => state.setTitle); 
    const setActions = useStore((state) => state.setActions); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading); 
    const userRole = useStore((state) => state.userRole);
    const navigate = useNavigate(); 
    
    const [dashboardData, setDashboardData] = useState(null); 
    const [currentFilter, setCurrentFilter] = useState({ type: 'All', partner: null }); 
    
    const handleFilterUpdate = (type, partner) => { 
        setCurrentFilter({ type, partner }); 
    }; 
    
    const navigateWithFilters = (basePath, specificParams = {}) => { 
        const params = new URLSearchParams(); 
        
        Object.keys(specificParams).forEach(key => { 
            if (specificParams[key]) { 
                params.append(key, specificParams[key]); 
            } 
        }); 
        if (currentFilter.type === 'Local Partner' && currentFilter.partner) { 
            params.append('role', 'local_partner'); 
            params.append('salesRepId', currentFilter.partner.id); 
            params.append('filterNames', currentFilter.partner.srName || currentFilter.partner.name); 
        } else if (currentFilter.type === 'Admin') { 
            params.append('role', 'admin'); 
        } 
        
        navigate(`${basePath}?${params.toString()}`); 
    }; 
    
    const handleSalesClick = () => navigateWithFilters('/reports/customers', { startDate: mtdStart, endDate: mtdEnd }); 
    const handleLastMonthSalesClick = () => navigateWithFilters('/reports/customers', { startDate: lastMonthStart, endDate: lastMonthEnd }); 
    
    const handleMTDCustomerClick = (item) => navigateWithFilters(`/reports/customer-detail/${item.id}`, { startDate: mtdStart, endDate: mtdEnd }); 
    const handleAllMTDCustomers = () => navigateWithFilters('/reports/customers', { startDate: mtdStart, endDate: mtdEnd }); 
    
   
    const handleLastMonthCustomerClick = (item) => navigateWithFilters(`/reports/customer-detail/${item.id}`, { startDate: lastMonthStart, endDate: lastMonthEnd }); 
    const handleAllLastMonthCustomers = () => navigateWithFilters('/reports/customers', { startDate: lastMonthStart, endDate: lastMonthEnd }); 
    

    const handleMTDFranchiseeClick = (item) => navigateWithFilters('/reports/customers', { startDate: mtdStart, endDate: mtdEnd, role: 'local_partner', salesRepId: item.id, filterNames: item.label }); 
    const handleAllMTDFranchisees = () => navigateWithFilters('/reports/customers', { startDate: mtdStart, endDate: mtdEnd }); 
    

    const handleYTDFranchiseeClick = (item) => navigateWithFilters('/reports/customers', { startDate: ytdStart, endDate: ytdEnd, role: 'local_partner', salesRepId: item.id, filterNames: item.label }); 
    const handleAllYTDFranchisees = () => navigateWithFilters('/reports/customers', { startDate: ytdStart, endDate: ytdEnd }); 
    
   
    const handleMTDProductClick = (item) => navigateWithFilters('/reports/products', { startDate: mtdStart, endDate: mtdEnd, productId: item.id }); 
    const handleAllMTDProducts = () => navigateWithFilters('/reports/products', { startDate: mtdStart, endDate: mtdEnd }); 
    
    const handleYTDProductClick = (item) => navigateWithFilters('/reports/products', { startDate: ytdStart, endDate: ytdEnd, productId: item.id }); 
    const handleAllYTDProducts = () => navigateWithFilters('/reports/products', { startDate: ytdStart, endDate: ytdEnd }); 
    
    
    const handleMTDEmployeeClick = (item) => navigateWithFilters('/reports/customers', { startDate: mtdStart, endDate: mtdEnd, role: 'employee', employeeId: item.id, filterNames: item.name }); 
    const handleAllMTDEmployees = () => navigateWithFilters('/reports/employees', { startDate: mtdStart, endDate: mtdEnd }); 
    
    const handleYTDEmployeeClick = (item) => navigateWithFilters('/reports/customers', { startDate: ytdStart, endDate: ytdEnd, role: 'employee', employeeId: item.id, filterNames: item.name }); 
    const handleAllYTDEmployees = () => navigateWithFilters('/reports/employees', { startDate: ytdStart, endDate: ytdEnd }); 
    
    
    useEffect(() => { 
        setTitle(''); 
        setActions(null); 
        
        const fetchDashboardData = async () => { 
            const loadingTimer = setTimeout(() => setIsGlobalLoading(true), 200); 
            try { 
                let apiUrl = `https://testingbb.trimworldwide.com/api/v1/admin/dashboard/sales?mtdStart=${mtdStart}&mtdEnd=${mtdEnd}&lastMonthStart=${lastMonthStart}&lastMonthEnd=${lastMonthEnd}`; 
                
                if (currentFilter.type === 'Local Partner' && currentFilter.partner) { 
                    apiUrl += `&salesRepId=${currentFilter.partner.id}`; 
                } else if (currentFilter.type === 'Admin') { 
                    apiUrl += `&role=admin`; 
                } 
                
                const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }); 
                if (response.data.status === 'success') { 
                    setDashboardData(response.data.data); 
                } 
            } catch (error) { 
                console.error("Error fetching dashboard data:", error); 
            } finally { 
                clearTimeout(loadingTimer); 
                setIsGlobalLoading(false); 
            } 
        }; 
        
        fetchDashboardData(); 
    }, [setTitle, setActions, setIsGlobalLoading, currentFilter]); 
    
    return ( 
        <div className="w-full pb-10 bg-white"> 
            <WelcomeBanner onFilterChange={handleFilterUpdate} /> 
            
            {dashboardData && ( 
                <> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6"> 
                        <SalesCard title="Month-to-Date Sales" totalSales={dashboardData.monthToDateSales.totalSales} orders={dashboardData.monthToDateSales.orders} avgOrderValue={dashboardData.monthToDateSales.avgOrderValue} vsLastMonthPercent={dashboardData.monthToDateSales.vsLastMonthPercent} onActionClick={handleSalesClick} /> 
                        <ListCard title="MTD Sales by Customer" showArrowOnValue={true} emptyMessage="customer data" buttonText="View Report" onItemClick={handleMTDCustomerClick} onActionClick={handleAllMTDCustomers} data={(dashboardData.mtdSalesByCustomer || []).map(item => ({ id: item.customerId, label: item.customerName, value: item.totalSales }))} /> 
                        <SalesCard title="Last Month Sales" totalSales={dashboardData.lastMonthSales.totalSales} orders={dashboardData.lastMonthSales.orders} avgOrderValue={dashboardData.lastMonthSales.avgOrderValue} monthClosed={dashboardData.lastMonthSales.monthClosed} onActionClick={handleLastMonthSalesClick} /> 
                        <ListCard title="Last Month Sales by Customer" showArrowOnValue={true} emptyMessage="customer data" buttonText="View Report" onItemClick={handleLastMonthCustomerClick} onActionClick={handleAllLastMonthCustomers} data={(dashboardData.lastMonthSalesByCustomer || []).map(item => ({ id: item.customerId, label: item.customerName, value: item.totalSales }))} /> 
                        
                        
                         {userRole === 'admin' && (
                        <ListCard title="MTD Sales by Franchisee" emptyMessage="franchisee data" buttonText="View All" onItemClick={handleMTDFranchiseeClick} onActionClick={handleAllMTDFranchisees} data={(dashboardData.mtdSalesByFranchisee || []).map(item => ({ id: item.franchiseeId, label: item.franchiseeName, value: item.totalSales }))} /> )}


                         {userRole === 'admin' && (
                        <ListCard title="YTD Sales by Franchisee" subtitle="Fiscal Year to Date" emptyMessage="franchisee data" buttonText="View All" onItemClick={handleYTDFranchiseeClick} onActionClick={handleAllYTDFranchisees} data={(dashboardData.ytdSalesByFranchisee || []).map(item => ({ id: item.franchiseeId, label: item.franchiseeName, value: item.totalSales }))} /> 
                         )}



                        <EmployeeListCard title="MTD Sales by Product" countLabel="Qty" emptyMessage="product data" buttonText="View All" onItemClick={handleMTDProductClick} onActionClick={handleAllMTDProducts} data={(dashboardData.mtdSalesByProduct || []).map(item => ({ id: item.productId, name: item.productName, count: item.totalQuantity, value: item.totalSales }))} />


                        <EmployeeListCard title="YTD Sales by Product" subtitle="Fiscal Year to Date" countLabel="Qty" emptyMessage="product data" buttonText="View All" onItemClick={handleYTDProductClick} onActionClick={handleAllYTDProducts} data={(dashboardData.ytdSalesByProduct || []).map(item => ({ id: item.productId, name: item.productName, count: item.totalQuantity, value: item.totalSales }))} /> 
                    

                         {userRole === 'admin' && (
                        <EmployeeListCard title="MTD Sales by Employee" emptyMessage="employee data" buttonText="" onItemClick={handleMTDEmployeeClick} onActionClick={handleAllMTDEmployees} data={(dashboardData.mtdSalesByEmployee || []).map(item => ({ id: item.employeeId, name: item.employeeName, email: item.employeeEmail, orders: item.totalOrders, value: item.totalSales }))} /> 
                        )}
                        {userRole === 'admin' && (
                        <EmployeeListCard title="YTD Sales by Employee" subtitle="Fiscal Year to Date" emptyMessage="employee data" buttonText="" onItemClick={handleYTDEmployeeClick} onActionClick={handleAllYTDEmployees} data={(dashboardData.ytdSalesByEmployee || []).map(item => ({ id: item.employeeId, name: item.employeeName, email: item.employeeEmail, orders: item.totalOrders, value: item.totalSales }))} /> 
                         )}
                    </div> 
                </> 
            )} 
        </div> 
    ); 
}; 

export default DashboardHome;





