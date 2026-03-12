import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import Column from "./Column";
import TaskCard from "./TaskCard";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
}

interface ColumnType {
  id: string;
  title: string;
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Task 1",
    description: "Description for Task 1",
    status: "todo",
  },
  {
    id: "2",
    title: "Task 2",
    description: "Description for Task 2",
    status: "in-progress",
  },
  {
    id: "3",
    title: "Task 3",
    description: "Description for Task 3",
    status: "done",
  },
  {
    id: "4",
    title: "Task 4",
    description: "Description for Task 4",
    status: "in-progress",
  },
];

const COLUMNS: ColumnType[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const Kanban = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);

    const task = tasks.find((t) => t.id === id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setTasks((tasks) => {
      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return tasks;

      // dropped on a column
      if (COLUMNS.some((col) => col.id === overId)) {
        return tasks.map((task) =>
          task.id === activeId
            ? { ...task, status: overId as Task["status"] }
            : task,
        );
      }

      // dropped on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return tasks;

      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);

      const newTasks = [...tasks];

      // move to new column if needed
      newTasks[oldIndex] = {
        ...newTasks[oldIndex],
        status: overTask.status,
      };

      return arrayMove(newTasks, oldIndex, newIndex);
    });
  }

  return (
    <div className="p-4">
      <div className="flex gap-8">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.status === column.id)}
              activeId={activeId}
            />
          ))}
          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} isDragging={false} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Kanban;
