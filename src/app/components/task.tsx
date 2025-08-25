"use client";

import { AddTaskUserCase, DeleteTaskUserCase, GetTasksUserCase, Task as TaskType } from "@/app/lib/app/task/task.usecase";
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

function useTasksUseCase() {
    return DiContainer.getInstance().get(GetTasksUserCase)
}

function useAddTaskUseCase() {
    return DiContainer.getInstance().get(AddTaskUserCase)
}

function useDeleteTaskUseCase() {
    return DiContainer.getInstance().get(DeleteTaskUserCase)
}

const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }),
    description: z.string().min(1, {
        message: "Description is required.",
    }),
})


export default function Task() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    })
    const addTaskUseCase = useAddTaskUseCase();
    const getTasksUseCase = useTasksUseCase();
    const deleteTaskUseCase = useDeleteTaskUseCase();
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

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const task = await addTaskUseCase.execute({
                name: data.title,
                description: data.description,
            });
            setTasks([...tasks, task as TaskType]);
            form.reset();
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Lista de Tareas</h1>
            <div className="flex justify-end mb-4">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <div>
                            <Button className="hidden md:flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva
                            </Button>
                            <Button className="fixed bottom-7 right-2 z-50 md:hidden rounded-full p-3 shadow-lg">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Tarea</DialogTitle>
                            <DialogDescription>
                                Agrega una nueva tarea a tu lista de tareas.
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
                            </div>
                        </Form>
                        <DialogFooter>
                            <Button onClick={form.handleSubmit(onSubmit)}>Agregar</Button>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
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
                                    <Button variant="outline"><Pencil />Editar</Button>
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