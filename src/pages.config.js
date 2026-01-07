import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Suppliers from './pages/Suppliers';
import CompletedProjects from './pages/CompletedProjects';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Customers": Customers,
    "Projects": Projects,
    "ProjectDetail": ProjectDetail,
    "Suppliers": Suppliers,
    "CompletedProjects": CompletedProjects,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};