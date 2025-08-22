'use client'
import { useState } from "react";
import { Stopwatch } from "@/app/lib/util/stopwatch";
import { sendNotification } from "@/app/lib/util/notification";

const stopwatch = new Stopwatch();

export default function ElapsedTime() {
    const [time, setTime] = useState('00:00:00');
    const [timeInterval, setTimeInterval] = useState<NodeJS.Timeout | null>(null);

    const start = () => {
        sendNotification("Stopwatch started", "The stopwatch has started");
        stopwatch.start();
        if (!timeInterval) {
            const interval = setInterval(() => {
                const clockTime = stopwatch.getClockTime();
                setTime(clockTime);
            }, 1000);
            setTimeInterval(interval);
        }
    }

    const pause = () => {
        sendNotification("Stopwatch paused", "The stopwatch has paused");
        stopwatch.pause();
        
        // Limpiar el intervalo cuando pausamos
        if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
        }
    }

    const reset = () => {
        sendNotification("Stopwatch reset", "The stopwatch has been reset");
        stopwatch.reset();
        
        // Limpiar el intervalo y resetear el tiempo mostrado
        if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
        }
        setTime('00:00:00');
    }
    
    return (
        <div>
            <h1>Elapsed time: {time}</h1>
            <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => start()}>Start</button>
            <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => pause()}>Pause</button>
            <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => reset()}>Reset</button>
        </div>
    );
}