"use client"
import { AddTaskUserCase, DeleteTaskUserCase, GetTasksUserCase, UpdateTaskUserCase } from "../app/task/task.usecase";
import { getAddTaskUseCaseFactory, getDeleteTaskUseCaseFactory, getTasksUseCasesFactory, getUpdateTaskUseCaseFactory } from "../app/task/task.di";
import { TaskIndexedDB } from "../app/task/task.indexeddb";
import { TaskOutput } from "../app/task/task.output";
import { TaskEntity, TaskStatus } from "../app/task/task.entity";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type AbstractComponent<T = object> = Function & { prototype: T };
type FactoryFunction<T> = (container: DiContainer) => T;

// Símbolo privado para controlar acceso al método register
const INTERNAL_ACCESS = Symbol('internal_access');

export class DiContainer {
    private static instance: DiContainer;
    private factories: Map<string, FactoryFunction<unknown>>;
    private instances: Map<string, unknown>;

    private constructor() {
        this.factories = new Map();
        this.instances = new Map();
    }

    register<T>(accessKey: typeof INTERNAL_ACCESS, component: AbstractComponent<T>, factory: FactoryFunction<T>): DiContainer {
        if (accessKey !== INTERNAL_ACCESS) {
            throw new Error('register method can only be called from di.ts');
        }
        const className = component.name;
        this.factories.set(className, factory as FactoryFunction<unknown>);
        return this;
    }

    public get<T>(component: AbstractComponent<T>): T {
        const className = component.name;
        
        // Si ya existe la instancia, devolverla (singleton)
        if (this.instances.has(className)) {
            return this.instances.get(className) as T;
        }
        
        // Si no existe, crearla usando la factory
        if (!this.factories.has(className)) {
            const availableComponents = Array.from(this.factories.keys()).join(', ');
            throw new Error(`Component ${className} not found. Available components: ${availableComponents}`);
        }
        
        const factory = this.factories.get(className)!;
        const instance = factory(this);
        this.instances.set(className, instance);
        return instance as T;
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
                    updateTask: async (): Promise<TaskEntity> => {  
                        return {
                            id: "",
                            name: "",
                            description: "",
                            status: TaskStatus.PENDING,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            elapsedTime: 0,
                            startedAt: 0,
                            dailyTime: 0,
                            tags: []
                        }
                    }
                } satisfies TaskOutput;
            }
            return new TaskIndexedDB();
        })
        .register(INTERNAL_ACCESS, GetTasksUserCase, getTasksUseCasesFactory)
        .register(INTERNAL_ACCESS, AddTaskUserCase, getAddTaskUseCaseFactory)
        .register(INTERNAL_ACCESS, DeleteTaskUserCase, getDeleteTaskUseCaseFactory)
        .register(INTERNAL_ACCESS, UpdateTaskUserCase, getUpdateTaskUseCaseFactory);
}

// Se ejecuta una vez al importar el módulo
createContainer();