import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, MapPin, Phone, Smartphone, Mail, Globe, Pencil, Copy, Trash2 } from "lucide-react";

export default function CustomerCard({ customer, onEdit, onCopy, onDelete, projectCount }) {
    const typeConfig = {
        customer: { label: "Kunde", color: "bg-blue-50 text-blue-700 border-blue-200" },
        supplier: { label: "Lieferant", color: "bg-purple-50 text-purple-700 border-purple-200" },
        both: { label: "Kunde & Lieferant", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }
    };
    
    const type = typeConfig[customer.type] || typeConfig.customer;
    
    return (
        <Card className="p-5 hover:shadow-lg transition-all duration-300 border-slate-200 group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900">{customer.company}</h3>
                        {customer.contact_name && (
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {customer.contact_name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className={`${type.color} border`}>
                        {type.label}
                    </Badge>
                    {projectCount > 0 && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {projectCount} {projectCount === 1 ? 'Projekt' : 'Projekte'}
                        </Badge>
                    )}
                </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 mb-4">
                {(customer.street || customer.city) && (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span>
                            {customer.street && <span>{customer.street}, </span>}
                            {customer.postal_code} {customer.city}
                            {customer.country && customer.country !== "Deutschland" && `, ${customer.country}`}
                        </span>
                    </div>
                )}
                
                {customer.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${customer.phone}`} className="hover:text-slate-900 transition-colors">
                            {customer.phone}
                        </a>
                    </div>
                )}
                
                {customer.mobile_phone && (
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${customer.mobile_phone}`} className="hover:text-slate-900 transition-colors">
                            {customer.mobile_phone}
                        </a>
                    </div>
                )}
                
                {customer.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a href={`mailto:${customer.email}`} className="hover:text-slate-900 transition-colors">
                            {customer.email}
                        </a>
                    </div>
                )}
                
                {customer.website && (
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="hover:text-slate-900 transition-colors">
                            {customer.website}
                        </a>
                    </div>
                )}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" onClick={() => onEdit(customer)} className="flex-1">
                    <Pencil className="w-3 h-3 mr-1" />
                    Bearbeiten
                </Button>
                <Button size="sm" variant="outline" onClick={() => onCopy(customer)}>
                    <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(customer)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
        </Card>
    );
}