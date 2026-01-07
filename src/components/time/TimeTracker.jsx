import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square, Clock } from "lucide-react";

export default function TimeTracker({ onSave, projectId }) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const intervalRef = useRef(null);

    // Persistenz: Timer-State aus localStorage laden
    useEffect(() => {
        const savedTimer = localStorage.getItem(`timer_${projectId}`);
        if (savedTimer) {
            const data = JSON.parse(savedTimer);
            setIsRunning(data.isRunning);
            setIsPaused(data.isPaused);
            setStartTime(data.startTime);
            
            if (data.isRunning && !data.isPaused) {
                const elapsed = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
                setSeconds(elapsed);
            } else {
                setSeconds(data.seconds);
            }
        }
    }, [projectId]);

    // Persistenz: Timer-State in localStorage speichern
    useEffect(() => {
        if (projectId) {
            localStorage.setItem(`timer_${projectId}`, JSON.stringify({
                isRunning,
                isPaused,
                seconds,
                startTime
            }));
        }
    }, [isRunning, isPaused, seconds, startTime, projectId]);

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

    const handleStart = () => {
        if (!isRunning) {
            setStartTime(new Date().toISOString());
        }
        setIsRunning(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleStop = () => {
        if (seconds > 0) {
            const duration_minutes = Math.round(seconds / 60);
            onSave({
                start_time: startTime,
                end_time: new Date().toISOString(),
                duration_minutes
            });
        }
        setIsRunning(false);
        setIsPaused(false);
        setSeconds(0);
        setStartTime(null);
        if (projectId) {
            localStorage.removeItem(`timer_${projectId}`);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-slate-600" />
                    Arbeitszeit-Timer
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="text-3xl font-bold text-slate-900 font-mono">
                        {formatTime(seconds)}
                    </div>
                    <div className="flex gap-2">
                        {!isRunning || isPaused ? (
                            <Button 
                                onClick={handleStart}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Play className="w-3 h-3 mr-1" />
                                {isPaused ? 'Fortsetzen' : 'Start'}
                            </Button>
                        ) : (
                            <Button 
                                onClick={handlePause}
                                size="sm"
                                variant="outline"
                            >
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                            </Button>
                        )}
                        <Button 
                            onClick={handleStop}
                            disabled={!isRunning && seconds === 0}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                        >
                            <Square className="w-3 h-3 mr-1" />
                            Stopp
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}