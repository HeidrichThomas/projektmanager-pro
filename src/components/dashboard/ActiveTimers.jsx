import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ActiveTimers({ projects }) {
    const [activeTimers, setActiveTimers] = useState([]);

    useEffect(() => {
        const checkTimers = () => {
            const timers = [];
            
            projects.forEach(project => {
                const savedTimer = localStorage.getItem(`timer_${project.id}`);
                if (savedTimer) {
                    try {
                        const data = JSON.parse(savedTimer);
                        if (data.isRunning && !data.isPaused) {
                            const elapsed = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
                            timers.push({
                                projectId: project.id,
                                projectName: project.name,
                                seconds: elapsed
                            });
                        }
                    } catch (e) {
                        // Ignore invalid data
                    }
                }
            });
            
            setActiveTimers(timers);
        };

        checkTimers();
        const interval = setInterval(checkTimers, 1000);
        
        return () => clearInterval(interval);
    }, [projects]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (activeTimers.length === 0) return null;

    return (
        <Card className="shadow-sm border-2 border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600 animate-pulse" />
                    Aktive Zeiterfassung
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {activeTimers.map(timer => (
                    <Link 
                        key={timer.projectId} 
                        to={createPageUrl("ProjectDetail") + `?id=${timer.projectId}`}
                    >
                        <div className="p-4 bg-white border-2 border-green-300 rounded-lg hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Play className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {timer.projectName}
                                        </h3>
                                        <p className="text-xs text-green-600 font-medium">
                                            Timer läuft
                                        </p>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-green-700 font-mono">
                                    {formatTime(timer.seconds)}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}