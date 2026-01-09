import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Send, CheckCircle2, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfToday, getWeek, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import ThemeAppointmentForm from "./ThemeAppointmentForm";

export default function ThemeAppointmentsOverview({ compact = false }) {
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [checkedExpired, setCheckedExpired] = useState(false);
    
    const queryClient = useQueryClient();

    const { data: appointments = [] } = useQuery({
        queryKey: ['themeAppointments'],
        queryFn: () => base44.entities.ThemeAppointment.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeAppointment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeAppointments'] });
            setShowForm(false);
            setEditingAppointment(null);
            toast.success("Termin erstellt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeAppointment.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeAppointments'] });
            setShowForm(false);
            setEditingAppointment(null);
            toast.success("Termin aktualisiert");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeAppointment.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeAppointments'] });
            toast.success("Termin gelöscht");
        }
    });

    const exportToOutlookMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeAppointment.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeAppointments'] });
            toast.success("Als an Outlook übertragen markiert");
        }
    });

    const handleSave = (data) => {
        if (editingAppointment) {
            updateMutation.mutate({ id: editingAppointment.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const toggleImportant = (app) => {
        updateMutation.mutate({
            id: app.id,
            data: { ...app, is_important: !app.is_important }
        });
    };

    const handleExportToOutlook = (app) => {
        const startDate = new Date(app.start_date);
        const endDate = app.end_date ? new Date(app.end_date) : new Date(startDate.getTime() + 60 * 60 * 1000);
        
        const formatDateForOutlook = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(app.title)}&startdt=${formatDateForOutlook(startDate)}&enddt=${formatDateForOutlook(endDate)}&body=${encodeURIComponent(app.description || '')}&location=${encodeURIComponent(app.location || '')}`;
        
        window.open(outlookUrl, '_blank');
        
        exportToOutlookMutation.mutate({ 
            id: app.id, 
            data: { ...app, exported_to_outlook: true } 
        });
    };

    const getTheme = (themeId) => themes.find(t => t.id === themeId);

    // Kalender-Logik
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getAppointmentsForDay = (day) => {
        const regularApps = appointments.filter(app => 
            app.start_date && isSameDay(new Date(app.start_date), day)
        );
        const activityApps = activities.filter(act => 
            act.appointment_date && isSameDay(new Date(act.appointment_date), day)
        );
        return [...regularApps, ...activityApps.map(act => ({
            ...act,
            start_date: act.appointment_date,
            isActivity: true
        }))];
    };

    const upcomingAppointments = [
        ...appointments
            .filter(app => app.start_date && !isBefore(new Date(app.start_date), startOfToday()))
            .map(app => ({ ...app, isActivity: false })),
        ...activities
            .filter(act => act.appointment_date && !isBefore(new Date(act.appointment_date), startOfToday()))
            .map(act => ({ 
                ...act, 
                start_date: act.appointment_date, 
                title: act.title,
                isActivity: true 
            }))
    ]
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 10);

    // Prüfe auf überschrittene Termine
    useEffect(() => {
        if (!compact && appointments.length > 0 && !checkedExpired) {
            const now = new Date();
            const expiredAppointments = appointments.filter(app => 
                app.start_date && isBefore(new Date(app.start_date), now)
            );
            
            if (expiredAppointments.length > 0) {
                const expiredList = expiredAppointments.map(app => `• ${app.title}`).join('\n');
                if (confirm(`Folgende Termine sind bereits abgelaufen:\n\n${expiredList}\n\nMöchten Sie diese Termine löschen?`)) {
                    expiredAppointments.forEach(app => {
                        deleteMutation.mutate(app.id);
                    });
                }
            }
            setCheckedExpired(true);
        }
    }, [appointments, compact, checkedExpired]);

    if (compact) {
        return (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {upcomingAppointments.slice(0, 3).length > 0 ? (
                    upcomingAppointments.slice(0, 3).map(app => {
                        const theme = getTheme(app.theme_id);
                        return (
                            <div key={`${app.isActivity ? 'activity' : 'appointment'}-${app.id}`} className="text-xs">
                                <div className="font-medium text-slate-900 truncate">{app.title}</div>
                                <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                                    {app.start_date && (
                                        <>
                                            <span>{format(new Date(app.start_date), 'dd.MM.', { locale: de })}</span>
                                            <span>{format(new Date(app.start_date), 'HH:mm')}</span>
                                        </>
                                    )}
                                    {app.isActivity && (
                                        <Badge variant="secondary" className="text-xs py-0">
                                            Aktivität
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-xs text-slate-500 text-center py-4">
                        Keine anstehenden Termine
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-10 gap-6">
            {/* Kalenderansicht */}
            <Card className="md:col-span-3">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Terminkalender
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[120px] text-center">
                                {format(currentMonth, 'MMMM yyyy', { locale: de })}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMonth(new Date())}
                            >
                                Heute
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => { setEditingAppointment(null); setShowForm(true); }}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Neuer Termin
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-8 gap-1">
                        <div className="text-center text-xs font-medium text-slate-500 py-2">KW</div>
                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                                {day}
                            </div>
                        ))}
                        
                        {/* Leere Tage am Anfang */}
                        <div className="text-center text-xs font-medium text-slate-400 flex items-center justify-center">
                            {getWeek(monthStart, { locale: de, weekStartsOn: 1 })}
                        </div>
                        {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        
                        {/* Tage des Monats */}
                        {daysInMonth.map((day, index) => {
                            const isMonday = day.getDay() === 1;
                            const weekNumber = getWeek(day, { locale: de, weekStartsOn: 1 });
                            const dayAppointments = getAppointmentsForDay(day);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            
                            return (
                                <React.Fragment key={day.toString()}>
                                    {isMonday && (
                                        <div className="text-center text-xs font-medium text-slate-400 flex items-center justify-center">
                                            {weekNumber}
                                        </div>
                                    )}
                                    {!isMonday && index > 0 && daysInMonth[index - 1].getDay() === 0 && (
                                        <div className="text-center text-xs font-medium text-slate-400 flex items-center justify-center">
                                            {weekNumber}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            aspect-square p-1 rounded-lg border text-sm relative
                                            ${isToday(day) ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-slate-200'}
                                            ${isSelected ? 'bg-indigo-100' : 'hover:bg-slate-50'}
                                            ${dayAppointments.length > 0 ? 'font-semibold' : ''}
                                        `}
                                    >
                                        <span className={isToday(day) ? 'text-indigo-600 font-bold' : ''}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayAppointments.length > 0 && (
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                {dayAppointments.slice(0, 3).map((_, i) => (
                                                    <div key={i} className="w-1 h-1 rounded-full bg-indigo-600" />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Termine des ausgewählten Tages */}
                    {selectedDate && (
                        <div className="mt-4 pt-4 border-t">
                            <h3 className="font-semibold mb-3">
                                Termine am {format(selectedDate, 'dd. MMMM yyyy', { locale: de })}
                            </h3>
                            <div className="space-y-2">
                                {getAppointmentsForDay(selectedDate).length > 0 ? (
                                    getAppointmentsForDay(selectedDate).map(app => {
                                        const theme = getTheme(app.theme_id);
                                        const handleClick = () => {
                                            if (!app.isActivity) {
                                                setEditingAppointment(app);
                                                setShowForm(true);
                                            }
                                        };
                                        return (
                                            <div 
                                                key={app.id} 
                                                className={`p-3 bg-slate-50 rounded-lg border group transition-all ${!app.isActivity ? 'cursor-pointer hover:bg-slate-100 hover:border-indigo-300' : ''}`}
                                                onClick={handleClick}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {!app.isActivity && app.is_important && (
                                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                            )}
                                                            <div className="font-medium text-slate-900">{app.title}</div>
                                                            {app.isActivity && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Aktivität
                                                                </Badge>
                                                            )}
                                                            {!app.isActivity && app.exported_to_outlook && (
                                                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    An Outlook übertragen
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {theme && (
                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                {theme.name}
                                                            </Badge>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                                                            {app.start_date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {format(new Date(app.start_date), 'HH:mm')}
                                                                </span>
                                                            )}
                                                            {app.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {app.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!app.isActivity && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleImportant(app);
                                                                }}
                                                                className={app.is_important ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}
                                                                title="Als wichtig markieren"
                                                            >
                                                                <Star className={`w-3 h-3 ${app.is_important ? 'fill-amber-500' : ''}`} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingAppointment(app);
                                                                    setShowForm(true);
                                                                }}
                                                                className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                                                title="Bearbeiten"
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => { 
                                                                    e.stopPropagation();
                                                                    handleExportToOutlook(app); 
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                title="An Outlook übertragen"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(`Termin "${app.title}" wirklich löschen?`)) {
                                                                        deleteMutation.mutate(app.id);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                title="Löschen"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        Keine Termine an diesem Tag
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Anstehende Termine */}
            <Card className="md:col-span-7">
                <CardHeader>
                    <CardTitle className="text-lg">Anstehende Termine</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => {
                                const theme = getTheme(app.theme_id);
                                const handleClick = () => {
                                    if (!app.isActivity) {
                                        setEditingAppointment(app);
                                        setShowForm(true);
                                    }
                                };
                                return (
                                    <div 
                                        key={`${app.isActivity ? 'activity' : 'appointment'}-${app.id}`} 
                                        className={`p-3 border rounded-lg hover:shadow-sm transition-all group ${!app.isActivity ? 'cursor-pointer hover:border-indigo-300' : ''}`}
                                        onClick={handleClick}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {!app.isActivity && app.is_important && (
                                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    )}
                                                    <div className="font-medium text-sm text-slate-900">{app.title}</div>
                                                    {app.isActivity && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Aktivität
                                                        </Badge>
                                                    )}
                                                    {!app.isActivity && app.exported_to_outlook && (
                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Outlook
                                                        </Badge>
                                                    )}
                                                </div>
                                                {theme && (
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {theme.name}
                                                    </Badge>
                                                )}
                                                <div className="flex flex-col gap-1 mt-2 text-xs text-slate-600">
                                                    {app.start_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(app.start_date), 'dd.MM.yyyy', { locale: de })}
                                                        </span>
                                                    )}
                                                    {app.start_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(app.start_date), 'HH:mm')} Uhr
                                                        </span>
                                                    )}
                                                    {app.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {app.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {!app.isActivity && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleImportant(app);
                                                        }}
                                                        className={app.is_important ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}
                                                        title="Als wichtig markieren"
                                                    >
                                                        <Star className={`w-3 h-3 ${app.is_important ? 'fill-amber-500' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAppointment(app);
                                                            setShowForm(true);
                                                        }}
                                                        className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                                        title="Bearbeiten"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            handleExportToOutlook(app); 
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="An Outlook übertragen"
                                                    >
                                                        <Send className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`Termin "${app.title}" wirklich löschen?`)) {
                                                                deleteMutation.mutate(app.id);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Löschen"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8">
                                Keine anstehenden Termine
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ThemeAppointmentForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingAppointment(null); }}
                onSave={handleSave}
                appointment={editingAppointment}
            />
        </div>
    );
}