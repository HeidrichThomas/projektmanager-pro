import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

const typeConfig = {
    // ThemeActivity types
    notiz:       { label: "Notiz",       icon: "📝", color: "border-slate-400" },
    telefonat:   { label: "Telefonat",   icon: "☎️", color: "border-blue-400" },
    meeting:     { label: "Meeting",     icon: "👥", color: "border-indigo-400" },
    email:       { label: "E-Mail",      icon: "✉️", color: "border-cyan-400" },
    dokument:    { label: "Dokument",    icon: "📄", color: "border-slate-400" },
    meilenstein: { label: "Meilenstein", icon: "🎯", color: "border-purple-400" },
    besuch:      { label: "Besuch",      icon: "🚗", color: "border-green-400" },
    // PrivateActivity types
    termin:      { label: "Termin",      icon: "📅", color: "border-pink-400" },
    erinnerung:  { label: "Erinnerung",  icon: "🔔", color: "border-yellow-400" },
    ausgabe:     { label: "Ausgabe",     icon: "💸", color: "border-red-400" },
    einnahme:    { label: "Einnahme",    icon: "💰", color: "border-green-400" },
};

const sourceColors = {
    project:  "bg-blue-500",
    theme:    "bg-amber-500",
    private:  "bg-pink-500",
};

export default function MiniActivityCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    const { data: themeActivities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
    });

    const { data: projectActivities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: () => base44.entities.Activity.list()
    });

    const { data: privateActivities = [] } = useQuery({
        queryKey: ['privateActivities'],
        queryFn: () => base44.entities.PrivateActivity.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: privateThemes = [] } = useQuery({
        queryKey: ['privateThemes'],
        queryFn: () => base44.entities.PrivateTheme.list()
    });

    // Combine all activities with source info
    const allActivities = useMemo(() => {
        const combined = [];

        themeActivities.forEach(a => {
            if (a.activity_date) combined.push({ ...a, _source: 'theme' });
        });
        projectActivities.forEach(a => {
            if (a.activity_date) combined.push({ ...a, _source: 'project' });
        });
        privateActivities.forEach(a => {
            if (a.activity_date) combined.push({ ...a, _source: 'private' });
        });

        return combined;
    }, [themeActivities, projectActivities, privateActivities]);

    const activitiesByDate = useMemo(() => {
        const map = {};
        allActivities.forEach(activity => {
            const dateKey = format(new Date(activity.activity_date), 'yyyy-MM-dd');
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(activity);
        });
        return map;
    }, [allActivities]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const firstDayOfWeek = monthStart.getDay();
    const adjustedFirstDay = new Date(monthStart);
    adjustedFirstDay.setDate(adjustedFirstDay.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));

    const days = eachDayOfInterval({ start: adjustedFirstDay, end: monthEnd });

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setShowDialog(true);
    };

    const getContextName = (activity) => {
        if (activity._source === 'theme') {
            return themes.find(t => t.id === activity.theme_id)?.name || "Thema";
        }
        if (activity._source === 'project') {
            return projects.find(p => p.id === activity.project_id)?.name || "Projekt";
        }
        if (activity._source === 'private') {
            return privateThemes.find(t => t.id === activity.theme_id)?.name || "Privat";
        }
        return "";
    };

    const sourceLabel = { theme: "Business Thema", project: "Projekt", private: "Privat" };

    const selectedDateKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
    const selectedDayActivities = selectedDateKey ? (activitiesByDate[selectedDateKey] || []) : [];

    return (
        <>
            <div className="bg-white rounded-lg border border-slate-200 p-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-700">
                        {format(currentDate, "MMMM yyyy", { locale: de })}
                    </h3>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0"
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                            <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0"
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}
                    className="w-full mb-3 h-7 text-xs">
                    Heute
                </Button>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-slate-500">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayActivities = activitiesByDate[dateKey] || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        // Collect unique sources for dot display
                        const sources = [...new Set(dayActivities.map(a => a._source))];

                        return (
                            <button
                                key={idx}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center rounded text-xs font-medium relative
                                    ${isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}
                                    ${isToday ? 'bg-slate-800 text-white border-2 border-slate-800' : 'border-2 border-transparent hover:border-slate-300'}
                                    transition-all cursor-pointer
                                `}
                            >
                                <span>{day.getDate()}</span>
                                {sources.length > 0 && (
                                    <div className="flex gap-0.5 mt-0.5">
                                        {sources.map(source => (
                                            <div
                                                key={source}
                                                className={`w-1 h-1 rounded-full ${sourceColors[source]}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1">
                    {Object.entries(sourceColors).map(([key, cls]) => (
                        <div key={key} className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${cls}`} />
                            <span className="text-xs text-slate-400">{sourceLabel[key]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDay && format(selectedDay, "dd. MMMM yyyy", { locale: de })}
                            {selectedDayActivities.length > 0 && (
                                <span className="text-sm font-normal text-slate-500 ml-2">
                                    ({selectedDayActivities.length} Aktivität{selectedDayActivities.length !== 1 ? 'en' : ''})
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        {selectedDayActivities.length > 0 ? (
                            selectedDayActivities
                                .sort((a, b) => new Date(a.activity_date) - new Date(b.activity_date))
                                .map((activity) => {
                                    const config = typeConfig[activity.type] || { label: activity.type, icon: "📌", color: "border-slate-400" };
                                    const contextName = getContextName(activity);
                                    const srcLabel = sourceLabel[activity._source];
                                    const dotColor = sourceColors[activity._source];
                                    return (
                                        <div key={activity.id} className={`border-l-4 ${config.color} pl-4 py-2 bg-slate-50 rounded`}>
                                            <div className="flex items-start gap-2 mb-1">
                                                <span className="text-base">{config.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-slate-900">{activity.title}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs text-slate-500">{config.label}</span>
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                                            {srcLabel}: {contextName}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {format(new Date(activity.activity_date), "HH:mm", { locale: de })} Uhr
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {activity.content && (
                                                <p className="text-sm text-slate-700 ml-6">{activity.content}</p>
                                            )}
                                            {activity.contact_person && (
                                                <p className="text-xs text-slate-500 ml-6 mt-1">
                                                    Ansprechpartner: {activity.contact_person}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                        ) : (
                            <p className="text-center text-slate-500 py-6">
                                Keine Aktivitäten an diesem Tag
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}