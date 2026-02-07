import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { format, parseISO, isFuture, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UpcomingAppointments() {
    const { data: themeAppointments = [] } = useQuery({
        queryKey: ['themeAppointments'],
        queryFn: () => base44.entities.ThemeAppointment.list()
    });

    const { data: privateAppointments = [] } = useQuery({
        queryKey: ['privateAppointments'],
        queryFn: () => base44.entities.PrivateAppointment.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: privateThemes = [] } = useQuery({
        queryKey: ['privateThemes'],
        queryFn: () => base44.entities.PrivateTheme.list()
    });

    const upcomingAppointments = React.useMemo(() => {
        const now = new Date();
        const next30Days = addDays(now, 30);

        const themeAppts = themeAppointments
            .filter(a => {
                const startDate = parseISO(a.start_date);
                return isFuture(startDate) && startDate <= next30Days;
            })
            .map(a => ({
                ...a,
                type: 'theme',
                theme: themes.find(t => t.id === a.theme_id)
            }));

        const privateAppts = privateAppointments
            .filter(a => {
                const startDate = parseISO(a.start_date);
                return isFuture(startDate) && startDate <= next30Days;
            })
            .map(a => ({
                ...a,
                type: 'private',
                theme: privateThemes.find(t => t.id === a.theme_id)
            }));

        return [...themeAppts, ...privateAppts]
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            .slice(0, 8);
    }, [themeAppointments, privateAppointments, themes, privateThemes]);

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Kommende Termine (30 Tage)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appt) => {
                        const startDate = parseISO(appt.start_date);
                        const linkUrl = appt.type === 'theme' 
                            ? createPageUrl("ThemeDetail") + `?id=${appt.theme_id}`
                            : createPageUrl("PrivateThemeDetail") + `?id=${appt.theme_id}`;
                        
                        return (
                            <Link key={`${appt.type}-${appt.id}`} to={linkUrl}>
                                <div className="p-4 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
                                                {appt.title}
                                            </h4>
                                            {appt.theme && (
                                                <p className="text-xs text-slate-500 mb-2">
                                                    {appt.type === 'theme' ? '🏢 ' : '👤 '}
                                                    {appt.theme.name}
                                                </p>
                                            )}
                                        </div>
                                        {appt.is_important && (
                                            <Badge variant="destructive" className="ml-2">
                                                Wichtig
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{format(startDate, "EEE, dd. MMM yyyy", { locale: de })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{format(startDate, "HH:mm", { locale: de })} Uhr</span>
                                        </div>
                                        {appt.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{appt.location}</span>
                                            </div>
                                        )}
                                        {appt.participants && appt.participants.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{appt.participants.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>Keine anstehenden Termine in den nächsten 30 Tagen</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}