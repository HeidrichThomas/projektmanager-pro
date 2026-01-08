import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

export default function MiniActivityCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: activities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
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

    return (
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
                        <div
                            key={idx}
                            className={`
                                aspect-square flex items-center justify-center rounded text-xs font-medium relative
                                ${isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}
                                ${isToday ? 'bg-slate-800 text-white' : ''}
                            `}
                        >
                            {day.getDate()}
                            {dayActivities.length > 0 && (
                                <div className="absolute bottom-0.5 w-1 h-1 bg-amber-500 rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}