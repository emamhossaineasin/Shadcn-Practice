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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface Department {
  department_id: number;
  department_name: string;
}

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const studentSchema = z.object({
  student_id: z
    .string()
    .trim()
    .min(1, "Student ID is required.")
    .regex(/^\d+$/, "Student ID must be a valid number."),
  student_name: z.string().trim().min(1, "Student name is required."),
  department_id: z.string().min(1, "Department is required."),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface UpdateStdModalProps {
  onClose: () => void;
  studentId: number;
  onSaved?: () => void;
}

const UpdateStdModal = ({
  onClose,
  studentId,
  onSaved,
}: UpdateStdModalProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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
    control,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      student_id: "",
      student_name: "",
      department_id: "",
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/getDepartment");
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/getStudentById?id=${studentId}`);
        setValue("student_id", String(res.data.student_id));
        setValue("student_name", res.data.student_name);
        setValue("department_id", String(res.data.department_id));
      } catch (err) {
        console.error("Failed to fetch student:", err);
        setServerError("Failed to load student data.");
      }
    };

    fetchStudent();
  }, [setValue, studentId]);

  const onSubmit = async (values: StudentFormValues) => {
    setLoading(true);
    setServerError("");
    try {
      await api.put(`/updateStudent/${studentId}`, {
        student_name: values.student_name.trim(),
        department_id: Number(values.department_id),
      });

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to update student:", err);
      setServerError("Failed to update student. Please try again.");
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
      <div className="w-4xl mt-10 flex flex-col border rounded-2xl">
        <Card>
          <button
            onClick={onClose}
            className="place-self-end pr-4 cursor-pointer"
          >
            <X size={30} />
          </button>

          <CardHeader>
            <CardTitle>Update Student</CardTitle>
            <CardDescription>Update the student details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="number"
                  placeholder="Enter student ID"
                  {...register("student_id")}
                  disabled
                />
                {errors.student_id && (
                  <p className="text-sm text-red-500">
                    {errors.student_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  {...register("student_name")}
                />
                {errors.student_name && (
                  <p className="text-sm text-red-500">
                    {errors.student_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Controller
                  control={control}
                  name="department_id"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem
                            key={dept.department_id}
                            value={String(dept.department_id)}
                          >
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department_id && (
                  <p className="text-sm text-red-500">
                    {errors.department_id.message}
                  </p>
                )}
              </div>
              {serverError && (
                <p className="text-sm text-red-500">{serverError}</p>
              )}
              <Button
                type="submit"
                className="w-full  bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Student"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateStdModal;
