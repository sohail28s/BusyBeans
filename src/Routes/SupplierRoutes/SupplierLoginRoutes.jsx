import { Routes, Route } from "react-router-dom";
import SupplierPartnerNewOrders from "../../Pages/SupplierUserPages/PartnerOrders/PartnerNewOrders";
import SupplierPartnerShippedOrders from "../../Pages/SupplierUserPages/PartnerOrders/PartnerShippedOrders";
import SupplierPartnerAcknowledgedOrders from "../../Pages/SupplierUserPages/PartnerOrders/PartnerAcknowledgedOrders";
import SupplierCustomerNewOrders from "../../Pages/SupplierUserPages/CustomerOrders/CustomerNewOrders";
import SupplierCustomerAcknowledgedOrders from "../../Pages/SupplierUserPages/CustomerOrders/CustomerAcknowledged";
import SupplierCustomerShippedOrders from "../../Pages/SupplierUserPages/CustomerOrders/CustomerShipped";
import SupplierReportManagement from "../../Pages/SupplierUserPages/SupplierReports";
import { AssignLeadModal } from "../../Components/LeadsDashboard/AssignLeadModal";
import AssignedOrdersReport from "../../Components/SupplierUser/Reports/AssignedOrdersReport";
import OrderStatusReport from "../../Components/SupplierUser/Reports/OrderStatusReport";
import TopProductsReport from "../../Components/SupplierUser/Reports/TopProductsReport";
import SupplierCustomerOrderDetail from "../../Components/SupplierUser/OrderDetails/CustomerOrders/SupplierCustomerOrderDetail";

export default function SupplierLoginRoutes() {
    return (
        <Routes>
            <Route path="/partner/new-orders" element={<SupplierPartnerNewOrders />} />
            <Route path="/partner/acknowledged-orders" element={<SupplierPartnerAcknowledgedOrders />} />
            <Route path="/partner/shipped-orders" element={<SupplierPartnerShippedOrders />} />

            
            <Route path="/assigned-orders" element={<SupplierCustomerNewOrders />} />
            <Route path="/acknowledge-orders" element={<SupplierCustomerAcknowledgedOrders />} />
            <Route path="/shiped-orders" element={<SupplierCustomerShippedOrders />} />





            <Route path="/order-detail/:id" element={<SupplierCustomerOrderDetail />} />















            <Route path="/reports" element={<SupplierReportManagement />} />
            <Route path="/reports/assigned-orders" element={<AssignedOrdersReport />} />
            <Route path="/reports/orders-status" element={<OrderStatusReport />} />
            <Route path="/reports/top-products-ordered" element={<TopProductsReport />} />




        </Routes>
    )
};