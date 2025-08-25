"use client"
import { TaskOutput } from "@/app/lib/app/task/task.output";
import { TaskEntity } from "@/app/lib/app/task/task.entity";

export class AddTaskUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(task: TaskEntity): Promise<TaskEntity> {
        return this.taskOutput.addTask(task);
    }
}

export class GetTasksUserCase {
    constructor(private taskOutput: TaskOutput) {
    }

    async execute(): Promise<TaskEntity[]> {
        return this.taskOutput.getTasks();
    }
}