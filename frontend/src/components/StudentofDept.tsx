import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const [students, setStudents] = useState<Student[]>([]);
  const [departmentName, setDepartmentName] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
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
  };
  useEffect(() => {
    if (departmentId) {
      fetchStudents();
    }
  }, [departmentId]);
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
    <div className="w-full flex justify-center">
      {loading ? (
        <p className="text-xl"> Loading students... </p>
      ) : (
        <div className="w-full">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate("/department")}
          >
            <ArrowLeft size={16} />
            Back to Departments
          </Button>
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
                <TableHead className="w-25">Actions</TableHead>
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
                    <div className="flex items-center gap-5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 cursor-pointer"
                        onClick={() =>
                          navigate(`/student/edit/${student.student_id}`)
                        }
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
        </div>
      )}
    </div>
  );
};

export default StudentofDept;
