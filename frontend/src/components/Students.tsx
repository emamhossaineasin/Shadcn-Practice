import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStdModal from "./AddStdModal";

interface Student {
  student_id: number;
  student_name: string;
  department_name: string;
}

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const Students = () => {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/getStdWithDpt");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
    <div className="w-full flex items-center justify-center h-full overflow-auto">
      {loading ? (
        <p className="text-xl"> Loading students... </p>
      ) : (
        <div className="w-5xl h-auto flex flex-col mt-30 p-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Students</h2>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              Add Student
            </Button>
          </div>
          <div className="">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">Student ID</TableHead>
                  <TableHead className="w-25">Student Name</TableHead>
                  <TableHead className="w-25">Department</TableHead>
                  <TableHead className="w-25 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {student.student_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.student_name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.department_name}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-end gap-5">
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
          </div>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          {showModal && <AddStdModal onClose={() => setShowModal(false)} />}
        </div>
      )}
    </div>
  );
};

export default Students;
