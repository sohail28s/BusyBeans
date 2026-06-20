import { Routes, Route } from "react-router-dom";
import LocalPartnerManagement from "../Pages/LocalPartner/LocalPartnerManagement";
import LocalPartnerDetails from "../Pages/LocalPartner/LocalPartnerDetails";
import AddLocalPartner from "../Pages/LocalPartner/AddLocalPartner";
import EditLocalPartner from "../Pages/LocalPartner/EditLocalPartner";
import PendingPullouts from "../Pages/LocalPartner/PendingPullouts";


export default function LocalPartnerRoutes() {
    return (
      
        <Routes>
            <Route path="/" element={<LocalPartnerManagement />} />
            <Route path="/details/:id" element={<LocalPartnerDetails />} />
            <Route path="/add" element={<AddLocalPartner />} />
            <Route path="/edit/:id" element={<EditLocalPartner />} />
            <Route path="/pending-pullouts/:id" element={<PendingPullouts />} />
        </Routes>
    );
}