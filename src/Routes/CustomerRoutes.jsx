import { Routes, Route } from "react-router-dom"; 
import CustomerManagement from "../Pages/ClientManagement/CustomerManagement";
import AddCustomer from "../Pages/ClientManagement/AddCustomers";
import CustomerDetails from "../Pages/ClientManagement/CustomerDetails";
import EditCustomer from "../Pages/ClientManagement/EditCustomer";


export default function CustomerRoutes() {
    return (
   
        <Routes>
            <Route path="/" element={<CustomerManagement />} />
          <Route path="/add" element={<AddCustomer />} />
          <Route path="/:id" element={<CustomerDetails />} />
          <Route path="/edit/:id" element={<EditCustomer />} />
        </Routes>
    );
}