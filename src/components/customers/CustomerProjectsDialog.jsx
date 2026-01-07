import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Calendar, ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-100 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

export default function CustomerProjectsDialog({ open, onClose, customer, projects }) {
    if (!customer) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        Projekte von {customer.company}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="mt-4 space-y-3">
                    {projects.length > 0 ? (
                        projects.map((project) => {
                            const status = statusConfig[project.status] || statusConfig.geplant;
                            return (
                                <Link 
                                    key={project.id}
                                    to={createPageUrl("ProjectDetail") + `?id=${project.id}`}
                                    className="block"
                                >
                                    <div className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 group cursor-pointer">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0">
                                                    <FolderKanban className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                        {project.name}
                                                    </h3>
                                                    
                                                    {project.description && (
                                                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="secondary" className={`${status.color} border text-xs`}>
                                                            {status.label}
                                                        </Badge>
                                                        
                                                        {(project.start_date || project.end_date) && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <Calendar className="w-3 h-3" />
                                                                {project.start_date && format(new Date(project.start_date), "dd.MM.yyyy", { locale: de })}
                                                                {project.start_date && project.end_date && " - "}
                                                                {project.end_date && format(new Date(project.end_date), "dd.MM.yyyy", { locale: de })}
                                                            </div>
                                                        )}
                                                        
                                                        {project.progress !== undefined && (
                                                            <span className="text-xs text-slate-500">
                                                                {project.progress}% Fortschritt
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 mt-2" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            Keine Projekte für diesen Kunden vorhanden
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}