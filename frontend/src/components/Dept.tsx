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
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          <span>Department ID</span>
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

  // Server-side pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [totalRows, setTotalRows] = useState(0);

  const totalPages = Math.ceil(totalRows / pageSize);

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when page size changes
  };

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

  const fetchDepartments = async (page?: number, size?: number) => {
    setLoading(true);
    const currentPage = page ?? pageIndex;
    const currentSize = size ?? pageSize;
    try {
      const res = await api.get("/getDepartment", {
        params: {
          page: currentPage + 1, // API typically expects 1-based page
          limit: currentSize,
        },
      });
      setDepartments(res.data.data);
      setTotalRows(res.data.total);
      // console.log("Fetched departments:", res.data.data);
      // Adjust based on your API response structure
      // Expected: { data: Department[], total: number }
      // if (res.data.data && typeof res.data.total === "number") {
      //   setDepartments(res.data.data);
      //   setTotalRows(res.data.total);
      // } else {
      //   // Fallback if API returns flat array (no pagination support yet)
      //   setDepartments(res.data);
      //   setTotalRows(res.data.length);
      // }
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  // console.log("Departments state:", departments);

  useEffect(() => {
    fetchDepartments();
  }, [pageIndex, pageSize]);

  return (
    <div className="w-full  flex justify-center p-5">
      <div className="container ">
        <Tbl
          columns={columns}
          data={departments}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowSelect={setSelectedDepartment}
          filter="department"
          // Server-side pagination props
          manualPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
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
    </div>
  );
}

export default Dept;
