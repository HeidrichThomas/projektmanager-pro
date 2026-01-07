import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CompletedProjects from './pages/CompletedProjects';
import DataBackup from './pages/DataBackup';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Customers": Customers,
    "Projects": Projects,
    "ProjectDetail": ProjectDetail,
    "CompletedProjects": CompletedProjects,
    "DataBackup": DataBackup,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};