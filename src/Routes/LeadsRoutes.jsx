import { Routes, Route } from "react-router-dom"; 
import LeadsDashboard from "../Pages/LeadsDashboard/LeadsDashboardPage";
import LeadDetails from "../Pages/LeadsDashboard/LeadsDetails";


export default function LeadRoutes() {
    return (
   
        <Routes>
          
          <Route path="/" element={< LeadsDashboard />} />
          <Route path="/:id" element={<LeadDetails />} />
        </Routes>
    );
}