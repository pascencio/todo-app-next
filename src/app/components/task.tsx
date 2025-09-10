"use client";

import { AddTaskUserCase, DeleteTaskUserCase, GetTasksUserCase, UpdateTaskUserCase, Task as TaskType } from "@/app/lib/app/task/task.usecase";
import { DailyTask, TaskStatus } from "@/app/lib/app/task/task.entity";
import { DiContainer } from "@/app/lib/di/di";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { z } from "zod"
import { Input } from "@/components/ui/input"

import React, { useEffect, useState } from "react";
import { Ellipsis, Minus, Pause, Pencil, Play, Plus } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatTime, Stopwatch } from "@/app/lib/util/stopwatch";
import { Badge } from "@/components/ui/badge"
import { sendNotification } from "@/app/lib/util/notification";
import { TagsInput } from "@/app/components/tags-input";
import { Slider } from "@/components/ui/slider";
import dayjs from "dayjs";
import { ScrollArea } from "@/components/ui/scroll-area";

const oneHourInMilliseconds = 1000 * 60 * 60;

function useTasksUseCase() {
    return DiContainer.getInstance().get(GetTasksUserCase)
}

function useAddTaskUseCase() {
    return DiContainer.getInstance().get(AddTaskUserCase)
}

function useDeleteTaskUseCase() {
    return DiContainer.getInstance().get(DeleteTaskUserCase)
}

function useUpdateTaskUseCase() {
    return DiContainer.getInstance().get(UpdateTaskUserCase)
}

const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Título es requerido.",
    }),
    description: z.string().min(1, {
        message: "Descripción es requerida.",
    }),
    tags: z.array(z.string()).min(1, {
        message: "Etiquetas son requeridas.",
    }),
    dailyTime: z.array(z.number()).min(1, {
        message: "Horas diarias son requeridas.",
    }),
})

interface TaskStopWatch {
    id: string;
    clockTime: string;
    elapsedTime: number;
}

