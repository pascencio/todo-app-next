'use client'
export enum TaskStatus {
    PENDING = "Pending",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed",
}

export interface TaskEntity {
    id: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt: Date;
    status: TaskStatus;
}