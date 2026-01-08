import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, MapPin, Phone, Smartphone, Mail, Globe, Pencil, Copy, Trash2 } from "lucide-react";

export default function CustomerCard({ customer, onEdit, onCopy, onDelete, projectCount, onShowProjects }) {
    const typeConfig = {
        customer: { label: "Kunde", color: "bg-blue-50 text-blue-700 border-blue-200" },
        supplier: { label: "Lieferant", color: "bg-purple-50 text-purple-700 border-purple-200" },
        both: { label: "Kunde & Lieferant", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }
    };
    
    const type = typeConfig[customer.type] || typeConfig.customer;
    
    return (
        <Card className="p-4 hover:shadow-lg transition-all duration-300 border-slate-200 group flex flex-col h-64">
            <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex items-start gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-slate-900 truncate">{customer.company}</h3>
                        {customer.contact_name && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                <User className="w-3 h-3 shrink-0" />
                                <span className="truncate">{customer.contact_name}</span>
                            </p>
                        )}
                    </div>
                </div>
                <Badge variant="secondary" className={`${type.color} border shrink-0 text-xs`}>
                    {type.label.split(' ')[0]}
                </Badge>
            </div>
            
            <div className="space-y-1.5 text-xs text-slate-600 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                {(customer.street || customer.city) && (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">
                            {customer.street && <span>{customer.street}, </span>}
                            {customer.postal_code} {customer.city}
                        </span>
                    </div>
                )}
                
                {customer.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <a href={`tel:${customer.phone}`} className="hover:text-slate-900 transition-colors truncate">
                            {customer.phone}
                        </a>
                    </div>
                )}
            </div>
            
            <div className="flex gap-1.5 pt-2 border-t border-slate-100 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" onClick={() => onEdit(customer)} className="flex-1 text-xs h-7">
                    <Pencil className="w-3 h-3 mr-0.5" />
                    Bearbeiten
                </Button>
                <Button size="sm" variant="outline" onClick={() => onCopy(customer)} className="h-7 px-2">
                    <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(customer)} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2">
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
        </Card>
    );
}