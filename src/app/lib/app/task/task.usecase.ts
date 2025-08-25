"use client"
import { TaskOutput } from "@/app/lib/app/task/task.output";
import { TaskEntity, TaskStatus } from "@/app/lib/app/task/task.entity";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export interface AddTaskInput {
    name: string;
    description: string;
}

export class AddTaskUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(task: AddTaskInput): Promise<Task> {
        const now = new Date();
        const taskEntity = await this.taskOutput.addTask({
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            name: task.name,
            description: task.description,
            status: TaskStatus.PENDING
        });

        // Convertir a la interfaz Task con fechas formateadas
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            status: taskEntity.status
        };
    }
}

export interface Task {
    id: string;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
    status: TaskStatus;
}

export interface GetTasksOutput {
    tasks: Task[];
}

export class GetTasksUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(): Promise<GetTasksOutput> {
        return {
            tasks: (await this.taskOutput.getTasks()).map((task) => ({
                id: task.id,
                name: task.name,
                description: task.description,
                createdAt: dayjs(task.createdAt).format('DD/MM/YYYY HH:mm'),
                updatedAt: dayjs(task.updatedAt).fromNow(),
                status: task.status
            })) as Task[]
        };
    }
}

export interface DeleteTaskInput {
    id: string;
}

export class DeleteTaskUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(input: DeleteTaskInput): Promise<void> {
        return this.taskOutput.deleteTask(input.id);
    }
}

export interface UpdateTaskInput {
    id: string;
    name: string;
    description: string;
}

export class UpdateTaskUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(input: UpdateTaskInput): Promise<TaskEntity> {
        return this.taskOutput.updateTask(input.id, {
            id: input.id,
            updatedAt: new Date(),
            name: input.name,
            description: input.description,
            status: TaskStatus.PENDING
        });
    }
}