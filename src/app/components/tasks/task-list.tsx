"use client";

import { Task as TaskType } from "@/app/lib/app/task/task.usecase";
import TaskItem, { TaskStopWatch } from "./task-item";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskListProps {
    tasks: TaskType[];
    isPlaying: boolean;
    taskStopWatch: TaskStopWatch;
    onStart: (id: string) => Promise<void>;
    onPause: (id: string) => Promise<void>;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
}

export default function TaskList({
    tasks,
    isPlaying,
    taskStopWatch,
    onStart,
    onPause,
    onEdit,
    onDelete,
    onComplete
}: TaskListProps) {
    return (
        <ScrollArea className="h-[calc(100vh-200px)] w-full scroll-area-inset-shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto place-items-center sm:place-items-stretch">
                {
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isPlaying={isPlaying}
                            taskStopWatch={taskStopWatch}
                            onStart={onStart}
                            onPause={onPause}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onComplete={onComplete}
                        />
                    ))
                }
            </div>
        </ScrollArea>
    );
}

export type { TaskListProps };
