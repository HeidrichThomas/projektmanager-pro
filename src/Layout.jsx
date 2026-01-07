import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
    LayoutDashboard, Building2, FolderKanban, Database,
    Menu, X, ChevronRight, CheckCircle2, Sun, Moon
} from "lucide-react";

const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Projekte", icon: FolderKanban, page: "Projects" },
    { name: "Kunden & Lieferanten", icon: Building2, page: "Customers" },
    { name: "Abgeschlossene Projekte", icon: CheckCircle2, page: "CompletedProjects" },
    { name: "Datensicherung", icon: Database, page: "DataBackup" }
];

export default function Layout({ children, currentPageName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const isDark = saved === 'dark';
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newMode);
    };

    const NavLink = ({ item, mobile = false }) => {
        const isActive = currentPageName === item.page;
        return (
            <Link
                to={createPageUrl(item.page)}
                onClick={() => mobile && setMobileMenuOpen(false)}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                    }
                `}
            >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 pt-6 pb-4 overflow-y-auto">
                    <div className="px-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <FolderKanban className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">ProjektManager</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Aufgaben & Projekte</p>
                            </div>
                        </div>
                    </div>
                    
                    <nav className="flex-1 px-4 space-y-1">
                        {navigation.map((item) => (
                            <NavLink key={item.name} item={item} />
                        ))}
                    </nav>

                    <div className="px-4 pb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {darkMode ? (
                                <>
                                    <Sun className="w-4 h-4" />
                                    Hell
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4" />
                                    Dunkel
                                </>
                            )}
                        </Button>
                    </div>
                    </div>
                    </aside>

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <FolderKanban className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-900">ProjektManager</span>
                </div>
                
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 dark:bg-zinc-900">
                        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 pt-6 pb-4">
                            <div className="px-6 mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                        <FolderKanban className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">ProjektManager</span>
                                </div>
                            </div>
                            
                            <nav className="flex-1 px-4 space-y-1">
                                {navigation.map((item) => (
                                    <NavLink key={item.name} item={item} mobile />
                                ))}
                            </nav>

                            <div className="px-4 pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    {darkMode ? (
                                        <>
                                            <Sun className="w-4 h-4" />
                                            Hell
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="w-4 h-4" />
                                            Dunkel
                                        </>
                                    )}
                                </Button>
                            </div>
                            </div>
                            </SheetContent>
                            </Sheet>

                            <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="flex items-center gap-2"
                            >
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                            </div>

            {/* Main Content */}
            <main className="lg:pl-72">
                {children}
            </main>
        </div>
    );
}