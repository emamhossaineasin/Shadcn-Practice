import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddStdModal from "./AddStdModal";
import UpdateStdModal from "./UpdateStdModal";

interface Student {
  student_id: number;
  student_name: string;
}
interface Department {
  department_id: number;
  department_name: string;
}

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const StudentofDept = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [departmentName, setDepartmentName] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/getStdOfDepartment?id=${departmentId}`);
      setStudents(res.data);
      const deptRes = await api.get(`/getDepartmentById?id=${departmentId}`);
      setDepartmentName(deptRes.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);
  useEffect(() => {
    if (departmentId) {
      fetchStudents();
    }
  }, [departmentId, fetchStudents]);
  const handleDelete = async (studentId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.delete(`/deleteStudent/${studentId}`);
      await fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student.");
    }
  };

  return (
    <div className="w-full flex justify-center p-5">
      {loading ? (
        <p className="text-xl"> Loading students... </p>
      ) : (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate("/department")}
            >
              <ArrowLeft size={16} />
              Back to Departments
            </Button>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setEditingStudentId(null);
                setShowModal(true);
              }}
            >
              <Plus size={16} />
              Add Student
            </Button>
          </div>
          {loading && (
            <p className="text-sm text-muted-foreground mb-3">
              Loading students...
            </p>
          )}
          <Table>
            <TableCaption className="caption-top">
              {students.length === 0
                ? `No students found for ${departmentName?.department_name || departmentId} department.`
                : `Students of ${departmentName?.department_name || departmentId} Department`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">Student ID</TableHead>
                <TableHead className="w-25">Student Name</TableHead>
                <TableHead className="w-25 text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: Student) => (
                <TableRow key={student.student_id}>
                  <TableCell className="font-medium">
                    {student.student_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.student_name}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-end gap-5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 cursor-pointer"
                        onClick={() => {
                          setEditingStudentId(student.student_id);
                          setShowModal(true);
                        }}
                      >
                        <Pencil size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1 cursor-pointer"
                        onClick={() => handleDelete(student.student_id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          {showModal &&
            (editingStudentId === null ? (
              <AddStdModal
                initialDepartmentId={
                  departmentId ? Number(departmentId) : undefined
                }
                onSaved={fetchStudents}
                onClose={() => {
                  setShowModal(false);
                  setEditingStudentId(null);
                }}
              />
            ) : (
              <UpdateStdModal
                studentId={editingStudentId}
                onSaved={fetchStudents}
                onClose={() => {
                  setShowModal(false);
                  setEditingStudentId(null);
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default StudentofDept;
