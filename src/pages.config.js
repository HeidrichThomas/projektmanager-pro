import CompletedProjects from './pages/CompletedProjects';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import DataBackup from './pages/DataBackup';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import SubThemeDetail from './pages/SubThemeDetail';
import ThemeDetail from './pages/ThemeDetail';
import Themes from './pages/Themes';
import TravelTracking from './pages/TravelTracking';
import PrivateThemes from './pages/PrivateThemes';
import PrivateThemeDetail from './pages/PrivateThemeDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CompletedProjects": CompletedProjects,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "DataBackup": DataBackup,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "SubThemeDetail": SubThemeDetail,
    "ThemeDetail": ThemeDetail,
    "Themes": Themes,
    "TravelTracking": TravelTracking,
    "PrivateThemes": PrivateThemes,
    "PrivateThemeDetail": PrivateThemeDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};