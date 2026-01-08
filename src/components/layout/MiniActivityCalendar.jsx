import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

const activityTypeConfig = {
    notiz: { label: "Notiz", icon: "📝" },
    telefonat: { label: "Telefonat", icon: "☎️" },
    meeting: { label: "Meeting", icon: "👥" },
    email: { label: "E-Mail", icon: "✉️" },
    dokument: { label: "Dokument", icon: "📄" },
    meilenstein: { label: "Meilenstein", icon: "🎯" }
};

export default function MiniActivityCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    const { data: activities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const activitiesByDate = useMemo(() => {
        const map = {};
        activities.forEach(activity => {
            if (activity.activity_date) {
                const dateKey = format(new Date(activity.activity_date), 'yyyy-MM-dd');
                if (!map[dateKey]) map[dateKey] = [];
                map[dateKey].push(activity);
            }
        });
        return map;
    }, [activities]);

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setShowDialog(true);
    };

    const getThemeName = (themeId) => {
        return themes.find(t => t.id === themeId)?.name || "Unbekannt";
    };

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
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="w-full mb-3 h-7 text-xs"
                >
                    Heute
                </Button>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayActivities = activitiesByDate[dateKey] || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <button
                                key={idx}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    aspect-square flex items-center justify-center rounded text-xs font-medium relative
                                    ${isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}
                                    ${isToday ? 'bg-slate-800 text-white border-2 border-slate-800' : 'border-2 border-transparent hover:border-slate-300'}
                                    transition-all cursor-pointer
                                `}
                            >
                                {day.getDate()}
                                {dayActivities.length > 0 && (
                                    <div className="absolute bottom-0.5 w-1 h-1 bg-amber-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDay && format(selectedDay, "dd. MMMM yyyy", { locale: de })}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        {selectedDayActivities.length > 0 ? (
                            selectedDayActivities.map((activity) => {
                                const config = activityTypeConfig[activity.type] || { label: activity.type, icon: "📌" };
                                return (
                                    <div key={activity.id} className="border-l-4 border-amber-500 pl-4 py-2 bg-slate-50 rounded">
                                        <div className="flex items-start gap-2 mb-1">
                                            <span className="text-lg">{config.icon}</span>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900">{activity.title}</p>
                                                <p className="text-xs text-slate-500">{config.label}</p>
                                            </div>
                                        </div>
                                        {activity.content && (
                                            <p className="text-sm text-slate-700 ml-6 mb-1">{activity.content}</p>
                                        )}
                                        {activity.theme_id && (
                                            <p className="text-xs text-slate-500 ml-6">
                                                Thema: {getThemeName(activity.theme_id)}
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