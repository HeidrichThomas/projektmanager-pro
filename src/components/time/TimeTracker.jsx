import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square, Clock } from "lucide-react";

export default function TimeTracker({ onSave }) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const intervalRef = useRef(null);

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
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-slate-600" />
                    Arbeitszeit-Timer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    <div className="text-5xl font-bold text-slate-900 font-mono">
                        {formatTime(seconds)}
                    </div>
                    <div className="flex gap-2">
                        {!isRunning || isPaused ? (
                            <Button 
                                onClick={handleStart}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {isPaused ? 'Fortsetzen' : 'Start'}
                            </Button>
                        ) : (
                            <Button 
                                onClick={handlePause}
                                variant="outline"
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </Button>
                        )}
                        <Button 
                            onClick={handleStop}
                            disabled={!isRunning && seconds === 0}
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            Stopp
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}