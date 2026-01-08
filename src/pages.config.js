import CompletedProjects from './pages/CompletedProjects';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import DataBackup from './pages/DataBackup';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Themes from './pages/Themes';
import ThemeDetail from './pages/ThemeDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CompletedProjects": CompletedProjects,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "DataBackup": DataBackup,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "Themes": Themes,
    "ThemeDetail": ThemeDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};