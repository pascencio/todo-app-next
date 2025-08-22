import { TaskEntity } from "@/app/lib/app/task/task.entity";

export abstract class TaskOutput {
    abstract addTask(task: TaskEntity): Promise<TaskEntity>;
    abstract getTasks(): Promise<TaskEntity[]>;
    abstract getTaskById(id: string): Promise<TaskEntity | null>;
    abstract deleteTask(id: string): Promise<void>;
    abstract updateTask(id: string, task: TaskEntity): Promise<void>;
}