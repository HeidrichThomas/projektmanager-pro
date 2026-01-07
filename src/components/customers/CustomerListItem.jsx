import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, MapPin, Phone, Mail, Pencil, Copy, Trash2 } from "lucide-react";

export default function CustomerListItem({ customer, onEdit, onCopy, onDelete, projectCount, onShowProjects }) {
    const typeConfig = {
        customer: { label: "Kunde", color: "bg-blue-50 text-blue-700 border-blue-200" },
        supplier: { label: "Lieferant", color: "bg-purple-50 text-purple-700 border-purple-200" },
        both: { label: "Kunde & Lieferant", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }
    };
    
    const type = typeConfig[customer.type] || typeConfig.customer;
    const isSupplierOnly = customer.type === 'supplier';
    
    return (
        <div 
            className={`bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group ${isSupplierOnly ? 'cursor-pointer' : ''}`}
            onClick={isSupplierOnly ? () => onShowProjects(customer) : undefined}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">{customer.company}</h3>
                            <Badge variant="secondary" className={`${type.color} border shrink-0`}>
                                {type.label}
                            </Badge>
                            {projectCount > 0 && customer.type !== 'supplier' && (
                                <Badge 
                                    variant="secondary" 
                                    className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 cursor-pointer hover:bg-emerald-100 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShowProjects(customer);
                                    }}
                                >
                                    {projectCount} {projectCount === 1 ? 'Projekt' : 'Projekte'}
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                            {customer.contact_name && (
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>{customer.contact_name}</span>
                                </div>
                            )}
                            
                            {customer.city && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>{customer.city}</span>
                                </div>
                            )}
                            
                            {customer.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <a href={`tel:${customer.phone}`} className="hover:text-slate-900">
                                        {customer.phone}
                                    </a>
                                </div>
                            )}
                            
                            {customer.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <a href={`mailto:${customer.email}`} className="hover:text-slate-900">
                                        {customer.email}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(customer); }}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onCopy(customer); }}>
                        <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(customer); }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}