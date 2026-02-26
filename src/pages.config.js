/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import CompletedProjects from './pages/CompletedProjects';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import DataBackup from './pages/DataBackup';
import PrivateThemeDetail from './pages/PrivateThemeDetail';
import PrivateThemes from './pages/PrivateThemes';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import SubThemeDetail from './pages/SubThemeDetail';
import ThemeDetail from './pages/ThemeDetail';
import Themes from './pages/Themes';
import TravelTracking from './pages/TravelTracking';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CompletedProjects": CompletedProjects,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "DataBackup": DataBackup,
    "PrivateThemeDetail": PrivateThemeDetail,
    "PrivateThemes": PrivateThemes,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "SubThemeDetail": SubThemeDetail,
    "ThemeDetail": ThemeDetail,
    "Themes": Themes,
    "TravelTracking": TravelTracking,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};