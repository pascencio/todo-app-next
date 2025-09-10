'use client'
export enum TaskStatus {
    PENDING = "Pendiente",
    IN_PROGRESS = "En progreso",
    COMPLETED = "Completada",
    PAUSED = "Pausada",
}

export interface DailyTask {
    taskDate: Date;
    elapsedTime: number;
}

export interface TaskEntity {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    elapsedTime: number;
    startedAt: number;
    dailyTime: number;
    status: TaskStatus;
    tags: string[];
    dailyTasks: DailyTask[];
}