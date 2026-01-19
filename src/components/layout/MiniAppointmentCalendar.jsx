import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, isBefore, startOfToday } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import ThemeAppointmentForm from "@/components/themes/ThemeAppointmentForm";

export default function MiniAppointmentCalendar({ compact = false }) {
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    
    const queryClient = useQueryClient();

    const { data: appointments = [] } = useQuery({
        queryKey: ['themeAppointments'],
        queryFn: () => base44.entities.ThemeAppointment.list()
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: subThemes = [] } = useQuery({
        queryKey: ['subThemes'],
        queryFn: () => base44.entities.SubTheme.list()
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

    const handleSave = (data) => {
        if (editingAppointment) {
            updateMutation.mutate({ id: editingAppointment.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const getTheme = (themeId) => themes.find(t => t.id === themeId);

    const upcomingAppointments = [
        ...appointments
            .filter(app => app.start_date && !isBefore(new Date(app.start_date), startOfToday()))
            .map(app => ({ ...app, isActivity: false, isSubTheme: false })),
        ...activities
            .filter(act => act.appointment_date && !isBefore(new Date(act.appointment_date), startOfToday()))
            .map(act => ({ 
                ...act, 
                start_date: act.appointment_date, 
                title: act.title,
                isActivity: true,
                isSubTheme: false
            })),
        ...subThemes
            .filter(st => st.start_date && !isBefore(new Date(st.start_date), startOfToday()))
            .map(st => ({
                ...st,
                start_date: st.start_date,
                title: st.name,
                theme_id: st.parent_theme_id,
                isActivity: false,
                isSubTheme: true
            })),
        ...subThemes
            .filter(st => st.end_date && !isBefore(new Date(st.end_date), startOfToday()))
            .map(st => ({
                ...st,
                start_date: st.end_date,
                title: `${st.name} (Ende)`,
                theme_id: st.parent_theme_id,
                isActivity: false,
                isSubTheme: true,
                isEndDate: true
            }))
    ]
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 5);

    if (compact) {
        return (
            <div className="space-y-2">
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.slice(0, 3).map(app => {
                        const theme = getTheme(app.theme_id);
                        return (
                            <div 
                                key={`${app.isActivity ? 'activity' : app.isSubTheme ? 'subtheme' : 'appointment'}-${app.id}`} 
                                className={`text-xs p-2 bg-slate-50 rounded border group ${!app.isActivity && !app.isSubTheme ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                onClick={() => {
                                    if (!app.isActivity && !app.isSubTheme) {
                                        setEditingAppointment(app);
                                        setShowForm(true);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between gap-1">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 truncate">{app.title}</div>
                                        {theme && (
                                            <div className="text-xs text-slate-500 truncate mt-0.5">
                                                {theme.name}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                                            {app.start_date && (
                                                <>
                                                    <span className="flex items-center gap-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(app.start_date), 'dd.MM.')}
                                                    </span>
                                                    {app.start_date.includes('T') && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(app.start_date), 'HH:mm')}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {app.isActivity && (
                                                <Badge variant="secondary" className="text-xs py-0 h-4">
                                                    Aktivität
                                                </Badge>
                                            )}
                                            {app.isSubTheme && (
                                                <Badge variant="secondary" className="text-xs py-0 h-4">
                                                    Unterthema
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {!app.isActivity && !app.isSubTheme && (
                                        <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-xs text-slate-500 text-center py-3">
                        Keine anstehenden Termine
                    </p>
                )}
                <ThemeAppointmentForm
                    open={showForm}
                    onClose={() => { setShowForm(false); setEditingAppointment(null); }}
                    onSave={handleSave}
                    appointment={editingAppointment}
                />
            </div>
        );
    }

    return (
        <>
            <Card className="mt-3">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-slate-700">
                            Anstehende Termine
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDialog(true)}
                            className="h-6 px-2 text-xs"
                        >
                            Alle
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => {
                                const theme = getTheme(app.theme_id);
                                return (
                                    <div 
                                        key={`${app.isActivity ? 'activity' : app.isSubTheme ? 'subtheme' : 'appointment'}-${app.id}`} 
                                        className={`text-xs p-2 bg-slate-50 rounded border group ${!app.isActivity && !app.isSubTheme ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                        onClick={() => {
                                            if (!app.isActivity && !app.isSubTheme) {
                                                setEditingAppointment(app);
                                                setShowForm(true);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-900 truncate">{app.title}</div>
                                                {theme && (
                                                    <div className="text-xs text-slate-500 truncate mt-0.5">
                                                        {theme.name}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-slate-500 mt-1">
                                                    {app.start_date && (
                                                        <>
                                                            <span className="flex items-center gap-0.5">
                                                                <Calendar className="w-3 h-3" />
                                                                {format(new Date(app.start_date), 'dd.MM.')}
                                                            </span>
                                                            {app.start_date.includes('T') && (
                                                                <span className="flex items-center gap-0.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    {format(new Date(app.start_date), 'HH:mm')}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    {app.isActivity && (
                                                        <Badge variant="secondary" className="text-xs py-0 h-4">
                                                            Aktivität
                                                        </Badge>
                                                    )}
                                                    {app.isSubTheme && (
                                                        <Badge variant="secondary" className="text-xs py-0 h-4">
                                                            Unterthema
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {!app.isActivity && !app.isSubTheme && (
                                                <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-3">
                                Keine anstehenden Termine
                            </p>
                        )}
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { setEditingAppointment(null); setShowForm(true); }}
                        className="w-full mt-3 h-7 text-xs"
                        variant="outline"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Neuer Termin
                    </Button>
                </CardContent>
            </Card>

            <ThemeAppointmentForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingAppointment(null); }}
                onSave={handleSave}
                appointment={editingAppointment}
            />

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Alle Termine
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                        {upcomingAppointments.map(app => {
                            const theme = getTheme(app.theme_id);
                            return (
                                <div 
                                    key={`${app.isActivity ? 'activity' : app.isSubTheme ? 'subtheme' : 'appointment'}-${app.id}`} 
                                    className={`p-3 border rounded-lg group ${!app.isActivity && !app.isSubTheme ? 'cursor-pointer hover:shadow-sm' : ''}`}
                                    onClick={() => {
                                        if (!app.isActivity && !app.isSubTheme) {
                                            setEditingAppointment(app);
                                            setShowForm(true);
                                            setShowDialog(false);
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-sm text-slate-900">{app.title}</div>
                                                {app.isActivity && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Aktivität
                                                    </Badge>
                                                )}
                                                {app.isSubTheme && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Unterthema
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
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(app.start_date), 'dd.MM.yyyy', { locale: de })}
                                                        </span>
                                                        {app.start_date.includes('T') && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {format(new Date(app.start_date), 'HH:mm')} Uhr
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                                {app.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {app.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!app.isActivity && !app.isSubTheme && (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingAppointment(app);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    <Pencil className="w-3 h-3" />
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
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}