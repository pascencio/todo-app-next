import { AddTaskUserCase, GetTasksUserCase } from "@/app/lib/app/task/task.usecase";
import { DiContainer } from "@/app/lib/di/di";
import { TaskOutput } from "./task.output";

export function getTasksUseCasesFactory(container: DiContainer) {
    const taskOutput = container.get(TaskOutput);
    return new GetTasksUserCase(taskOutput);
}

export function getAddTaskUseCaseFactory(container: DiContainer) {
    const taskOutput = container.get(TaskOutput);
    return new AddTaskUserCase(taskOutput);
}