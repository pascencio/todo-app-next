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
            elapsedTime: 0,
            status: TaskStatus.PENDING,
            startedAt: 0
        });

        // Convertir a la interfaz Task con fechas formateadas
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            elapsedTime: taskEntity.elapsedTime ? dayjs.duration(taskEntity.elapsedTime).format('HH:mm:ss') : '00:00:00',
            elapsedTimeInMilliseconds: taskEntity.elapsedTime ? taskEntity.elapsedTime : 0,
            startedTimeInMilliseconds: taskEntity.startedAt,
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
    elapsedTimeInMilliseconds: number;
    startedTimeInMilliseconds: number;
    status: TaskStatus;
}

export interface GetTasksOutput {
    tasks: Task[];
}

export class GetTasksUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(): Promise<GetTasksOutput> {
        const tasks = await this.taskOutput.getTasks();
        
        return {
            tasks: tasks
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Más recientes primero
                .map((task) => ({
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    createdAt: dayjs(task.createdAt).format('DD/MM/YYYY HH:mm'),
                    updatedAt: dayjs(task.updatedAt).fromNow(),
                    elapsedTime: dayjs.duration(task.elapsedTime).format('HH:mm:ss'),
                    elapsedTimeInMilliseconds: task.elapsedTime,
                    startedTimeInMilliseconds: task.startedAt,
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
        const task = await this.taskOutput.getTaskById(input.id);
        if (!task) {
            throw new Error("Task not found");
        }
        // TODO: La lógica de como se almacena el tiempo de inicio dependiendo del estado de la tarea debería estar en la clase de dominio
        let statedAt = 0;
        if (input.status === TaskStatus.IN_PROGRESS && task.status !== TaskStatus.IN_PROGRESS) {
            statedAt = Date.now();
        } else if (input.status === TaskStatus.IN_PROGRESS && task.status === TaskStatus.IN_PROGRESS) {
            statedAt = task.startedAt;
        }
        const taskEntity = await this.taskOutput.updateTask(input.id, {
            id: input.id,
            updatedAt: new Date(),
            name: input.name,
            description: input.description,
            status: input.status,
            elapsedTime: input.elapsedTime,
            startedAt: statedAt,
            createdAt: task.createdAt
        });
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            elapsedTime: taskEntity.elapsedTime ? dayjs.duration(taskEntity.elapsedTime).format('HH:mm:ss') : '00:00:00',
            elapsedTimeInMilliseconds: taskEntity.elapsedTime ? taskEntity.elapsedTime : 0,
            startedTimeInMilliseconds: taskEntity.startedAt,
            status: taskEntity.status
        };
    }
}