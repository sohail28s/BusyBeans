import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import {Login} from './Components/Login/login.jsx';
import MainLayout from './Layout/MainLayout';
import DashboardHome from './Pages/Home/DashboardHome';
import OrderRoutes from './Routes/OrderRoutes';
import ReportRoutes from './Routes/ReportRoutes';
import SupplierRoutes from './Routes/SupplierRoutes.jsx';
import LocalPartnerRoutes from './Routes/LocalPartnerRoutes.jsx';
import CustomerManagement from './Pages/ClientManagement/CustomerManagement.jsx';
import CustomerDetails from './Pages/ClientManagement/CustomerDetails.jsx';
import CustomerRoutes from './Routes/CustomerRoutes.jsx';
import LeadRoutes from './Routes/LeadsRoutes.jsx';
import Subscribe from './Pages/MachineSubscriptions/Subscription.jsx';
import PurchasedSubscriptions from './Pages/MachineSubscriptions/PurchasedSubscriptions.jsx';
import { SubscriptionDetailsPage } from './Pages/MachineSubscriptions/SubscriptionDetailsPage.jsx';
import AddonsPage from './Pages/MachineSubscriptions/AddonsPage.jsx';
import InventoryManagement from './Pages/InventoryManagement/InventoryManagemnet.jsx';
import CategoryManagement from './Components/CategoriesManagement/CategoryManagement.jsx';
import CountryManagement from './Pages/ZoneManagement/CountryManagement.jsx';
import ShippingChargesManagement from './Pages/ShippingCharges/ShippingChargesManagement.jsx';
import TastingRequests from './Pages/TastingRequest/TastingRequest.jsx';
import QuickbooksManagement from './Components/Quickbooks/QuickbooksManagement.jsx';
import EmployeeManagement from './Pages/EmployeeManagement/EmployeeManagement.jsx';
import EmployeeDetails from './Pages/EmployeeManagement/EmployeeDetails.jsx';
import PaymentPullouts from './Pages/PaymentPullout/PaymentPulloutPage.jsx';
import Payouts from './Pages/EmployeeManagement/Payouts.jsx';
import  AllInvoicesPage  from './Pages/InvoiceManagement/All_Invoices.jsx';
import InvoiceManagementPage from './Pages/InvoiceManagement/InvoiceManagment.jsx';
import CreateInvoicePage from './Components/InvoiceManagement/CreateInvoice/CreateInvoicePage.jsx';
import UpdateInvoicePage from './Pages/InvoiceManagement/UpdateInvoice.jsx';
import DirectInvoiceDetailsPage from './Pages/InvoiceManagement/DirectInvoiceDetailsPage.jsx';
import PageLoader from './Hooks/PageLoader.jsx';
import ProfilePage from './Pages/Admin/ProfilePage.jsx';
import DirectInvoicesRoutes from './Routes/DirectInvoicesRoutes.jsx'
import ScrollWrapper from './Hooks/ScrollWrapper.jsx'
import PulloutIntentSyncPage from './Pages/QuickbooksInvoices/PulloutIntentsync.jsx';
import CountryRoutes from './Routes/CountryRoutes.jsx'
import ProtectedRoute from './Hooks/ProtectedRoute.jsx';
import ForgotPassword from './Components/Login/ForgotPassword.jsx';
import VerifyEmail from './Components/Login/VerifyEmail.jsx';
import ResetPassword from './Components/Login/ResetPassoword.jsx';
import SupplierLoginRoutes from './Routes/SupplierRoutes/SupplierLoginRoutes.jsx';
import AssignedOrdersReport from './Components/SupplierUser/Reports/AssignedOrdersReport.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <ScrollWrapper>
        <ToastContainer position="top-right" autoClose={3000} theme='dark' />
        <PageLoader />
        <Routes>
          <Route path="/sign-in" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/reports/*" element={<ReportRoutes />} />
              <Route path="/orders/*" element={<OrderRoutes />} />
              <Route path="/Quickbooks/invoices" element={<PulloutIntentSyncPage />} />
              <Route path="/suppliers/*" element={<SupplierRoutes />} />
              <Route path="/customers/*" element={<CustomerRoutes />} />
              <Route path="/sale-representative/*" element={<LocalPartnerRoutes />} />
              <Route path="/leads/*" element={<LeadRoutes />} />
              <Route path="/subscription" element={<Subscribe />} />
              <Route path="/purchased" element={<PurchasedSubscriptions />} />
              <Route path="/purchased/:id" element={<SubscriptionDetailsPage />} />
              <Route path="/addons" element={<AddonsPage />} />
              <Route path="/pullouts" element={<PaymentPullouts />} />
              <Route path="/inventory/stock" element={<InventoryManagement />} />
              <Route path="/category" element={<CategoryManagement />} />
              <Route path="/countries/*" element={<CountryRoutes />} />
              <Route path="/shipping-charges" element={<ShippingChargesManagement />} />
              <Route path="/tasting-requests" element={<TastingRequests />} />
              <Route path="/Quickbooks/clients" element={<QuickbooksManagement />} />
              <Route path="/employee" element={<EmployeeManagement />} />
              <Route path="/employees/:id" element={<EmployeeDetails />} />
              <Route path="/payouts" element={<Payouts />} />
              <Route path="/create-invoice" element={<CreateInvoicePage />} />
              <Route path="/all-invoices" element={<AllInvoicesPage />} />
              <Route path="/all-invoices/partner/:id" element={<DirectInvoiceDetailsPage />} />
              <Route path="/invoices" element={<InvoiceManagementPage />} />
              <Route path="/invoices/:id" element={<CustomerDetails />} />
              <Route path="/direct-invoices/*" element={<DirectInvoicesRoutes />} />


              <Route path="/supplier/*" element={<SupplierLoginRoutes />} />
            
          
              <Route path="*" element={<Navigate to="/" replace />}/>

            </Route>
          </Route>
        </Routes>
      </ScrollWrapper>
    </BrowserRouter>
  );
}




