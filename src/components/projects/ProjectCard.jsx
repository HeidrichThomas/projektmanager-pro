import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Building2, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-50 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-50 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-50 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
};

export default function ProjectCard({ project, customer }) {
    const status = statusConfig[project.status] || statusConfig.geplant;
    
    return (
        <Link to={createPageUrl("ProjectDetail") + `?id=${project.id}`}>
            <Card className="p-5 hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {project.name}
                            </h3>
                            {customer && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {customer.company}
                                </p>
                            )}
                        </div>
                    </div>
                    <Badge variant="secondary" className={`${status.color} border dark:bg-opacity-20`}>
                        {status.label}
                    </Badge>
                </div>
                
                {project.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                        {project.description}
                    </p>
                )}
                
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500 dark:text-slate-400">Fortschritt</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-2" />
                    </div>
                    
                    {(project.start_date || project.end_date) && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            {project.start_date && format(new Date(project.start_date), "dd.MM.yyyy", { locale: de })}
                            {project.start_date && project.end_date && " - "}
                            {project.end_date && format(new Date(project.end_date), "dd.MM.yyyy", { locale: de })}
                        </div>
                    )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                    <span className="text-sm text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        Details anzeigen
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </Card>
        </Link>
    );
}