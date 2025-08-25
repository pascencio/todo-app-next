"use client"
import { TaskOutput } from "@/app/lib/app/task/task.output";
import { TaskStatus } from "@/app/lib/app/task/task.entity";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale('es');

export interface AddTaskInput {
    name: string;
    description: string;
    status?: TaskStatus;
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
            elapsedTime: 0, // Inicializar en 0 milisegundos
            status: task.status || TaskStatus.PENDING
        });

        // Convertir a la interfaz Task con fechas formateadas
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            elapsedTime: taskEntity.elapsedTime ? dayjs.duration(taskEntity.elapsedTime).format('HH:mm:ss') : '00:00:00',
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
    elapsedTime?: string;
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
                elapsedTime: task.elapsedTime ? dayjs.duration(task.elapsedTime).format('HH:mm:ss') : '00:00:00',
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
    status: TaskStatus;
    elapsedTime: number;
}

export class UpdateTaskUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(input: UpdateTaskInput): Promise<Task> {
        const taskEntity = await this.taskOutput.updateTask(input.id, {
            id: input.id,
            updatedAt: new Date(),
            name: input.name,
            description: input.description,
            status: input.status,
            elapsedTime: input.elapsedTime
        });
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            elapsedTime: taskEntity.elapsedTime ? dayjs.duration(taskEntity.elapsedTime).format('HH:mm:ss') : '00:00:00',
            status: taskEntity.status
        };
    }
}