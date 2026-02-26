import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb, Building2, Calendar, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-100 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

export default function ThemeCard({ theme }) {
    const status = statusConfig[theme.status] || statusConfig.geplant;
    const queryClient = useQueryClient();

    const { data: checklistItems = [] } = useQuery({
        queryKey: ['themeChecklistItems', theme.id],
        queryFn: () => base44.entities.ThemeChecklistItem.filter({ theme_id: theme.id }, 'order')
    });

    const toggleItemMutation = useMutation({
        mutationFn: ({ id, completed }) => base44.entities.ThemeChecklistItem.update(id, { completed }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeChecklistItems', theme.id] });
        }
    });

    const handleCheckboxClick = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItemMutation.mutate({ id: item.id, completed: !item.completed });
    };

    const completedCount = checklistItems.filter(item => item.completed).length;
    const totalCount = checklistItems.length;

    return (
        <Link to={createPageUrl("ThemeDetail") + `?id=${theme.id}`}>
            <Card className="p-3 hover:shadow-xl transition-all duration-300 border-slate-200 group cursor-pointer flex flex-col h-auto min-h-[12rem]">
                <div className="flex items-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                            {theme.name}
                        </h3>
                    </div>
                </div>

                <Badge variant="secondary" className={`${status.color} border mb-2 w-fit text-xs`}>
                    {status.label}
                </Badge>

                {theme.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2 flex-1">
                        {theme.description}
                    </p>
                )}

                {checklistItems.length > 0 && (
                    <div className="mb-2 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                            <CheckSquare className="w-3 h-3" />
                            <span>{completedCount}/{totalCount} erledigt</span>
                        </div>
                        {checklistItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                                <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => handleCheckboxClick(event, item)}
                                    className="h-3 w-3"
                                />
                                <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-600'} truncate flex-1`}>
                                    {item.title}
                                </span>
                            </div>
                        ))}
                        {checklistItems.length > 3 && (
                            <div className="text-xs text-slate-400 pl-5">+{checklistItems.length - 3} weitere</div>
                        )}
                    </div>
                )}

                <div className="space-y-2 mt-auto pt-2 border-t">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-slate-500">Fortschritt</span>
                            <span className="font-medium text-slate-700">{theme.progress || 0}%</span>
                        </div>
                        <Progress value={theme.progress || 0} className="h-1.5" />
                    </div>

                    {(theme.start_date || theme.end_date) && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span className="truncate">
                                {theme.start_date && format(new Date(theme.start_date), "dd.MM.yy", { locale: de })}
                                {theme.start_date && theme.end_date && " - "}
                                {theme.end_date && format(new Date(theme.end_date), "dd.MM.yy", { locale: de })}
                            </span>
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    );
}