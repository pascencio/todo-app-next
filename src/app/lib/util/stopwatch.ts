export class Stopwatch {
    private startTime: number;
    private accumulatedTime: number; // Tiempo acumulado hasta ahora
    private isRunning: boolean;

    constructor() {
        this.startTime = 0;
        this.accumulatedTime = 0;
        this.isRunning = false;
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
        const hours = Math.floor(this.getElapsedTimeInHours() % 24);
        const hoursString = hours.toString().padStart(2, '0');
        const minutes = Math.floor(this.getElapsedTimeInMinutes() % 60);
        const minutesString = minutes.toString().padStart(2, '0');
        const seconds = Math.floor(this.getElapsedTimeInSeconds() % 60);
        const secondsString = seconds.toString().padStart(2, '0');
        return `${hoursString}:${minutesString}:${secondsString}`;
    }
}