import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import axios, { AxiosError } from "axios";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import AddDeptModal from "./AddDeptModal";
import StdofDept from "./StdofDept";
import Tbl from "./Tbl";

interface Department {
  department_id: number;
  department_name: string;
}

const columns: ColumnDef<Department>[] = [
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
    accessorKey: "department_id",
    header: "ID",
  },
  {
    accessorKey: "department_name",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          <span>Department Name</span>
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

function Dept() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/getDepartment");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = () => {
    setEditingDepartmentId(null);
    setShowModal(true);
  };

  const handleEdit = () => {
    setEditingDepartmentId(selectedDepartment?.department_id || null);
    setShowModal(true);
  };

  useEffect(() => {
    if (deleteError) {
      window.alert(deleteError);
      setDeleteError("");
    }
  }, [deleteError]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.delete(
        `/deleteDepartment/${selectedDepartment?.department_id}`,
      );
      await fetchDepartments();
    } catch (err: unknown) {
      console.error("Failed to delete department:", err);
      const axiosError = err as AxiosError<{ message?: string }>;
      setDeleteError(
        axiosError.response?.data?.message || "Failed to delete department.",
      );
    }
  };

  return (
    <div className="w-full  flex justify-center p-5">
      {loading ? (
        <p className="text-xl"> Loading departments... </p>
      ) : (
        <div className="container ">
          <Tbl
            columns={columns}
            data={departments}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowSelect={setSelectedDepartment}
            filter="department"
          />
          {selectedDepartment && (
            <div>
              <p className="text-lg text-center my-2">
                Department of {selectedDepartment.department_name}
              </p>
              <StdofDept departmentId={selectedDepartment.department_id} />
            </div>
          )}
          {error && (
            <p className="text-lg text-red-500 mt-3 text-center">{error}</p>
          )}
          {showModal && (
            <AddDeptModal
              departmentId={editingDepartmentId ?? undefined}
              onSaved={fetchDepartments}
              onClose={() => {
                setShowModal(false);
                setEditingDepartmentId(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Dept;
