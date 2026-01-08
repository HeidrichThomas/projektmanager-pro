import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, Phone, Users, Mail, Milestone, ChevronUp, ChevronDown } from "lucide-react";
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
    const [gaugeDate, setGaugeDate] = useState(new Date());

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

    const goToToday = () => {
        setCurrentMonth(new Date());
        setGaugeDate(new Date());
    };

    const previousDay = () => {
        const newDate = new Date(gaugeDate);
        newDate.setDate(newDate.getDate() - 1);
        setGaugeDate(newDate);
        setCurrentMonth(newDate);
    };

    const nextDay = () => {
        const newDate = new Date(gaugeDate);
        newDate.setDate(newDate.getDate() + 1);
        setGaugeDate(newDate);
        setCurrentMonth(newDate);
    };

    const getActivityCountForDate = (date) => {
        return activities.filter(activity => 
            isSameDay(new Date(activity.activity_date), date)
        ).length;
    };

    const gaugeActivityCount = getActivityCountForDate(gaugeDate);
    const activityAngle = Math.min(gaugeActivityCount * 30, 162); // Max 162 degrees for 90% arc
    const activityPercentage = Math.min(Math.round((gaugeActivityCount / 6) * 100), 100); // 6 activities = 100%

    const getActivitiesForDay = (day) => {
        return activities.filter(activity => 
            isSameDay(new Date(activity.activity_date), day)
        );
    };

    const handleDayClick = (day) => {
        setGaugeDate(day);
        const dayActivities = getActivitiesForDay(day);
        if (dayActivities.length > 0) {
            setSelectedDate(day);
            setShowDialog(true);
        }
    };

    const selectedDayActivities = selectedDate ? getActivitiesForDay(selectedDate) : [];

    return (
        <>
            <div className="flex gap-4 items-start">
                <Card className="flex-1 max-w-md">
                    <CardHeader className="pb-2 px-4 pt-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarIcon className="w-4 h-4 text-slate-600" />
                                Aktivitäten-Kalender
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" onClick={goToToday} className="h-7 px-2 text-xs">
                                    Heute
                                </Button>
                                <Button variant="outline" size="sm" onClick={previousMonth} className="h-7 w-7 p-0">
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </Button>
                                <span className="text-xs font-medium min-w-[100px] text-center">
                                    {format(currentMonth, "MMM yyyy", { locale: de })}
                                </span>
                                <Button variant="outline" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-1.5">
                        <div className="text-center text-[11px] font-semibold text-slate-600 py-1.5">
                            KW
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                                <div key={day} className="text-center text-[11px] font-semibold text-slate-600 py-1.5">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {weeks.map((week, weekIndex) => (
                            <React.Fragment key={weekIndex}>
                                <div className="flex items-center justify-center text-[11px] font-medium text-slate-500">
                                    {getWeek(week[0], { weekStartsOn: 1, firstWeekContainsDate: 4 })}
                                </div>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {week.map(day => {
                                        const dayActivities = getActivitiesForDay(day);
                                        const hasActivities = dayActivities.length > 0;
                                        const today = isToday(day);
                                        const isSelected = isSameDay(day, gaugeDate);

                                        return (
                                            <button
                                                key={day.toString()}
                                                onClick={() => handleDayClick(day)}
                                                className={`
                                                    aspect-square p-1 rounded text-xs transition-all
                                                    ${today ? 'ring-1 ring-red-500 bg-red-50' : 'hover:bg-slate-100'}
                                                    ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}
                                                    ${hasActivities ? 'cursor-pointer font-semibold' : 'cursor-default'}
                                                    ${!isSameMonth(day, currentMonth) ? 'text-slate-300' : 'text-slate-700'}
                                                `}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <span>{format(day, 'd')}</span>
                                                    {hasActivities && (
                                                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                                            {dayActivities.slice(0, 2).map((activity, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="w-1 h-1 rounded-full bg-indigo-500"
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

            {/* Activity Gauge */}
            <Card className="w-48 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Aktivität</h3>
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={previousDay} className="h-6 w-6 p-0">
                        <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday} className="h-6 px-2 text-xs">
                        Heute
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextDay} className="h-6 w-6 p-0">
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mb-4">{format(gaugeDate, "dd. MMM yyyy", { locale: de })}</p>
                <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="72"
                            cy="72"
                            r="60"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        {/* Static Progress Arc - 90% of circle */}
                        <circle
                            cx="72"
                            cy="72"
                            r="60"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="339 377"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#eab308" />
                                <stop offset="50%" stopColor="#84cc16" />
                                <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    {/* Pointer Line */}
                    <svg className="absolute inset-0 w-full h-full transition-transform duration-500" style={{ transform: `rotate(${(activityAngle / 180) * 180 - 90}deg)` }}>
                        <defs>
                            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0f172a" />
                                <stop offset="100%" stopColor="#475569" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="72,12 69,72 75,72"
                            fill="url(#pointerGradient)"
                            className="drop-shadow-lg"
                        />
                        <circle cx="72" cy="72" r="8" fill="#1e293b" className="drop-shadow-md" />
                        <circle cx="72" cy="72" r="3" fill="#64748b" />
                    </svg>
                </div>
                
                {/* Activity Percentage and Status Labels */}
                <div className="text-center mt-4">
                    <div className="text-3xl font-bold text-slate-900 mb-1">{activityPercentage}%</div>
                    <div className="text-xs text-slate-500 mb-3">
                        {gaugeActivityCount} {gaugeActivityCount === 1 ? "Aktivität" : "Aktivitäten"}
                    </div>
                </div>
                
                <div className="flex items-center justify-between w-full text-xs">
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-500">Wenig</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-slate-500">Viel</span>
                    </span>
                </div>
            </Card>
        </div>

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