"use client";

import { GetTasksUserCase, UpdateTaskUserCase, Task as TaskType, DeleteTaskUserCase, AddTaskUserCase } from "@/app/lib/app/task/task.usecase";
import { TaskStatus } from "@/app/lib/app/task/task.entity";
import { DiContainer } from "@/app/lib/di/di";
import { Separator } from "@/components/ui/separator";
import { Stopwatch } from "@/app/lib/util/stopwatch";
import { sendNotification } from "@/app/lib/util/notification";
import dayjs from "dayjs";
import React, { useEffect, useState, useRef } from "react";
import TaskForm, { TaskFormData, TaskFormRef } from "./task-form";
import TaskList from "./task-list";

function useTasksUseCase() {
    return DiContainer.getInstance().get(GetTasksUserCase)
}

function useUpdateTaskUseCase() {
    return DiContainer.getInstance().get(UpdateTaskUserCase)
}

function useDeleteTaskUseCase() {
    return DiContainer.getInstance().get(DeleteTaskUserCase)
}
function useAddTaskUseCase() {
    return DiContainer.getInstance().get(AddTaskUserCase)
}

interface TaskStopWatch {
    id: string;
    clockTime: string;
    elapsedTime: number;
}

export default function Task() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [task, setTask] = useState<TaskType | null>(null);
    const [timeInterval, setTimeInterval] = useState<NodeJS.Timeout | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [stopwatch] = useState<Stopwatch>(() => new Stopwatch());
    const [taskStopWatch, setTaskStopWatch] = useState<TaskStopWatch>({
        id: "",
        clockTime: "00:00:00",
        elapsedTime: 0,
    });
    const taskFormRef = useRef<TaskFormRef>(null);

    const getTasksUseCase = useTasksUseCase();
    const updateTaskUseCase = useUpdateTaskUseCase();
    const deleteTaskUseCase = useDeleteTaskUseCase();
    const addTaskUseCase = useAddTaskUseCase();

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
        if (task.status === TaskStatus.IN_PROGRESS && startedTime > 0) {
            accumulatedTime += now.toDate().getTime() - task.startedTimeInMilliseconds; // TODO: Esta lógica debería estar en la clase de dominio
            startedTime = task.startedTimeInMilliseconds;
        }
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
        const accumulatedTime = task.elapsedTimeInMilliseconds;
        const startedTime = task.startedTimeInMilliseconds;
        const now = dayjs(new Date());
        const updatedAt = dayjs(task.updatedAtDate);
        if (now.isAfter(updatedAt, 'day')) {
            const elapsedTime = accumulatedTime - startedTime;
            const daylyTask = {
                taskDate: updatedAt.startOf('day').toDate(),
                elapsedTime: elapsedTime,
            };
            task.dailyTasks.push(daylyTask);
            stopwatch.reset();
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

    const handleEdit = (id: string) => {
        const task = tasks.find((task) => task.id === id);
        if (!task) {
            console.error("Task not found: ", id);
            return;
        }
        setTask(task);
        if (taskFormRef.current) {
            taskFormRef.current.openEditDialog(task);
        }
    }

    const handleDeleteTask = async (id: string) => {
        await deleteTaskUseCase.execute({ id });
        setTasks(tasks.filter((task) => task.id !== id));
    }

    const handleAddTask = async (data: TaskFormData) => {
        const addTaskOutput = await addTaskUseCase.execute({
            name: data.title,
            description: data.description,
            tags: data.tags,
            dailyTime: data.dailyTime
        });
        setTasks([...tasks, addTaskOutput as TaskType]);
        setTask(null);
    }

    const handleUpdateTask = async (id: string, data: TaskFormData) => {
        if (!task) {
            console.error("Task not found");
            return;
        }
        const updateTaskOutput = await updateTaskUseCase.execute({
            id,
            name: data.title,
            description: data.description,
            status: task.status,
            elapsedTime: 0,
            dailyTime: data.dailyTime,
            tags: data.tags,
            dailyTasks: task.dailyTasks
        });
        setTasks(tasks.map((task) => task.id === id ? updateTaskOutput as TaskType : task));
        setTask(null);
    }

    const handleCompleteTask = async (id: string) => {
        const taskItem = tasks.find((task) => task.id === id);
        if (!taskItem) {
            console.error("Task not found");
            return;
        }
        taskItem.dailyTasks.push({
            taskDate: dayjs().startOf('day').toDate(),
            elapsedTime: taskItem.elapsedTimeInMilliseconds
        });
        setTaskStopWatch({
            id: "",
            clockTime: "00:00:00",
            elapsedTime: 0,
        });
        setIsPlaying(false);
        if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
        }
        const updateTaskOutput = await updateTaskUseCase.execute({
            id,
            name: taskItem.name,
            description: taskItem.description,
            status: TaskStatus.COMPLETED,
            elapsedTime: 0,
            dailyTime: taskItem.dailyTime,
            tags: taskItem.tags,
            dailyTasks: taskItem.dailyTasks
        });
        console.log("updateTaskOutput", updateTaskOutput);
        setTasks(tasks.map((task) => task.id === id ? updateTaskOutput as unknown as TaskType : task));
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Lista de Tareas</h1>
            <Separator className="my-4" />
            <div className="flex justify-end mb-4">
                <TaskForm
                    ref={taskFormRef}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                />
            </div>
            <TaskList
                tasks={tasks}
                isPlaying={isPlaying}
                taskStopWatch={taskStopWatch}
                onStart={start}
                onPause={pause}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
            />
        </div>
    );
}