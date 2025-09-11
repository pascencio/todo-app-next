"use client";

import { Task as TaskType } from "@/app/lib/app/task/task.usecase";
import { TaskStatus } from "@/app/lib/app/task/task.entity";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import React, { useState } from "react";
import { Ellipsis, Minus, Pause, Pencil, Play, Check, CalendarIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/app/lib/util/stopwatch";
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area";
import dayjs from "dayjs";

interface TaskStopWatch {
    id: string;
    clockTime: string;
    elapsedTime: number;
}

interface TaskItemProps {
    task: TaskType;
    isPlaying: boolean;
    taskStopWatch: TaskStopWatch;
    onStart: (id: string) => Promise<void>;
    onPause: (id: string) => Promise<void>;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onComplete?: (id: string) => void;
}

export default function TaskItem({
    task,
    isPlaying,
    taskStopWatch,
    onStart,
    onPause,
    onEdit,
    onDelete,
    onComplete,
}: TaskItemProps) {
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

    return (
        <>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de querer eliminar la tarea?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no puede ser deshecha. Se eliminará la tarea: <strong>{task.name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(task.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className={`p-4 w-70 sm:w-full ${
                task.status === TaskStatus.IN_PROGRESS 
                    ? "bg-task-in-progress text-task-in-progress-foreground" 
                    : task.status === TaskStatus.COMPLETED 
                    ? "bg-task-completed text-task-completed-foreground" 
                    : ""
            }`}>
                <CardHeader>
                    <CardTitle>
                        <div className="flex justify-between items-center">
                            <h1 className="text-lg font-bold">{task.name}</h1>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline"><Ellipsis /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm"><span className="font-bold font-size-xs">Descripción:</span></p>
                                        <p>{task.description}</p>
                                        <p className="text-sm"><span className="font-bold font-size-xs">Creación:</span> {task.createdAt}</p>
                                        <p className="text-sm"><span className="font-bold font-size-xs">Actualización:</span> {task.updatedAt}</p>
                                        <div>
                                            <h1 className="text-sm"><span className="font-bold font-size-xs">Tareas en diarias:</span></h1>
                                            <Separator className="my-2" />
                                            <ScrollArea className="h-40 w-full">
                                                {task.dailyTasks !== undefined && task.dailyTasks.map((dailyTask) => (
                                                    <React.Fragment key={dailyTask.taskDate.valueOf()}>
                                                        <p className="text-sm flex items-center gap-2">
                                                            <CalendarIcon /> {dayjs(dailyTask.taskDate).format('DD/MM/YYYY HH:mm')} <Badge>{formatTime(dailyTask.elapsedTime)}</Badge>
                                                        </p>
                                                        <Separator className="my-2" />
                                                    </React.Fragment>
                                                ))}
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Separator className="my-4" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm"><span className="font-bold font-size-xs">Fecha:</span> <Badge>{dayjs(task.updatedAtDate).format('DD/MM/YYYY')}</Badge></p>
                        <p className="text-sm"><span className="font-bold font-size-xs">Tiempo:</span> <Badge>{taskStopWatch.id === task.id ? taskStopWatch.clockTime : task.elapsedTime || '00:00:00'}</Badge></p>
                        <p className="text-sm"><span className="font-bold font-size-xs">Status:</span> <Badge variant="secondary">{task.status === TaskStatus.IN_PROGRESS ? "En progreso" : task.status === TaskStatus.PAUSED ? "Pausada" : task.status === TaskStatus.COMPLETED ? "Completada" : "Pendiente"}</Badge></p>
                        <div className="mt-2 flex gap-2">
                            {(task.tags ?? []).map((tag) => (
                                <Badge key={tag}>{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardAction className="w-full">
                    <div className="flex gap-2 justify-end">
                    <Button disabled={isPlaying && taskStopWatch.id !== task.id} onClick={async () => {
                                    if (taskStopWatch.id === task.id) {
                                        await onPause(task.id);
                                    } else {
                                        await onStart(task.id);
                                    }
                                }} variant={taskStopWatch.id === task.id ? "outline" : "default"}>{taskStopWatch.id === task.id ? <Pause /> : <Play />}</Button>
                        <Button
                                    disabled={task.status === TaskStatus.COMPLETED || task.elapsedTimeInMilliseconds === 0}
                                    className="btn-task-success"
                                    onClick={() => onComplete?.(task.id)}
                                >
                                    <Check />
                                </Button>
                        <Button disabled={isPlaying && taskStopWatch.id === task.id} variant="outline" onClick={() => onEdit(task.id)}><Pencil /></Button>
                        <Button disabled={isPlaying && taskStopWatch.id === task.id} variant="destructive" onClick={() => setIsAlertOpen(true)}><Minus /></Button>
                    </div>
                </CardAction>
            </Card>
        </>
    );
}

export type { TaskItemProps, TaskStopWatch };
