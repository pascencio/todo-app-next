'use client'
export enum TaskStatus {
    PENDING = "Pendiente",
    IN_PROGRESS = "En progreso",
    COMPLETED = "Completada",
    PAUSED = "Pausada",
}

export interface TaskEntity {
    id: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt: Date;
    elapsedTime: number;
    status: TaskStatus;
}