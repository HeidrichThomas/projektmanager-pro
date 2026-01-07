import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, X, Maximize2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function FloatingTimer({ projectId, projectName, onClose }) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        const savedTimer = localStorage.getItem(`timer_${projectId}`);
        if (savedTimer) {
            const data = JSON.parse(savedTimer);
            setIsRunning(data.isRunning);
            setIsPaused(data.isPaused);
            
            if (data.isRunning && !data.isPaused) {
                const elapsed = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
                setSeconds(elapsed);
            } else {
                setSeconds(data.seconds);
            }
        }
    }, [projectId]);

    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isPaused]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isRunning || isPaused) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white shadow-2xl rounded-lg border-2 border-slate-300 p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                    {projectName}
                </span>
                <div className="flex gap-1">
                    <Link to={createPageUrl("ProjectDetail") + "?id=" + projectId}>
                        <Button size="icon" variant="ghost" className="h-5 w-5">
                            <Maximize2 className="w-3 h-3" />
                        </Button>
                    </Link>
                    <Button size="icon" variant="ghost" onClick={onClose} className="h-5 w-5">
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono text-center">
                {formatTime(seconds)}
            </div>
            <div className="text-xs text-center text-green-600 mt-1 animate-pulse">
                ● Timer läuft
            </div>
        </div>
    );
}