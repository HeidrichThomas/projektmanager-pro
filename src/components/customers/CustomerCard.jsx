import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, MapPin, Phone, Smartphone, Mail, Globe, Pencil, Copy, Trash2 } from "lucide-react";

export default function CustomerCard({ customer, onEdit, onCopy, onDelete, projectCount, onShowProjects }) {
    const [scrollPos, setScrollPos] = useState(0);
    const contentRef = useRef(null);

    const handleScroll = (e) => {
        const element = contentRef.current;
        if (element) {
            const scrollPercentage = (element.scrollLeft / (element.scrollWidth - element.clientWidth)) * 100;
            setScrollPos(scrollPercentage || 0);
        }
    };

    const handleSliderChange = (e) => {
        const percentage = parseFloat(e.target.value);
        if (contentRef.current) {
            const maxScroll = contentRef.current.scrollWidth - contentRef.current.clientWidth;
            contentRef.current.scrollLeft = (percentage / 100) * maxScroll;
        }
        setScrollPos(percentage);
    };
    const typeConfig = {
        customer: { label: "Kunde", color: "bg-blue-50 text-blue-700 border-blue-200" },
        supplier: { label: "Lieferant", color: "bg-purple-50 text-purple-700 border-purple-200" },
        both: { label: "Kunde & Lieferant", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }
    };
    
    const type = typeConfig[customer.type] || typeConfig.customer;
    
    return (
        <Card className="p-3 hover:shadow-lg transition-all duration-300 border-slate-200 group flex flex-col h-32">
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-start gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-base text-slate-900 truncate">{customer.company}</h3>
                        {customer.contact_name && (
                            <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
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
            
            <div 
                ref={contentRef}
                onScroll={handleScroll}
                className="space-y-1 text-sm text-slate-600 overflow-x-auto flex-1 scrollbar-thin scroll-smooth"
            >
                {(customer.street || customer.city) && (
                    <div className="flex items-start gap-2 whitespace-nowrap pr-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span>
                            {customer.street && <span>{customer.street}, </span>}
                            {customer.postal_code} {customer.city}
                        </span>
                    </div>
                )}
                
                {customer.phone && (
                    <div className="flex items-center gap-2 whitespace-nowrap pr-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${customer.phone}`} className="hover:text-slate-900 transition-colors">
                            {customer.phone}
                        </a>
                    </div>
                )}
            </div>

            <input
                type="range"
                min="0"
                max="100"
                value={scrollPos}
                onChange={handleSliderChange}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400 mt-2"
            />
            
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