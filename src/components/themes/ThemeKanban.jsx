import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Lightbulb, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-50 text-blue-700 border-blue-200", headerColor: "bg-blue-50 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-50 text-amber-700 border-amber-200", headerColor: "bg-amber-50 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-50 text-slate-700 border-slate-200", headerColor: "bg-slate-50 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-50 text-emerald-700 border-emerald-200", headerColor: "bg-emerald-50 border-emerald-200" }
};

const statuses = [
    { id: "geplant", label: "Geplant" },
    { id: "in_arbeit", label: "In Arbeit" },
    { id: "pausiert", label: "Pausiert" },
    { id: "abgeschlossen", label: "Abgeschlossen" }
];

export default function ThemeKanban({ themes, onStatusChange }) {
    const ThemeCardComponent = ({ theme }) => {
        const status = statusConfig[theme.status] || statusConfig.geplant;

        return (
            <Link to={createPageUrl("ThemeDetail") + `?id=${theme.id}`}>
                <Card className="p-4 hover:shadow-lg transition-all duration-300 border-slate-200 group cursor-pointer h-80 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                                    {theme.name}
                                </h3>
                            </div>
                        </div>
                    </div>
                    
                    {theme.description && (
                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                            {theme.description}
                        </p>
                    )}
                    
                    <div className="space-y-2 mt-auto">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">Fortschritt</span>
                                <span className="font-medium text-slate-700">{theme.progress || 0}%</span>
                            </div>
                            <Progress value={theme.progress || 0} className="h-1.5" />
                        </div>
                        
                        {(theme.start_date || theme.end_date) && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                    {theme.start_date && format(new Date(theme.start_date), "dd.MM.yyyy", { locale: de })}
                                    {theme.start_date && theme.end_date && " - "}
                                    {theme.end_date && format(new Date(theme.end_date), "dd.MM.yyyy", { locale: de })}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-auto pt-2 border-t border-slate-100 flex justify-end">
                        <span className="text-xs text-slate-400 group-hover:text-amber-600 flex items-center gap-0.5 transition-colors">
                            Öffnen
                            <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>
                </Card>
            </Link>
        );
    };

    const themesByStatus = {
        geplant: themes.filter(t => t.status === "geplant"),
        in_arbeit: themes.filter(t => t.status === "in_arbeit"),
        pausiert: themes.filter(t => t.status === "pausiert"),
        abgeschlossen: themes.filter(t => t.status === "abgeschlossen")
    };

    return (
        <DragDropContext onDragEnd={(result) => {
            if (!result.destination) return;
            onStatusChange(result.draggableId, result.destination.droppableId);
        }}>
            <div className="grid grid-cols-4 gap-6">
                {statuses.map(({ id, label }) => {
                    const config = statusConfig[id];
                    const columnThemes = themesByStatus[id];

                    return (
                        <div key={id} className="flex flex-col">
                            <div className={`${config.headerColor} border-2 rounded-lg p-3 mb-4`}>
                                <h3 className="font-semibold text-slate-900">{label}</h3>
                                <p className="text-sm text-slate-600">
                                    {columnThemes.length} {columnThemes.length === 1 ? "Thema" : "Themen"}
                                </p>
                            </div>

                            <Droppable droppableId={id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`space-y-4 flex-1 p-2 rounded-lg transition-colors min-h-96 ${
                                            snapshot.isDraggingOver ? "bg-slate-100" : ""
                                        }`}
                                    >
                                        {columnThemes.length > 0 ? (
                                            columnThemes.map((theme, index) => (
                                                <Draggable key={theme.id} draggableId={theme.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`${
                                                                snapshot.isDragging ? "shadow-2xl rotate-1" : ""
                                                            } transition-all`}
                                                        >
                                                            <ThemeCardComponent theme={theme} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-center text-slate-400">
                                                <p className="text-sm">Keine Themen</p>
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}