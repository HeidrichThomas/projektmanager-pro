import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    LayoutDashboard, Building2, FolderKanban, Database,
    Menu, ChevronRight, CheckCircle2, Lightbulb, Search, X, User, Layers, Navigation
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

import MiniActivityCalendar from "@/components/layout/MiniActivityCalendar";

const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Projekte", icon: FolderKanban, page: "Projects" },
    { name: "Kunden & Lieferanten", icon: Building2, page: "Customers" },
    { name: "Business Themen", icon: Lightbulb, page: "Themes" },
];

const themeNavigation = [
    { name: "Private Themen", icon: User, page: "PrivateThemes" },
];

const bottomNavigation = [
    { name: "Fahrtenbuch", icon: Navigation, page: "TravelTracking" },
    { name: "Datensicherung", icon: Database, page: "DataBackup" }
];

export default function Layout({ children, currentPageName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Load and apply settings on mount
    useEffect(() => {
        const saved = localStorage.getItem('app-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                
                // Apply theme
                if (settings.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                
                // Apply display style
                document.documentElement.classList.remove('style-classic', 'style-modern', 'style-windows');
                if (settings.displayStyle) {
                    document.documentElement.classList.add(`style-${settings.displayStyle}`);
                }
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        }
    }, []);

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => base44.entities.Task.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: subThemes = [] } = useQuery({
        queryKey: ['subThemes'],
        queryFn: () => base44.entities.SubTheme.list()
    });

    const searchResults = searchQuery.length > 1 ? {
        customers: customers.filter(c => 
            c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        projects: projects.filter(p => 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        tasks: tasks.filter(t => 
            t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        themes: themes.filter(th => 
            th.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            th.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        subThemes: subThemes.filter(st => 
            st.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            st.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    } : null;

    const totalResults = searchResults ? 
        searchResults.customers.length + 
        searchResults.projects.length + 
        searchResults.tasks.length + 
        searchResults.themes.length + 
        searchResults.subThemes.length : 0;

    const NavLink = ({ item, mobile = false }) => {
        const isActive = currentPageName === item.page;
        return (
            <Link
                to={createPageUrl(item.page)}
                onClick={() => mobile && setMobileMenuOpen(false)}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col print:!hidden">
                <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-6 pb-4 overflow-y-auto">
                    <div className="px-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <FolderKanban className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">ProjektManager</h1>
                                <p className="text-xs text-slate-500">Aufgaben & Projekte</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Input
                                placeholder="Suchen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && searchQuery.length > 1) {
                                        setShowSearchResults(true);
                                    }
                                }}
                                className="pr-16 h-9 text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setShowSearchResults(false);
                                    }}
                                    className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (searchQuery.length > 1) {
                                        setShowSearchResults(true);
                                    }
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <div key={item.name}>
                                <NavLink item={item} />
                                {item.page === "Themes" && (
                                    <div className="space-y-3">
                                        <MiniActivityCalendar />
                                        {themeNavigation.map((themeItem) => (
                                            <NavLink key={themeItem.name} item={themeItem} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <nav className="px-4 space-y-1 border-t border-slate-200 pt-4">
                        {bottomNavigation.map((item) => (
                            <NavLink key={item.name} item={item} />
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 print:!hidden">
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
                    <SheetContent side="left" className="w-72 p-0">
                        <div className="flex flex-col h-full bg-white pt-6 pb-4">
                            <div className="px-6 mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                        <FolderKanban className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-slate-900">ProjektManager</span>
                                </div>
                            </div>
                            
                            <nav className="flex-1 px-4 space-y-1">
                                {navigation.map((item) => (
                                    <NavLink key={item.name} item={item} mobile />
                                ))}
                                {themeNavigation.map((item) => (
                                    <NavLink key={item.name} item={item} mobile />
                                ))}
                            </nav>

                            <nav className="px-4 space-y-1 border-t border-slate-200 pt-4">
                                {bottomNavigation.map((item) => (
                                    <NavLink key={item.name} item={item} mobile />
                                ))}
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="lg:pl-72">
                {children}
            </main>

            {/* Search Results Dialog */}
            <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Suchergebnisse für "{searchQuery}"
                        </DialogTitle>
                        <p className="text-sm text-slate-500">{totalResults} Ergebnisse gefunden</p>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {searchResults?.customers.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Kunden ({searchResults.customers.length})
                                </h3>
                                <div className="space-y-2">
                                    {searchResults.customers.map(customer => (
                                        <Link key={customer.id} to={createPageUrl("Customers")} onClick={() => setShowSearchResults(false)}>
                                            <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="font-medium text-slate-900">{customer.company}</div>
                                                {customer.contact_name && (
                                                    <div className="text-sm text-slate-500">{customer.contact_name}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchResults?.projects.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <FolderKanban className="w-4 h-4" />
                                    Projekte ({searchResults.projects.length})
                                </h3>
                                <div className="space-y-2">
                                    {searchResults.projects.map(project => (
                                        <Link key={project.id} to={createPageUrl("ProjectDetail") + `?id=${project.id}`} onClick={() => setShowSearchResults(false)}>
                                            <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="font-medium text-slate-900">{project.name}</div>
                                                {project.description && (
                                                    <div className="text-sm text-slate-500 line-clamp-1">{project.description}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchResults?.tasks.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Aufgaben ({searchResults.tasks.length})
                                </h3>
                                <div className="space-y-2">
                                    {searchResults.tasks.map(task => (
                                        <Link key={task.id} to={createPageUrl("ProjectDetail") + `?id=${task.project_id}`} onClick={() => setShowSearchResults(false)}>
                                            <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="font-medium text-slate-900">{task.title}</div>
                                                {task.description && (
                                                    <div className="text-sm text-slate-500 line-clamp-1">{task.description}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchResults?.themes.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Themen ({searchResults.themes.length})
                                </h3>
                                <div className="space-y-2">
                                    {searchResults.themes.map(theme => (
                                        <Link key={theme.id} to={createPageUrl("ThemeDetail") + `?id=${theme.id}`} onClick={() => setShowSearchResults(false)}>
                                            <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="font-medium text-slate-900">{theme.name}</div>
                                                {theme.description && (
                                                    <div className="text-sm text-slate-500 line-clamp-1">{theme.description}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchResults?.subThemes.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    Unterthemen ({searchResults.subThemes.length})
                                </h3>
                                <div className="space-y-2">
                                    {searchResults.subThemes.map(subTheme => (
                                        <Link key={subTheme.id} to={createPageUrl("SubThemeDetail") + `?id=${subTheme.id}&themeId=${subTheme.parent_theme_id}`} onClick={() => setShowSearchResults(false)}>
                                            <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="font-medium text-slate-900">{subTheme.name}</div>
                                                {subTheme.description && (
                                                    <div className="text-sm text-slate-500 line-clamp-1">{subTheme.description}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {totalResults === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>Keine Ergebnisse für "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            </div>
            );
            }