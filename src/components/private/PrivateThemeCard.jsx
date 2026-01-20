import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Heart, Home, DollarSign, Users, Plane, GraduationCap, Package, ChevronRight, Calendar, File, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isFuture } from "date-fns";
import { de } from "date-fns/locale";

const categoryConfig = {
    familie: { label: "Familie", icon: Users, color: "pink" },
    gesundheit: { label: "Gesundheit", icon: Heart, color: "red" },
    finanzen: { label: "Finanzen", icon: DollarSign, color: "green" },
    haushalt: { label: "Haushalt", icon: Home, color: "blue" },
    hobby: { label: "Hobby", icon: Package, color: "purple" },
    urlaub: { label: "Urlaub", icon: Plane, color: "teal" },
    bildung: { label: "Bildung", icon: GraduationCap, color: "amber" },
    sonstiges: { label: "Sonstiges", icon: Package, color: "slate" }
};

export default function PrivateThemeCard({ theme, appointments = [], documents = [], onEdit, onDelete }) {
    const config = categoryConfig[theme.category] || categoryConfig.sonstiges;
    const Icon = config.icon;

    const upcomingAppointments = appointments.filter(apt => isFuture(new Date(apt.start_date)));
    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
    
    const imageDocuments = documents.filter(doc => /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_name));
    const otherDocuments = documents.filter(doc => !/\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_name));

    return (
        <Card className="hover:shadow-lg transition-all group relative">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${config.color}-600`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{theme.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                                {config.label}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(theme)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(theme.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {theme.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{theme.description}</p>
                )}
                
                <div className="space-y-2 mb-3">
                    {nextAppointment && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-2 rounded">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="flex-1 truncate">{nextAppointment.title}</span>
                            <span className="text-xs text-blue-600">
                                {format(new Date(nextAppointment.start_date), "dd.MM.", { locale: de })}
                            </span>
                        </div>
                    )}
                    
                    {(imageDocuments.length > 0 || otherDocuments.length > 0) && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            {imageDocuments.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Image className="w-4 h-4" />
                                    <span>{imageDocuments.length}</span>
                                </div>
                            )}
                            {otherDocuments.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <File className="w-4 h-4" />
                                    <span>{otherDocuments.length}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <Link to={createPageUrl("PrivateThemeDetail") + `?id=${theme.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                        Details anzeigen
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}