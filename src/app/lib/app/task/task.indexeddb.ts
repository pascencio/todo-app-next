"use client"
import { TaskEntity } from "@/app/lib/app/task/task.entity";
import { TaskOutput } from "@/app/lib/app/task/task.output";
import { IDBPDatabase, openDB } from "idb";

export class TaskIndexedDB implements TaskOutput {
    private db: IDBPDatabase<TaskEntity> | null = null;
    private dbPromise: Promise<IDBPDatabase<TaskEntity>>;

    constructor() {
        this.dbPromise = this.initDB();
    }

    private async initDB(): Promise<IDBPDatabase<TaskEntity>> {
        if (this.db) return this.db;
        
        this.db = await openDB<TaskEntity>("task-db", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("tasks")) {
                    db.createObjectStore("tasks", { keyPath: "id" });
                }
            }
        });
        return this.db;
    }

    private async getDB(): Promise<IDBPDatabase<TaskEntity>> {
        return await this.dbPromise;
    }

    async addTask(task: TaskEntity): Promise<TaskEntity> {
        const db = await this.getDB();
        await db.add("tasks", {
            ...task
        });
        return task;
    }

    async getTasks(): Promise<TaskEntity[]> {
        const db = await this.getDB();
        return await db.getAll("tasks");
    }

    async getTaskById(id: string): Promise<TaskEntity | null> {
        const db = await this.getDB();
        return await db.get("tasks", id) || null;
    }

    async deleteTask(id: string): Promise<void> {
        const db = await this.getDB();
        await db.delete("tasks", id);
    }

    async updateTask(id: string, task: TaskEntity): Promise<void> {
        const db = await this.getDB();
        await db.put("tasks", {
            ...task,
            id
        });
    }
}