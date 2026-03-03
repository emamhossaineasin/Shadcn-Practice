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
import axios, { AxiosError } from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Department {
  department_id: number;
  department_name: string;
}

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/getDepartment");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError("Failed to fetch departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (error) {
      window.alert(error);
      setError("");
    }
  }, [error]);

  const handleDelete = async (departmentId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.delete(`/deleteDepartment/${departmentId}`);
      await fetchDepartments();
    } catch (err: unknown) {
      console.error("Failed to delete department:", err);
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message || "Failed to delete department.",
      );
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      {loading ? (
        <p className="text-xl"> Loading departments... </p>
      ) : (
        <div className="w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Departments</h2>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/department/add")}
            >
              <Plus size={16} />
              Add Department
            </Button>
          </div>

          <Table>
            <TableCaption>
              Click a department to view its students.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Department ID</TableHead>
                <TableHead className="w-60">Department Name</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept: Department) => (
                <TableRow
                  key={dept.department_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    navigate(`/department/${dept.department_id}/students`)
                  }
                >
                  <TableCell className="font-medium">
                    {dept.department_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {dept.department_name}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-end gap-5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/department/edit/${dept.department_id}`);
                        }}
                      >
                        <Pencil size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(dept.department_id);
                        }}
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
      )}
    </div>
  );
};

export default Departments;
