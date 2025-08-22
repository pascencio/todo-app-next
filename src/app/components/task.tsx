"use client";

import { TaskEntity, TaskStatus } from "@/app/lib/app/task/task.entity";
import { AddTaskUserCase, GetTasksUserCase } from "@/app/lib/app/task/task.usecase";
import { DiContainer } from "@/app/lib/di/di";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react"

function useTasksUseCase() {
    return useMemo(() => DiContainer.getInstance().get(GetTasksUserCase), []);
}

function useAddTaskUseCase() {
    return useMemo(() => DiContainer.getInstance().get(AddTaskUserCase), []);
}

export const columns: ColumnDef<TaskEntity>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
    },
    {
        accessorKey: "updatedAt",
        header: "Updated At",
    },
    {
        accessorKey: "status",
        header: "Status",
    }
]

export default function Task() {
    const [tasks, setTasks] = useState<TaskEntity[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const addTaskUseCase = useAddTaskUseCase();
    const getTasksUseCase = useTasksUseCase();
    const table = useReactTable({
        data: tasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        const fetchTasks = async () => {
            const tasks = await getTasksUseCase.execute();
            setTasks(tasks);
        };

        fetchTasks();
    });

    const handleAddTask = async () => {
        const task = await addTaskUseCase.execute({
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            name: "Task 1",
            description: "Description 1",
            status: TaskStatus.PENDING
        });
        setTasks([...tasks, task]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsOpen(false);
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
            <div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}