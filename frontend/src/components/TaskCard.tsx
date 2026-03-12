import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
}

function TaskCard({ task, isDragging }: { task: Task; isDragging: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
    });

  //   const style = transform
  //     ? {
  //         transform: `translate(${transform.x}px, ${transform.y}px)`,
  //         transition,
  //       }
  //     : undefined;

  //   const style = transform
  //     ? {
  //         transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  //         transition,
  //       }
  //     : undefined;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="cursor-grab rounded-lg bg-neutral-700 p-4 shadow-sm hover:shadow-md"
    >
      <h3 className="font-medium text-neutral-100">{task.title}</h3>
      <p className="mt-2 text-sm text-neutral-400">{task.description}</p>
    </div>
  );
}

export default TaskCard;
