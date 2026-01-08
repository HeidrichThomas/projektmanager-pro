import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, Phone, Users, Mail, Milestone } from "lucide-react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, isSameMonth, getWeek, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";

const activityTypes = {
    notiz: { label: "Notiz", icon: FileText, color: "bg-slate-100 text-slate-700" },
    telefonat: { label: "Telefonat", icon: Phone, color: "bg-blue-100 text-blue-700" },
    meeting: { label: "Meeting", icon: Users, color: "bg-purple-100 text-purple-700" },
    email: { label: "E-Mail", icon: Mail, color: "bg-green-100 text-green-700" },
    dokument: { label: "Dokument", icon: FileText, color: "bg-orange-100 text-orange-700" },
    meilenstein: { label: "Meilenstein", icon: Milestone, color: "bg-amber-100 text-amber-700" }
};

export default function ThemeCalendar({ activities, themes }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = monthStart.getDay();
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Calculate weeks to display
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const getActivitiesForDay = (day) => {
        return activities.filter(activity => 
            isSameDay(new Date(activity.activity_date), day)
        );
    };

    const handleDayClick = (day) => {
        const dayActivities = getActivitiesForDay(day);
        if (dayActivities.length > 0) {
            setSelectedDate(day);
            setShowDialog(true);
        }
    };

    const selectedDayActivities = selectedDate ? getActivitiesForDay(selectedDate) : [];

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-slate-600" />
                            Aktivitäten-Kalender
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={previousMonth}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[150px] text-center">
                                {format(currentMonth, "MMMM yyyy", { locale: de })}
                            </span>
                            <Button variant="outline" size="sm" onClick={nextMonth}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                        <div className="text-center text-xs font-semibold text-slate-600 py-2">
                            KW
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                                <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {weeks.map((week, weekIndex) => (
                            <React.Fragment key={weekIndex}>
                                <div className="flex items-center justify-center text-xs font-medium text-slate-500">
                                    {getWeek(week[0], { weekStartsOn: 1, firstWeekContainsDate: 4 })}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {week.map(day => {
                                        const dayActivities = getActivitiesForDay(day);
                                        const hasActivities = dayActivities.length > 0;
                                        const today = isToday(day);
                                        
                                        return (
                                            <button
                                                key={day.toString()}
                                                onClick={() => handleDayClick(day)}
                                                className={`
                                                    aspect-square p-1 rounded-lg text-sm transition-all
                                                    ${today ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-slate-100'}
                                                    ${hasActivities ? 'cursor-pointer font-semibold' : 'cursor-default'}
                                                    ${!isSameMonth(day, currentMonth) ? 'text-slate-300' : 'text-slate-700'}
                                                `}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <span>{format(day, 'd')}</span>
                                                    {hasActivities && (
                                                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                                                            {dayActivities.slice(0, 3).map((activity, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Aktivitäten am {selectedDate && format(selectedDate, "dd. MMMM yyyy", { locale: de })}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-3 mt-4">
                        {selectedDayActivities.map(activity => {
                            const config = activityTypes[activity.type] || activityTypes.notiz;
                            const Icon = config.icon;
                            const theme = themes.find(t => t.id === activity.theme_id);
                            
                            return (
                                <Card key={activity.id} className="p-4">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                                                <span className="text-xs text-slate-500">
                                                    {format(new Date(activity.activity_date), "HH:mm", { locale: de })} Uhr
                                                </span>
                                            </div>
                                            
                                            {theme && (
                                                <p className="text-sm text-slate-600 mb-1">
                                                    <strong>Thema:</strong> {theme.name}
                                                </p>
                                            )}
                                            
                                            {activity.contact_person && (
                                                <p className="text-sm text-slate-600 mb-1">
                                                    <strong>Kontakt:</strong> {activity.contact_person}
                                                </p>
                                            )}
                                            
                                            {activity.content && (
                                                <p className="text-sm text-slate-700 mt-2">{activity.content}</p>
                                            )}
                                            
                                            <Badge variant="outline" className={`${config.color} mt-2`}>
                                                {config.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}