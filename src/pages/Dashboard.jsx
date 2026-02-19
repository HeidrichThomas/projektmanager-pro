import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
    Building2, FolderKanban, CheckSquare, Calendar, 
    ArrowRight, Clock, AlertCircle, TrendingUp, Settings, Search, X, Lightbulb, User
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import ActiveTimers from "@/components/dashboard/ActiveTimers";
import DateTimeWeather from "@/components/dashboard/DateTimeWeather";
import TravelOverview from "@/components/dashboard/TravelOverview";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: customers = [], isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: projects = [], isLoading: loadingProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: tasks = [], isLoading: loadingTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => base44.entities.Task.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: privateThemes = [] } = useQuery({
        queryKey: ['privateThemes'],
        queryFn: () => base44.entities.PrivateTheme.list()
    });

    const isLoading = loadingCustomers || loadingProjects || loadingTasks;

    const activeProjects = projects.filter(p => p.status === 'in_arbeit');
    const openTasks = tasks.filter(t => t.status !== 'erledigt');
    const urgentTasks = openTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return isToday(dueDate) || isPast(dueDate);
    });

    const getCustomer = (id) => customers.find(c => c.id === id);

    // Search filtering
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
        privateThemes: privateThemes.filter(pt => 
            pt.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pt.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    } : null;

    const totalResults = searchResults ? 
        searchResults.customers.length + 
        searchResults.projects.length + 
        searchResults.tasks.length + 
        searchResults.themes.length + 
        searchResults.privateThemes.length : 0;

    const stats = [
        { 
            title: "Kunden", 
            value: customers.length, 
            icon: Building2, 
            color: "from-blue-500 to-blue-600",
            link: "Customers"
        },
        { 
            title: "Projekte", 
            value: projects.length, 
            icon: FolderKanban, 
            color: "from-indigo-500 to-indigo-600",
            link: "Projects"
        },
        { 
            title: "Offene Aufgaben", 
            value: openTasks.length, 
            icon: CheckSquare, 
            color: "from-amber-500 to-amber-600",
            link: "Projects"
        },
        { 
            title: "Dringende Aufgaben", 
            value: urgentTasks.length, 
            icon: AlertCircle, 
            color: "from-red-500 to-red-600",
            link: "Projects"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Willkommen zurück! Hier ist Ihre Projektübersicht.</p>
                </div>

                {/* Search Bar */}
                <Card className="mb-8 print:hidden">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Suche in Kunden, Projekten, Aufgaben, Themen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10 h-12 text-base"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {searchQuery.length > 1 && (
                    <Card className="mb-8 print:hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Suchergebnisse ({totalResults})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {totalResults === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>Keine Ergebnisse für "{searchQuery}"</p>
                                </div>
                            ) : (
                                <>
                                    {searchResults.customers.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Kunden ({searchResults.customers.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {searchResults.customers.map(customer => (
                                                    <Link key={customer.id} to={createPageUrl("Customers")}>
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

                                    {searchResults.projects.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <FolderKanban className="w-4 h-4" />
                                                Projekte ({searchResults.projects.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {searchResults.projects.map(project => (
                                                    <Link key={project.id} to={createPageUrl("ProjectDetail") + `?id=${project.id}`}>
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

                                    {searchResults.tasks.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4" />
                                                Aufgaben ({searchResults.tasks.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {searchResults.tasks.map(task => (
                                                    <Link key={task.id} to={createPageUrl("ProjectDetail") + `?id=${task.project_id}`}>
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

                                    {searchResults.themes.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4" />
                                                Business Themen ({searchResults.themes.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {searchResults.themes.map(theme => (
                                                    <Link key={theme.id} to={createPageUrl("ThemeDetail") + `?id=${theme.id}`}>
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

                                    {searchResults.privateThemes.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Private Themen ({searchResults.privateThemes.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {searchResults.privateThemes.map(theme => (
                                                    <Link key={theme.id} to={createPageUrl("PrivateThemeDetail") + `?id=${theme.id}`}>
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
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Date, Time and Weather */}
                <div className="print:hidden">
                    <DateTimeWeather />
                </div>

                {/* Active Timers */}
                <div className="print:hidden">
                    <ActiveTimers projects={projects} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-8 print:hidden">
                    {stats.map((stat, i) => (
                        <Link key={i} to={createPageUrl(stat.link)}>
                            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <CardContent className="p-6">
                                    {isLoading ? (
                                        <>
                                            <Skeleton className="h-4 w-24 mb-2" />
                                            <Skeleton className="h-8 w-16" />
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                                                <stat.icon className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Upcoming Appointments - moved up */}
                <div className="mb-8 print:hidden">
                    <UpcomingAppointments />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 print:hidden">
                    {/* Active Projects */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FolderKanban className="w-5 h-5 text-indigo-600" />
                                Aktive Projekte
                            </CardTitle>
                            <Link to={createPageUrl("Projects")} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                Alle anzeigen <ArrowRight className="w-4 h-4" />
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="p-4 border rounded-lg">
                                        <Skeleton className="h-5 w-48 mb-2" />
                                        <Skeleton className="h-4 w-32 mb-3" />
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                ))
                            ) : activeProjects.length > 0 ? (
                                activeProjects.slice(0, 4).map((project) => {
                                    const customer = getCustomer(project.customer_id);
                                    return (
                                        <Link key={project.id} to={createPageUrl("ProjectDetail") + `?id=${project.id}`}>
                                            <div className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                            {project.name}
                                                        </h3>
                                                        {customer && (
                                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                                <Building2 className="w-3 h-3" />
                                                                {customer.company}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                                                        In Arbeit
                                                    </Badge>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-slate-500">Fortschritt</span>
                                                        <span className="font-medium">{project.progress || 0}%</span>
                                                    </div>
                                                    <Progress value={project.progress || 0} className="h-2" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <FolderKanban className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>Keine aktiven Projekte</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Tasks */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-amber-600" />
                                Anstehende Aufgaben
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="p-3 border rounded-lg">
                                        <Skeleton className="h-4 w-48 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                ))
                            ) : openTasks.length > 0 ? (
                                openTasks.slice(0, 5).map((task) => {
                                    const project = projects.find(p => p.id === task.project_id);
                                    const isUrgent = task.due_date && (isToday(new Date(task.due_date)) || isPast(new Date(task.due_date)));
                                    
                                    return (
                                        <Link key={task.id} to={createPageUrl("ProjectDetail") + `?id=${task.project_id}`}>
                                            <div className={`p-3 border rounded-lg hover:shadow-md transition-all ${isUrgent ? 'border-red-200 bg-red-50/50' : 'border-slate-200 hover:border-amber-300'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                                                        {project && (
                                                            <p className="text-xs text-slate-500">{project.name}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {task.due_date && (
                                                            <Badge variant="outline" className={isUrgent ? 'border-red-300 text-red-600' : ''}>
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {format(new Date(task.due_date), "dd.MM.", { locale: de })}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>Keine offenen Aufgaben</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Travel Overview */}
                <div className="mt-8">
                    <TravelOverview />
                </div>
            </div>
        </div>
    );
}