'use client'
export enum TaskStatus {
    PENDING = "Pendiente",
    IN_PROGRESS = "En progreso",
    COMPLETED = "Completado",
}

export interface TaskEntity {
    id: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt: Date;
    status: TaskStatus;
}