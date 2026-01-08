import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Lightbulb, Save, X, Plus, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function ThemeForm({ open, onClose, onSave, theme }) {
    const [selectedCompanyId, setSelectedCompanyId] = useState("");

    const { data: sectors = [] } = useQuery({
        queryKey: ['sectors'],
        queryFn: () => base44.entities.Sector.list()
    });

    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list()
    });
    
    const [formData, setFormData] = useState({
        name: "",
        sector_id: "",
        company_ids: [],
        description: "",
        status: "geplant",
        progress: 0,
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        if (theme) {
            setFormData({
                ...theme,
                company_ids: theme.company_ids || []
            });
        } else {
            setFormData({
                name: "",
                sector_id: "",
                company_ids: [],
                description: "",
                status: "geplant",
                progress: 0,
                start_date: "",
                end_date: ""
            });
        }
        setSelectedCompanyId("");
    }, [theme, open]);

    const addCompany = () => {
        if (!selectedCompanyId) return;
        const currentIds = formData.company_ids || [];
        if (!currentIds.includes(selectedCompanyId)) {
            setFormData({...formData, company_ids: [...currentIds, selectedCompanyId]});
        }
        setSelectedCompanyId("");
    };

    const removeCompany = (companyId) => {
        const currentIds = formData.company_ids || [];
        setFormData({...formData, company_ids: currentIds.filter(id => id !== companyId)});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                        {theme ? "Thema bearbeiten" : "Neues Thema"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <Label className="text-slate-700 font-medium">Themenname *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="z.B. Digitalisierung"
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Sparte</Label>
                        <Select
                            value={formData.sector_id}
                            onValueChange={(value) => setFormData({...formData, sector_id: value})}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Sparte auswählen (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {sectors.map((sector) => (
                                    <SelectItem key={sector.id} value={sector.id}>
                                        {sector.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Beteiligte Firmen</Label>
                        <div className="flex gap-2 mt-1.5">
                            <Select
                                value={selectedCompanyId}
                                onValueChange={setSelectedCompanyId}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Firma auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.filter(c => !(formData.company_ids || []).includes(c.id)).map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                type="button" 
                                onClick={addCompany}
                                disabled={!selectedCompanyId}
                                size="icon"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        {formData.company_ids && formData.company_ids.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {formData.company_ids.map(companyId => {
                                    const company = companies.find(c => c.id === companyId);
                                    if (!company) return null;
                                    return (
                                        <div key={companyId} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                            <span className="text-sm font-medium text-slate-700">{company.company_name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCompany(companyId)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Themenbeschreibung..."
                            className="mt-1.5"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 font-medium">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({...formData, status: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="geplant">Geplant</SelectItem>
                                    <SelectItem value="in_arbeit">In Arbeit</SelectItem>
                                    <SelectItem value="pausiert">Pausiert</SelectItem>
                                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Fortschritt ({formData.progress}%)</Label>
                            <div className="flex items-center gap-3 mt-3">
                                <Slider
                                    value={[formData.progress]}
                                    onValueChange={(value) => setFormData({...formData, progress: value[0]})}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 font-medium">Startdatum</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Enddatum</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            <X className="w-4 h-4 mr-2" />
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            <Save className="w-4 h-4 mr-2" />
                            Speichern
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}