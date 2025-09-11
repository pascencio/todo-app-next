"use client";

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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/app/components/tags-input";
import { Slider } from "@/components/ui/slider";
import { Task as TaskType } from "@/app/lib/app/task/task.usecase";

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

interface TaskFormProps {
    onAddTask: (data: TaskFormData) => Promise<void>;
    onUpdateTask: (id: string, data: TaskFormData) => Promise<void>;
}

interface TaskFormRef {
    openEditDialog: (task: TaskType) => void;
}

export interface TaskFormData {
    title: string;
    description: string;
    tags: string[];
    dailyTime: number;
}

const TaskForm = React.forwardRef<TaskFormRef, TaskFormProps>(({ onAddTask, onUpdateTask }, ref) => {
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
            tags: [],
            dailyTime: [],
        },
    })

    const handleUpdateTask = async (id: string, data: z.infer<typeof FormSchema>) => {
        await onUpdateTask(id, {
            title: data.title,
            description: data.description,
            tags: data.tags,
            dailyTime: data.dailyTime[0],
        });
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

    const openEditDialog = useCallback((task: TaskType) => {
        if (!task) {
            console.error("Task not found");
            return;
        }
        setEditTaskId(task.id);
        form.setValue("title", task.name);
        form.setValue("description", task.description);
        form.setValue("tags", task.tags);
        form.setValue("dailyTime", [task.dailyTime]);
        setDialogTitle("Editar Tarea");
        setDialogDescription("Edita la tarea seleccionada.");
        setIsEditOpen(true);
        setIsOpen(true);
    }, [form]);

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
                await onAddTask({
                    title: data.title,
                    description: data.description,
                    tags: data.tags,
                    dailyTime: data.dailyTime[0],
                });
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

    // Exponemos la función openEditDialog para que pueda ser llamada desde TaskItem
    React.useImperativeHandle(ref, () => ({
        openEditDialog
    }), [openEditDialog]);

    return (
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
    );
});

TaskForm.displayName = "TaskForm";

export default TaskForm;
export type { TaskFormProps, TaskFormRef };
