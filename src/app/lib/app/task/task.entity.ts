'use client'
export enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
}

export interface TaskEntity {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    status: TaskStatus;
}