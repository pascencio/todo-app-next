"use client";

import { AddTaskUserCase, DeleteTaskUserCase, GetTasksUserCase, UpdateTaskUserCase, Task as TaskType } from "@/app/lib/app/task/task.usecase";
import { TaskStatus } from "@/app/lib/app/task/task.entity";
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
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react";
import { Minus, Pencil, Plus } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
        message: "Title is required.",
    }),
    description: z.string().min(1, {
        message: "Description is required.",
    }),
    status: z.enum(TaskStatus).optional(),
})


export default function Task() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTaskId, setEditTaskId] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogDescription, setDialogDescription] = useState<string>("");

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            description: "",
            status: undefined,
        },
    })
    const addTaskUseCase = useAddTaskUseCase();
    const getTasksUseCase = useTasksUseCase();
    const deleteTaskUseCase = useDeleteTaskUseCase();
    const updateTaskUseCase = useUpdateTaskUseCase();
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { tasks } = await getTasksUseCase.execute();
                setTasks(tasks as TaskType[]);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);
            }
        };

        fetchTasks();
    }, [getTasksUseCase]);

    const handleDeleteTask = async (id: string) => {
        await deleteTaskUseCase.execute({ id });
        setTasks(tasks.filter((task) => task.id !== id));
    }

    const handleUpdateTask = async (id: string, data: z.infer<typeof FormSchema>) => {
        const status = data.status || TaskStatus.PENDING;
        await updateTaskUseCase.execute({ id, name: data.title, description: data.description, status });
        setTasks(tasks.map((task) => task.id === id ? { ...task, name: data.title, description: data.description, status } : task));
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
        console.log("openEditDialog", id);
        const task = tasks.find((task) => task.id === id);
        if (!task) {
            console.error("Task not found");
            // TODO: Show error message
            return;
        }
        console.log("task", task);
        setEditTaskId(id);
        form.setValue("title", task.name);
        form.setValue("description", task?.description || "");
        form.setValue("status", task.status);
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
            if (isEditOpen) {
                await handleUpdateTask(editTaskId, data);
            } else {
                const task = await addTaskUseCase.execute({
                    name: data.title,
                    description: data.description,
                    status: data.status, // Puede ser undefined, AddTaskUserCase manejará el fallback
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
                                {
                                    isEditOpen ? (
                                        <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <FormControl>
                                                    <Select 
                                                        value={field.value} 
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {
                                                                Object.values(TaskStatus).map((status) => (
                                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />   
                                    ) : (
                                        <></>
                                    )
                                }
                            </div>
                        </Form>
                        <DialogFooter>
                            <Button onClick={form.handleSubmit(onSubmit)}>{isEditOpen ? "Editar" : "Agregar"}</Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto place-items-center sm:place-items-stretch">
                {
                    tasks.map((task) => (
                        <Card key={task.id} className="p-4 w-70 sm:w-full">
                            <CardHeader>
                                <CardTitle>{task.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="pb-2">{task.description}</p>
                                <p className="text-sm"><span className="font-bold font-size-xs">Created:</span> {task.createdAt}</p>
                                <p className="text-sm"><span className="font-bold font-size-xs">Updated:</span> {task.updatedAt}</p>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm"><span className="font-bold">Status:</span> {task.status}</p>
                            </CardFooter>
                            <CardAction className="w-full">
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => openEditDialog(task.id)}><Pencil />Editar</Button>
                                    <Button variant="destructive" onClick={() => handleDeleteTask(task.id)}><Minus />Eliminar</Button>
                                </div>
                            </CardAction>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}