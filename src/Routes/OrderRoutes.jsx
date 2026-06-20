import { Routes, Route } from 'react-router-dom';
import CreateOrder from '../Pages/OrderManagement/CreateOrder'
import SendOrderEmails from '../Pages/OrderManagement/SendOrderEmails'
import EmailLogs from '../Pages/OrderManagement/EmailLogs'
import DeleteInvoice from '../Pages/OrderManagement/DeleteInvoice'
import PartnerInvoices from '../Pages/QuickbooksInvoices/PartnerInvoices';
import CustomerInvoices from '../Pages/QuickbooksInvoices/CustomerInvoices';
import NewOrders from '../Pages/PartnerOrders/NewOrders';
import NewCustomerOrders from '../Pages/CustomerOrders/NewCustomerOrders';
import AllCustomerOrders from '../Pages/CustomerOrders/AllCustomerOrders';
import CustomerDispatchedOrders from '../Pages/CustomerOrders/CustomerDispatchedOrders';
import CustomerAcknowledgedOrders from '../Pages/CustomerOrders/AcknowledgedOrders';
import CustomerShippedOrders from '../Pages/CustomerOrders/CustomerShippedOrders';
import CustomerCancelledOrders from '../Pages/CustomerOrders/CustomerCancelledOrders';
import UpcomingCustomerOrders from '../Pages/CustomerOrders/CustomerUpcomingOrders';
import DispatchOrders from '../Pages/PartnerOrders/DispatchOrders';
import AcknowledgedOrders from '../Pages/PartnerOrders/AcknowledgedOrders';
import ShippedOrders from '../Pages/PartnerOrders/ShippedOrders';
import CancelledOrders from '../Pages/PartnerOrders/CancelledOrders';
import RegularOrderDetailsPage from '../Components/Shared/OrderDetailsPage';
import UpdateInvoicePage from '../Pages/InvoiceManagement/UpdateInvoice';
import InvoicePage from '../Components/Shared/InvoicePage';
import EditOrderAddressesPage from '../Components/Shared/OrderDetails/EditAddressPage';

export default function OrderRoutes() {
  return (
    <Routes>
      <Route path="create" element={<CreateOrder />} />
      <Route path="emails" element={<SendOrderEmails />} />
      <Route path="email-logs" element={<EmailLogs />} />
      <Route path="delete-invoice" element={<DeleteInvoice />} />
      <Route path="/quickbooks/partner" element={<PartnerInvoices />} />
      <Route path="/quickbooks/customer" element={<CustomerInvoices />} />

      <Route path="/partnerOrders/new-orders" element={<NewOrders />} />
      <Route path="/partnerOrders/dispatched" element={<DispatchOrders />} />
      <Route path="/partnerOrders/acknowledged" element={<AcknowledgedOrders />} />
      <Route path="/partnerOrders/shipped" element={<ShippedOrders />} />
      <Route path="/partnerOrders/cancelled" element={<CancelledOrders />} />
      <Route path="/partnerOrders/detail/:id" element={<RegularOrderDetailsPage />} />
      <Route path="/partnerOrders/detail/:id/invoice" element={<InvoicePage />} />

      <Route path="/new-orders" element={<NewCustomerOrders />} />
      <Route path="/all-orders" element={<AllCustomerOrders />} />
      <Route path="/assigned" element={<CustomerDispatchedOrders />} />
      <Route path="/acknowledged" element={<CustomerAcknowledgedOrders/>} />
      <Route path="/shiped" element={<CustomerShippedOrders />} />
      <Route path="/cancelled" element={<CustomerCancelledOrders />} />
      <Route path="/upcoming" element={<UpcomingCustomerOrders />} />
      <Route path="/details/:id" element={<RegularOrderDetailsPage />} />
      <Route path="/details/:id/invoice" element={<InvoicePage />} />
      <Route path="/details/:id/edit" element={<EditOrderAddressesPage />} />

      <Route path="partnerOrders/detail/:id/add-invoice" element={<UpdateInvoicePage />} />
      <Route path="/detail/:id/add-invoice" element={<UpdateInvoicePage />} />
    </Routes>
  );
}