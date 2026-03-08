import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import AddStdModal from "./AddStdModal";
import Tbl from "./Tbl";

interface Student {
  student_id: number;
  student_name: string;
  department_name: string;
}

const columns: ColumnDef<Student>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="sr-only">Select</span>,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "ID",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          <span>Student ID</span>
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "student_name",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          <span>Student Name</span>
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

function StdofDept({ departmentId }: { departmentId: number }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/getStdOfDepartment?id=${departmentId}`);
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [departmentId]);

  const handleAdd = () => {
    setEditingStudentId(null);
    setShowModal(true);
  };

  const handleEdit = () => {
    setEditingStudentId(selectedStudent?.student_id || null);
    setShowModal(true);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.delete(`/deleteStudent/${selectedStudent?.student_id}`);
      await fetchStudents();
    } catch (err: unknown) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student.");
    }
  };

  return (
    <div className="w-full flex justify-center">
      {loading ? (
        <p className="text-xl"> Loading students... </p>
      ) : (
        <div className="container">
          <Tbl
            columns={columns}
            data={students}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowSelect={setSelectedStudent}
            filter="student"
          />
          {error && (
            <p className="text-lg text-red-500 mt-3 text-center">{error}</p>
          )}
          {showModal && (
            <AddStdModal
              studentId={editingStudentId ?? undefined}
              departmentId={departmentId ? Number(departmentId) : undefined}
              onSaved={fetchStudents}
              onClose={() => {
                setShowModal(false);
                setEditingStudentId(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default StdofDept;
