import { Routes, Route } from 'react-router-dom';
import CustomerReports from '../Pages/Reports/CustomerReports';
import CustomerDetailReport from '../Pages/Reports/CustomerDetailReport';
import ProductReports from '../Pages/Reports/ProductReports';
import ReportManagement from '../Pages/ReportsManagement/ReportManagement';
import PartnerCommissionPage from '../Pages/Reports/PartnerCommissionPage';
import PartnerCreditLimitPage from '../Pages/Reports/PartnerCreditLimitPage';
import ProductSalesPage from '../Pages/Reports/ProductSalesPage';
import DirectPartnerPage from '../Pages/Reports/DirectPartnerPage';
import CustomersReportPage from '../Pages/Reports/CustomersReportPage';
import PulledOrdersPage from '../Pages/Reports/PulledOrdersPage';
import UnpaidPartnerBalancePage from '../Pages/Reports/UnpaidPartnerBalancePage';

export default function ReportRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ReportManagement />} />
      <Route path="customers" element={<CustomerReports />} />
      <Route path="customer-detail/:id" element={<CustomerDetailReport />} />
      <Route path="products" element={<ProductReports />} />
      <Route path="/partner-commission" element={<PartnerCommissionPage />} />
      <Route path="/partner-credit-limit" element={<PartnerCreditLimitPage />} />
      <Route path="/products-sale" element={<ProductSalesPage />} />
      <Route path="/direct-partner" element={<DirectPartnerPage />} />
      <Route path="/sales-by-customer-summary" element={<CustomerReports />} />
      <Route path="/sales-by-customer-details" element={<CustomerDetailReport />} />
      <Route path="/product-wise-sales-summary" element={<ProductReports />} />
      <Route path="/customer" element={<CustomersReportPage/>} />
      <Route path="/pulled-orders-receivable" element={<PulledOrdersPage/>} />
      <Route path="/unpaid-partner-balances" element={<UnpaidPartnerBalancePage/>} />
    


    </Routes>
  );
}