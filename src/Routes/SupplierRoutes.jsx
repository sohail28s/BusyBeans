import { Routes, Route } from "react-router-dom"; // <-- 1. Import Routes

import AddSupplier from "../Pages/SupplierManagement/AddSupplier";
import EditSupplier from "../Pages/SupplierManagement/EditSupplier";
import SupplierDetails from "../Pages/SupplierManagement/SupplierDetails";
import SupplierManagement from "../Pages/SupplierManagement/SupplierManagement";

export default function SupplierRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SupplierManagement />} />
            <Route path="/add" element={<AddSupplier />} />
            <Route path="/details/:id" element={<SupplierDetails />} />
            <Route path="/edit/:id" element={<EditSupplier />} />
        </Routes>
    );
}