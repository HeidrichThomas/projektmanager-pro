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
                <Card className="p-3 hover:shadow-xl transition-all duration-300 border-slate-200 group cursor-pointer flex flex-col h-48">
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

                    <Badge variant="secondary" className={`${statusConfig[theme.status]?.color} border mb-2 w-fit text-xs`}>
                        {statusConfig[theme.status]?.label}
                    </Badge>

                    {theme.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2 flex-1">
                            {theme.description}
                        </p>
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