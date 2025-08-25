import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extender Day.js con plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);

export class Stopwatch {
    private startTime: number;
    private accumulatedTime: number; // Tiempo acumulado hasta ahora
    private isRunning: boolean;

    constructor() {
        this.startTime = 0;
        this.accumulatedTime = 0;
        this.isRunning = false;
    }

    setAccumulatedTime(accumulatedTime: number) {
        // Asegurar que el stopwatch esté parado antes de establecer el tiempo acumulado
        this.isRunning = false;
        this.startTime = 0;
        this.accumulatedTime = accumulatedTime;
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now();
            this.isRunning = true;
        }
    }

    pause(): void {
        if (this.isRunning) {
            // Cuando pausamos, acumulamos el tiempo transcurrido
            this.accumulatedTime += Date.now() - this.startTime;
            this.isRunning = false;
        }
    }

    reset(): void {
        this.startTime = 0;
        this.accumulatedTime = 0;
        this.isRunning = false;
    }

    stop(): void {
        if (this.isRunning) {
            // Cuando paramos, acumulamos el tiempo transcurrido
            this.accumulatedTime += Date.now() - this.startTime;
            this.isRunning = false;
        }
    }

    getElapsedTime(): number {
        if (this.isRunning) {
            // Si está corriendo: tiempo acumulado + tiempo desde el último start
            return this.accumulatedTime + (Date.now() - this.startTime);
        }
        // Si está pausado/parado: solo el tiempo acumulado
        return this.accumulatedTime;
    }

    getElapsedTimeInSeconds(): number {
        return this.getElapsedTime() / 1000;
    }

    getElapsedTimeInMinutes(): number {
        return this.getElapsedTimeInSeconds() / 60;
    }

    getElapsedTimeInHours(): number {
        return this.getElapsedTimeInMinutes() / 60;
    }

    getElapsedTimeInDays(): number {
        return this.getElapsedTimeInHours() / 24;
    }

    getElapsedTimeInWeeks(): number {
        return this.getElapsedTimeInDays() / 7;
    }

    getElapsedTimeInMonths(): number {
        return this.getElapsedTimeInDays() / 30;
    }

    getElapsedTimeInYears(): number {
        return this.getElapsedTimeInDays() / 365;
    }

    getElapsedTimeInMilliseconds(): number {
        return this.getElapsedTime();
    }

    getClockTime(): string {
        const elapsed = this.getElapsedTime();
        const duration = dayjs.duration(elapsed);
        return duration.format('HH:mm:ss');
    }

    getFormattedDuration(): string {
        const elapsed = this.getElapsedTime();
        const duration = dayjs.duration(elapsed);
        
        if (duration.asHours() >= 1) {
            return duration.format('H[h] m[m] s[s]');
        } else if (duration.asMinutes() >= 1) {
            return duration.format('m[m] s[s]');
        } else {
            return duration.format('s[s]');
        }
    }

    getHumanReadableTime(): string {
        const elapsed = this.getElapsedTime();
        return dayjs.duration(elapsed).humanize();
    }

    getStartedAt(): string | null {
        if (this.startTime === 0) return null;
        return dayjs(this.startTime).format('YYYY-MM-DD HH:mm:ss');
    }

    getStartedAtRelative(): string | null {
        if (this.startTime === 0) return null;
        return dayjs(this.startTime).fromNow();
    }
}