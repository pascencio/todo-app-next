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
import { useEffect, useState } from "react";
import { Plus } from "lucide-react"

function useTasksUseCase() {
    return DiContainer.getInstance().get(GetTasksUserCase)
}

function useAddTaskUseCase() {
    return DiContainer.getInstance().get(AddTaskUserCase)
}

function useDeleteTaskUseCase() {
    return DiContainer.getInstance().get(DeleteTaskUserCase)
}


export default function Task() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
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

    const handleAddTask = async () => {
        const task = await addTaskUseCase.execute({
            name: "Task 1",
            description: "Description 1",
        });
        setTasks([...tasks, task as TaskType]);
        setIsOpen(false);
    }

    const handleDeleteTask = async (id: string) => {
        await deleteTaskUseCase.execute({ id });
        setTasks(tasks.filter((task) => task.id !== id));
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Task</h1>
            <div className="flex justify-end mb-4">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus /> Add Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={handleAddTask}>Add Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto">
                {
                    tasks.map((task) => (
                        <Card key={task.id} className="p-4">
                            <CardHeader>
                                <CardTitle>{task.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{task.description}</p>
                            </CardContent>
                            <CardFooter>
                                <p>{task.status}</p>
                            </CardFooter>
                            <CardAction className="w-full">
                                <div className="flex gap-2 justify-end">
                                    <Button>Edit</Button>
                                    <Button onClick={() => handleDeleteTask(task.id)}>Delete</Button>
                                </div>
                            </CardAction>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}