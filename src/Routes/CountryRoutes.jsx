import { Routes, Route } from "react-router-dom";
import CountryManagement from "../Pages/ZoneManagement/CountryManagement";
import StateManagement from "../Pages/ZoneManagement/StatesPage";
import CityAndTerritoryManagement from "../Pages/ZoneManagement/CityAndTerritoryManagement";

export default function CountryRoutes() {
    return (

        <Routes>
            <Route path="/" element={<CountryManagement />} />
            <Route path="/:countryId/state" element={<StateManagement />} />
            <Route path="/:countryId/state/:stateId" element={<CityAndTerritoryManagement />} />
        </Routes>
    );
}