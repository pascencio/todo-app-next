"use client"
import { AddTaskUserCase, GetTasksUserCase } from "../app/task/task.usecase";
import { getAddTaskUseCaseFactory, getTasksUseCasesFactory } from "../app/task/task.di";
import { TaskIndexedDB } from "../app/task/task.indexeddb";
import { TaskOutput } from "../app/task/task.output";
import { TaskEntity } from "../app/task/task.entity";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type AbstractComponent<T = object> = Function & { prototype: T };
type FactoryFunction<T> = (container: DiContainer) => T;

// Símbolo privado para controlar acceso al método register
const INTERNAL_ACCESS = Symbol('internal_access');

export class DiContainer {
    private static instance: DiContainer;
    private container: Map<string, unknown>;

    private constructor() {
        this.container = new Map();
    }

    register<T>(accessKey: typeof INTERNAL_ACCESS, component: AbstractComponent<T>, factory: FactoryFunction<T>): DiContainer {
        if (accessKey !== INTERNAL_ACCESS) {
            throw new Error('register method can only be called from di.ts');
        }
        const className = component.name;
        this.container.set(className, factory(this));
        return this;
    }

    public get<T>(component: AbstractComponent<T>): T {
        const className = component.name;
        if (!this.container.has(className)) {
            const availableComponents = Array.from(this.container.keys()).join(', ');
            throw new Error(`Component ${className} not found. Available components: ${availableComponents}`);
        }
        return this.container.get(className) as T;
    }

    public static getInstance(): DiContainer {
        if (!DiContainer.instance) {
            DiContainer.instance = new DiContainer();
        }
        return DiContainer.instance;
    }
}

function createContainer(): void {
    DiContainer
        .getInstance()
        .register(INTERNAL_ACCESS, TaskOutput, () => {
            // Lazy loading: solo crear TaskIndexedDB cuando realmente se necesite
            if (typeof window === 'undefined') {
                // En el servidor, devolver un objeto mock que no haga nada
                return {
                    addTask: async (task: TaskEntity) => task,
                    getTasks: async (): Promise<TaskEntity[]> => [],
                    getTaskById: async (): Promise<TaskEntity | null> => null,
                    deleteTask: async (): Promise<void> => {},
                    updateTask: async (): Promise<void> => {}
                } satisfies TaskOutput;
            }
            return new TaskIndexedDB();
        })
        .register(INTERNAL_ACCESS, GetTasksUserCase, getTasksUseCasesFactory)
        .register(INTERNAL_ACCESS, AddTaskUserCase, getAddTaskUseCaseFactory);
}

// Se ejecuta una vez al importar el módulo
createContainer();