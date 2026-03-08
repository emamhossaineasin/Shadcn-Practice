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
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const departmentSchema = z.object({
  department_name: z.string().trim().min(1, "Department name is required."),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface AddDeptModalProps {
  onClose: () => void;
  departmentId?: number;
  onSaved?: () => void;
}

const AddDeptModal = ({
  onClose,
  departmentId,
  onSaved,
}: AddDeptModalProps) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const isEditMode = typeof departmentId === "number";

  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

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
    if (!isEditMode) {
      return;
    }

    const fetchDepartment = async () => {
      try {
        const res = await api.get(`/getDepartmentById?id=${departmentId}`);
        setValue("department_name", res.data.department_name);
      } catch (err) {
        console.error("Failed to fetch department:", err);
        setServerError("Failed to load department data.");
      }
    };

    fetchDepartment();
  }, [departmentId, isEditMode, setValue]);

  const onSubmit = async (values: DepartmentFormValues) => {
    setLoading(true);
    setServerError("");
    try {
      if (isEditMode) {
        await api.put(`/updateDepartment/${departmentId}`, {
          department_name: values.department_name.trim(),
        });
      } else {
        await api.post("/postDepartment", {
          department_name: values.department_name.trim(),
        });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      if (isEditMode) {
        console.error("Failed to update department:", err);
        setServerError("Failed to update department. Please try again.");
      } else {
        console.error("Failed to save department:", err);
        setServerError("Failed to save department. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={closeModal}
      className="fixed inset-0  z-50 bg-opacity-30 backdrop-brightness-50 flex justify-center items-center"
    >
      <div className="w-3xl">
        <Card>
          <button
            onClick={onClose}
            className="place-self-end pr-4 cursor-pointer"
          >
            <X size={30} />
          </button>
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
                {isEditMode
                  ? loading
                    ? "Updating..."
                    : "Update Department"
                  : loading
                    ? "Adding..."
                    : "Add Department"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDeptModal;
