import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Customers": Customers,
    "Projects": Projects,
    "ProjectDetail": ProjectDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};