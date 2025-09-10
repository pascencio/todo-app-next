"use client"
import { TaskOutput } from "@/app/lib/app/task/task.output";
import { DailyTask, TaskStatus } from "@/app/lib/app/task/task.entity";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/es';
import { formatTime } from "../../util/stopwatch";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale('es');

export interface AddTaskInput {
    name: string;
    description: string;
    status?: TaskStatus;
    tags: string[];
    dailyTime: number;
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
            startedAt: 0,
            tags: task.tags,
            dailyTime: task.dailyTime,
            dailyTasks: []
        });

        // Convertir a la interfaz Task con fechas formateadas
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            updatedAtDate: taskEntity.updatedAt,
            elapsedTime: taskEntity.elapsedTime ? dayjs.duration(taskEntity.elapsedTime).format('HH:mm:ss') : '00:00:00',
            elapsedTimeInMilliseconds: taskEntity.elapsedTime ? taskEntity.elapsedTime : 0,
            startedTimeInMilliseconds: taskEntity.startedAt,
            status: taskEntity.status,
            tags: taskEntity.tags,
            dailyTime: taskEntity.dailyTime,
            dailyTasks: taskEntity.dailyTasks
        };
    }
}

export interface Task {
    id: string;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
    updatedAtDate?: Date;
    elapsedTime?: string;
    elapsedTimeInMilliseconds: number;
    startedTimeInMilliseconds: number;
    status: TaskStatus;
    tags: string[];
    dailyTime: number;
    dailyTasks: DailyTask[];
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
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) // Order by createdAt ASC
                .map((task) => ({
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    createdAt: dayjs(task.createdAt).format('DD/MM/YYYY HH:mm'),
                    updatedAt: dayjs(task.updatedAt).fromNow(),
                    updatedAtDate: task.updatedAt,
                    elapsedTime: formatTime(task.elapsedTime),
                    elapsedTimeInMilliseconds: task.elapsedTime,
                    startedTimeInMilliseconds: task.startedAt,
                    status: task.status,
                    tags: task.tags,
                    dailyTime: task.dailyTime,
                    dailyTasks: task.dailyTasks ?? []
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
    dailyTime: number;
    tags: string[];
    dailyTasks: DailyTask[];
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
        let elapsedTime = input.elapsedTime;
        if (input.status === TaskStatus.IN_PROGRESS && task.status !== TaskStatus.IN_PROGRESS) {
            console.log("Date.now()", Date.now());
            statedAt = Date.now();
        } else if (input.status === TaskStatus.IN_PROGRESS && task.status === TaskStatus.IN_PROGRESS) {
            console.log("startedAt", task.startedAt);
            statedAt = task.startedAt;
        }
        if (dayjs().isAfter(dayjs(task.updatedAt), 'day')) {
            console.log("isAfter");
            statedAt = Date.now();
            elapsedTime = 0;
        }
        console.log("statedAt", statedAt);
        console.log("elapsedTime", elapsedTime);
        const taskEntity = await this.taskOutput.updateTask(input.id, {
            id: input.id,
            updatedAt: new Date(),
            name: input.name,
            description: input.description,
            status: input.status,
            elapsedTime: elapsedTime,
            startedAt: statedAt,
            createdAt: task.createdAt,
            dailyTime: input.dailyTime,
            tags: input.tags,
            dailyTasks: input.dailyTasks
        });
        return {
            id: taskEntity.id,
            name: taskEntity.name,
            description: taskEntity.description,
            createdAt: dayjs(taskEntity.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(taskEntity.updatedAt).fromNow(),
            updatedAtDate: taskEntity.updatedAt,
            elapsedTime: formatTime(taskEntity.elapsedTime),
            elapsedTimeInMilliseconds: taskEntity.elapsedTime ? taskEntity.elapsedTime : 0,
            startedTimeInMilliseconds: taskEntity.startedAt,
            status: taskEntity.status,
            tags: taskEntity.tags,
            dailyTime: taskEntity.dailyTime,
            dailyTasks: taskEntity.dailyTasks
        };
    }
}