# Todo App Next.js

Una aplicación de gestión de tareas construida con Next.js, TypeScript y arquitectura hexagonal con inyección de dependencias.

## 🚀 Características

- ✅ **Gestión de tareas** - Crear, leer, actualizar y eliminar tareas
- 🗄️ **Persistencia local** - Almacenamiento en IndexedDB del navegador
- 🏗️ **Arquitectura hexagonal** - Separación clara entre dominio, aplicación e infraestructura
- 💉 **Inyección de dependencias** - Contenedor DI personalizado tipo Java
- 🎨 **UI moderna** - Componentes con shadcn/ui y Tailwind CSS
- 📊 **Tabla interactiva** - Visualización de tareas con TanStack Table
- ⚡ **Performance** - Optimizado con Turbopack

## 🛠️ Tecnologías

- **Framework**: Next.js 15.5.0 con App Router
- **Lenguaje**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Iconos**: Lucide React
- **Tabla**: TanStack React Table
- **Base de datos**: IndexedDB (idb)
- **Arquitectura**: Hexagonal + DDD

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd todo-app-next
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🚀 Despliegue local (Puerto 8080)

Para ejecutar la aplicación en el puerto 8080:

1. **Construir la aplicación**
   ```bash
   npm run build
   ```

2. **Iniciar en puerto 8080**
   ```bash
   npm start -- -p 8080
   ```

3. **Abrir en el navegador**
   ```
   http://localhost:8080
   ```

## 🎯 Cómo usar la aplicación

### Gestión de Tareas

1. **Ver tareas**: Al abrir la aplicación, verás una tabla con todas las tareas
2. **Agregar tarea**: Haz clic en el botón "Add Task" para crear una nueva tarea
3. **Persistencia**: Las tareas se guardan automáticamente en IndexedDB

### Estados de las tareas

- `PENDING` - Tarea pendiente
- `IN_PROGRESS` - Tarea en progreso  
- `COMPLETED` - Tarea completada

## 🏗️ Arquitectura

### Estructura del proyecto

```
src/
├── app/
│   ├── components/          # Componentes React
│   │   ├── task.tsx        # Componente principal de tareas
│   │   └── ...
│   ├── lib/
│   │   ├── app/            # Capa de aplicación
│   │   │   └── task/       # Casos de uso de tareas
│   │   ├── di/             # Inyección de dependencias
│   │   └── ...
│   └── ...
```

### Capas de la arquitectura

1. **Dominio** (`task.entity.ts`)
   - Entidades y reglas de negocio
   - `TaskEntity`, `TaskStatus`

2. **Aplicación** (`task.usecase.ts`)
   - Casos de uso
   - `AddTaskUserCase`, `GetTasksUserCase`

3. **Infraestructura** (`task.indexeddb.ts`)
   - Implementaciones concretas
   - Persistencia en IndexedDB

4. **Presentación** (`task.tsx`)
   - Componentes React
   - Interfaz de usuario

### Inyección de Dependencias

El sistema DI funciona similar a Spring/Java:

```typescript
// Registro (solo en di.ts)
container.register(INTERNAL_ACCESS, TaskOutput, () => new TaskIndexedDB())

// Uso en componentes
const useCase = DiContainer.getInstance().get(GetTasksUserCase);
```

## 🔧 Scripts disponibles

```bash
# Desarrollo con Turbopack
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. El despliegue se hace automáticamente

### Otros proveedores

```bash
npm run build
npm start
```

## 📝 Desarrollo

### Agregar nuevas funcionalidades

1. **Crear entidad** en `lib/app/task/`
2. **Implementar caso de uso** en `task.usecase.ts`
3. **Registrar en DI** en `lib/di/di.ts`
4. **Usar en componente** con hooks personalizados

### Cambiar persistencia

Para cambiar de IndexedDB a otra base de datos:

1. Crear nueva implementación de `TaskOutput`
2. Actualizar registro en `di.ts`
3. ¡Listo! El resto de la aplicación sigue igual

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
