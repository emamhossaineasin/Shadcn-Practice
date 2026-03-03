import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const departmentSchema = z.object({
  department_name: z.string().trim().min(1, "Department name is required."),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const AddDepartment = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const isEditMode = Boolean(departmentId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      department_name: "",
    },
  });

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!departmentId) {
        return;
      }

      try {
        const res = await api.get(`/getDepartmentById?id=${departmentId}`);
        setValue("department_name", res.data.department_name);
      } catch (err) {
        console.error("Failed to fetch department:", err);
        setServerError("Failed to load department data.");
      }
    };

    fetchDepartment();
  }, [departmentId, setValue]);

  const onSubmit = async (values: DepartmentFormValues) => {
    setLoading(true);
    setServerError("");
    try {
      if (isEditMode && departmentId) {
        await api.put(`/updateDepartment/${departmentId}`, {
          department_name: values.department_name.trim(),
        });
      } else {
        await api.post("/postDepartment", {
          department_name: values.department_name.trim(),
        });
      }
      navigate("/department");
    } catch (err) {
      console.error("Failed to save department:", err);
      setServerError("Failed to save department. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-5xl">
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => navigate("/department")}
      >
        <ArrowLeft size={16} />
        Back to Departments
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Update Department" : "Add New Department"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the department name."
              : "Enter the name of the new department."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input
                id="departmentName"
                placeholder="e.g. Computer Science"
                {...register("department_name")}
              />
              {errors.department_name && (
                <p className="text-sm text-red-500">
                  {errors.department_name.message}
                </p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                  ? "Update Department"
                  : "Add Department"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDepartment;