export default function Task() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTaskId, setEditTaskId] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogDescription, setDialogDescription] = useState<string>("");
    const [timeInterval, setTimeInterval] = useState<NodeJS.Timeout | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
    const [stopwatch] = useState<Stopwatch>(() => new Stopwatch());
    const [taskStopWatch, setTaskStopWatch] = useState<TaskStopWatch>({
        id: "",
        clockTime: "00:00:00",
        elapsedTime: 0,
    });
    const [taskToDelete, setTaskToDelete] = useState<TaskType | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            description: "",
            tags: [],
            dailyTime: [],
        },
    })
    const addTaskUseCase = useAddTaskUseCase();
    const getTasksUseCase = useTasksUseCase();
    const deleteTaskUseCase = useDeleteTaskUseCase();
    const updateTaskUseCase = useUpdateTaskUseCase();

    const start = async (id: string, currentTasks?: TaskType[]) => {
        const tasksToUse = currentTasks ?? tasks;
        const task = tasksToUse.find((task) => task.id === id);
        if (!task) {
            console.error("Task not found");
            return;
        }
        let accumulatedTime = task.elapsedTimeInMilliseconds;
        let startedTime = task.startedTimeInMilliseconds;
        const now = dayjs(new Date());
        const updatedAt = dayjs(task.updatedAtDate);
        console.log(`accumulatedTime: ${accumulatedTime} + ${now.toDate().getTime()} - ${task.startedTimeInMilliseconds}`);
        if (task.status === TaskStatus.IN_PROGRESS && startedTime > 0) {
            accumulatedTime += now.toDate().getTime() - task.startedTimeInMilliseconds; // TODO: Esta lógica debería estar en la clase de dominio
            startedTime = task.startedTimeInMilliseconds;
        }
        console.log(now.isAfter(updatedAt, 'day'));
        console.log("now", now);
        console.log("updatedAt", updatedAt);
        if (now.isAfter(updatedAt, 'day')) {
            const elapsedTime = accumulatedTime - startedTime;
            const daylyTask = {
                taskDate: updatedAt.startOf('day').toDate(),
                elapsedTime: elapsedTime,
            };
            task.dailyTasks.push(daylyTask);
            accumulatedTime = 0;
            startedTime = 0;
        }
        stopwatch.setInitialTime(startedTime, accumulatedTime);
        sendNotification("Tiempo iniciado", `Tarea ${task.name} ha sido iniciada!`);
        stopwatch.start();
        const updatedTask = await updateTaskUseCase.execute({
            id,
            elapsedTime: stopwatch.getElapsedTimeInMilliseconds(),
            name: task.name,
            description: task.description,
            status: TaskStatus.IN_PROGRESS,
            tags: task.tags,
            dailyTime: task.dailyTime,
            dailyTasks: task.dailyTasks
        });
        setTasks(tasksToUse.map((task) => task.id === id ? updatedTask as unknown as TaskType : task));
        setTaskStopWatch({
            id,
            clockTime: stopwatch.getClockTime(),
            elapsedTime: stopwatch.getElapsedTimeInMilliseconds(),
        });
        setIsPlaying(true);
        if (!timeInterval) {
            const interval = setInterval(() => {
                setTaskStopWatch({
                    id,
                    clockTime: stopwatch.getClockTime(),
                    elapsedTime: stopwatch.getElapsedTimeInMilliseconds(),
                });
            }, 1000);
            setTimeInterval(interval);
        }
    }

    const pause = async (id: string) => {
        const task = tasks.find((task) => task.id === id);
        if (!task) {
            console.error("Task not found");
            return;
        }
        sendNotification("Tiempo pausado", `Tarea ${task.name} ha sido pausada!`);
        stopwatch.pause();
        setTaskStopWatch({
            id: "",
            clockTime: "00:00:00",
            elapsedTime: stopwatch.getElapsedTimeInMilliseconds(),
        });
        setIsPlaying(false);
        // Limpiar el intervalo cuando pausamos
        if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
        }

        const updatedTask = await updateTaskUseCase.execute({
            id,
            elapsedTime: stopwatch.getElapsedTimeInMilliseconds(),
            name: task.name,
            description: task.description,
            status: TaskStatus.PAUSED,
            tags: task.tags,
            dailyTime: task.dailyTime,
            dailyTasks: task.dailyTasks
        });
        setTasks(tasks.map((task) => task.id === id ? updatedTask as unknown as TaskType : task));
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { tasks } = await getTasksUseCase.execute();
                setTasks(tasks as TaskType[]);
                const taskInProgress = tasks.find((task) => task.status === TaskStatus.IN_PROGRESS);
                if (taskInProgress) {
                    start(taskInProgress.id, tasks as TaskType[]);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);
            }
        };

        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getTasksUseCase]);

    const handleDeleteTask = async (id: string) => {
        await deleteTaskUseCase.execute({ id });
        setTasks(tasks.filter((task) => task.id !== id));
    }

    const handleUpdateTask = async (id: string, data: z.infer<typeof FormSchema>) => {
        const task = tasks.find((task) => task.id === id);
        if (!task) {
            console.error("Task not found");
            return;
        }
        await updateTaskUseCase.execute({
            id,
            name: data.title,
            description: data.description,
            elapsedTime: task.elapsedTimeInMilliseconds,
            status: task.status as TaskStatus,
            tags: data.tags,
            dailyTime: data.dailyTime[0],
            dailyTasks: task.dailyTasks
        });
        setTasks(tasks.map((task) => task.id === id ? { ...task, name: data.title, description: data.description, tags: data.tags, dailyTime: data.dailyTime[0] } : task));
    }

    const onOpenChange = (status: boolean) => {
        if (status) {
            if (!isEditOpen) {
                setIsEditOpen(false);
                setEditTaskId("");
                setDialogTitle("Nueva Tarea");
                setDialogDescription("Agrega una nueva tarea a tu lista de tareas.");
                form.reset();
            } else {
                setIsEditOpen(true);
                setDialogTitle("Editar Tarea");
                setDialogDescription("Edita la tarea seleccionada.");
            }
        } else {
            setIsOpen(false);
            setIsEditOpen(false);
        }
    }

    const openEditDialog = (id: string) => {
        const task = tasks.find((task) => task.id === id);
        if (!task) {
            console.error("Task not found");
            // TODO: Show error message
            return;
        }
        setEditTaskId(id);
        form.setValue("title", task.name);
        form.setValue("description", task.description);
        form.setValue("tags", task.tags);
        form.setValue("dailyTime", [task.dailyTime]);
        setDialogTitle("Editar Tarea");
        setDialogDescription("Edita la tarea seleccionada.");
        setIsEditOpen(true);
        setIsOpen(true);
    }

    const openAddDialog = () => {
        setIsOpen(true);
        setDialogTitle("Nueva Tarea");
        setDialogDescription("Agrega una nueva tarea a tu lista de tareas.");
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            console.log(data);
            if (isEditOpen) {
                await handleUpdateTask(editTaskId, data);
            } else {
                const task = await addTaskUseCase.execute({
                    name: data.title,
                    description: data.description,
                    tags: data.tags,
                    dailyTime: data.dailyTime[0]
                });
                setTasks([...tasks, task as TaskType]);
            }
            setIsOpen(false);
            setIsEditOpen(false);
            setEditTaskId("");
            setDialogTitle("");
            setDialogDescription("");
            form.reset();
        } catch (error) {
            console.error('Error adding task:', error);
            // TODO: Show error message
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Lista de Tareas</h1>
            <Separator className="my-4" />
            <div className="flex justify-end mb-4">
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de querer eliminar la tarea?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no puede ser deshecha. Se eliminará la tarea: <strong>{taskToDelete?.name ?? ""}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTask(taskToDelete?.id ?? "")}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogTrigger asChild>
                        <div>
                            <Button className="hidden md:flex items-center gap-2" onClick={openAddDialog}>
                                <Plus className="h-4 w-4" />
                                Nueva
                            </Button>
                            <Button className="fixed bottom-7 right-2 z-50 md:hidden rounded-full p-3 shadow-lg" onClick={openAddDialog}>
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{dialogTitle}</DialogTitle>
                            <DialogDescription>
                                {dialogDescription}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Título de la tarea" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Descripción de la tarea" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Etiquetas</FormLabel>
                                            <FormControl>
                                                <TagsInput
                                                    placeholder="Agrega etiquetas a la tarea"
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    maxTags={8}
                                                    allowDuplicates={false}
                                                    separators={[',', 'Enter']}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dailyTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horas diarias: {field.value[0]} horas</FormLabel>
                                            <FormControl>
                                                <Slider max={24} min={1} step={1} defaultValue={[1]} onValueChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                        <DialogFooter>
                            <Button onClick={form.handleSubmit(onSubmit)}>{isEditOpen ? "Guardar" : "Agregar"}</Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto place-items-center sm:place-items-stretch">
                {
                    tasks.map((task) => (
                        <Card key={task.id} className={`p-4 w-70 sm:w-full ${task.status === TaskStatus.IN_PROGRESS ? "bg-task-in-progress text-task-in-progress-foreground" : ""}`}>
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex justify-between items-center">
                                        <h1 className="text-lg font-bold">{task.name}</h1>
                                        <Popover key={task.id}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline"><Ellipsis /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-sm"><span className="font-bold font-size-xs">Descripción:</span></p>
                                                    <p>{task.description}</p>
                                                    <p className="text-sm"><span className="font-bold font-size-xs">Tarea en días:</span> <Badge>{(task.elapsedTimeInMilliseconds / ((task.dailyTime ?? 1) * oneHourInMilliseconds)).toFixed(2)}</Badge></p>
                                                    <p className="text-sm"><span className="font-bold font-size-xs">Creación:</span> {task.createdAt}</p>
                                                    <p className="text-sm"><span className="font-bold font-size-xs">Actualización:</span> {task.updatedAt}</p>
                                                    <div>
                                                        <h1 className="text-sm"><span className="font-bold font-size-xs">Tareas en diarias:</span></h1>
                                                        <Separator className="my-2" />
                                                        <ScrollArea className="h-40 w-full">
                                                            {task.dailyTasks.map((dailyTask) => (
                                                                <React.Fragment key={dailyTask.taskDate.valueOf()}>
                                                                    <p className="text-sm">Fecha: {dayjs(dailyTask.taskDate).format('DD/MM/YYYY')}: <Badge>{formatTime(dailyTask.elapsedTime)}</Badge></p>
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
                                    <p className="text-sm"><span className="font-bold font-size-xs">Horas diarias:</span> <Badge>{task.dailyTime ?? "0"}</Badge></p>
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
                                    {
                                        task.status !== TaskStatus.COMPLETED && (
                                            <Button disabled={isPlaying && taskStopWatch.id !== task.id} onClick={async () => {
                                                if (taskStopWatch.id === task.id) {
                                                    await pause(task.id);
                                                } else {
                                                    await start(task.id);
                                                }
                                            }} variant={taskStopWatch.id === task.id ? "outline" : "default"}>{taskStopWatch.id === task.id ? <Pause /> : <Play />}</Button>
                                        )
                                    }
                                    <Button disabled={isPlaying && taskStopWatch.id === task.id} variant="outline" onClick={() => openEditDialog(task.id)}><Pencil />Editar</Button>
                                    <Button disabled={isPlaying && taskStopWatch.id === task.id} variant="destructive" onClick={() => {
                                        setIsAlertOpen(true);
                                        setTaskToDelete(task);
                                    }}><Minus />Eliminar</Button>
                                </div>
                            </CardAction>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}