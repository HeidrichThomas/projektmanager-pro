import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Heart, Home, DollarSign, Users, Plane, GraduationCap, Package, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryConfig = {
    familie: { label: "Familie", icon: Users, color: "pink" },
    gesundheit: { label: "Gesundheit", icon: Heart, color: "red" },
    finanzen: { label: "Finanzen", icon: DollarSign, color: "green" },
    haushalt: { label: "Haushalt", icon: Home, color: "blue" },
    hobby: { label: "Hobby", icon: Package, color: "purple" },
    urlaub: { label: "Urlaub", icon: Plane, color: "teal" },
    bildung: { label: "Bildung", icon: GraduationCap, color: "amber" },
    sonstiges: { label: "Sonstiges", icon: Package, color: "slate" }
};

export default function PrivateThemeCard({ theme, onEdit, onDelete }) {
    const config = categoryConfig[theme.category] || categoryConfig.sonstiges;
    const Icon = config.icon;

    return (
        <Card className="hover:shadow-lg transition-all group">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${config.color}-600`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{theme.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                                {config.label}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(theme)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(theme.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            {theme.description && (
                <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{theme.description}</p>
                    <Link to={createPageUrl("PrivateThemeDetail") + `?id=${theme.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                            Details anzeigen
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            )}
        </Card>
    );
}