import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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

function Column({
  column,
  tasks,
  activeId,
}: {
  column: ColumnType;
  tasks: Task[];
  activeId: string | null;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div className="flex lg:min-w-60 xl:min-w-80 max-w-80 flex-col rounded-lg bg-neutral-800 p-4">
      <h2 className="mb-4 font-semibold text-neutral-100">{column.title}</h2>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isDragging={task.id === activeId}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default Column;
