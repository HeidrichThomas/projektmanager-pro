import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Calendar, Layers } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-100 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

export default function SubThemesList({ subThemes, onEdit, onDelete }) {
    if (subThemes.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Noch keine Unterthemen angelegt</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subThemes.map(subTheme => {
                const status = statusConfig[subTheme.status] || statusConfig.geplant;
                
                return (
                    <Card key={subTheme.id} className="group hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 mb-1">
                                        {subTheme.name}
                                    </h4>
                                    <Badge variant="secondary" className={`${status.color} border text-xs`}>
                                        {status.label}
                                    </Badge>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => onEdit(subTheme)}
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-red-600"
                                        onClick={() => {
                                            if (confirm(`"${subTheme.name}" wirklich löschen?`)) {
                                                onDelete(subTheme.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            {subTheme.description && (
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                    {subTheme.description}
                                </p>
                            )}

                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Fortschritt</span>
                                        <span className="font-medium text-slate-700">
                                            {subTheme.progress || 0}%
                                        </span>
                                    </div>
                                    <Progress value={subTheme.progress || 0} className="h-1.5" />
                                </div>

                                {(subTheme.start_date || subTheme.end_date) && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        {subTheme.start_date && format(new Date(subTheme.start_date), 'dd.MM.yy', { locale: de })}
                                        {subTheme.start_date && subTheme.end_date && ' - '}
                                        {subTheme.end_date && format(new Date(subTheme.end_date), 'dd.MM.yy', { locale: de })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}