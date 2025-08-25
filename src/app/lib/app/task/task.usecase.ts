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
        return this.taskOutput.addTask({
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            name: task.name,
            description: task.description,
            status: TaskStatus.PENDING
        }) as unknown as Task;
    }
}

export interface Task {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
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