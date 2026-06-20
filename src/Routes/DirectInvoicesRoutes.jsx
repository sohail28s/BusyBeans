import { Routes, Route } from "react-router-dom";
import DirectInvoicesPage from "../Pages/InvoiceManagement/DirectInvoices";
import DirectInvoiceDetailsPage from "../Pages/InvoiceManagement/DirectInvoiceDetailsPage";
import UpdateInvoicePage from "../Pages/InvoiceManagement/UpdateInvoice";
import InvoicePage from "../Components/Shared/InvoicePage";



export default function DirectInvoicesRoutes() {
    return (

        <Routes>
            <Route path="/" element={<DirectInvoicesPage />} />
            <Route path="/:id" element={<DirectInvoiceDetailsPage />} />
            <Route path="/partner/:id" element={<DirectInvoiceDetailsPage />} />
            <Route path="/:id/add-invoice" element={<UpdateInvoicePage />} />
            <Route path="/partner/:id/add-invoice" element={<UpdateInvoicePage />} />
            <Route path="/:id/invoice" element={<InvoicePage />} />
            <Route path="/partner/:id/invoice" element={<InvoicePage />} />
        </Routes>
    );
}