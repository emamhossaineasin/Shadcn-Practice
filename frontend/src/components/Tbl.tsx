"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import DeleteDialog from "./DeleteDialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAdd?: () => void;
  onEdit?: (row: TData) => void;
  onDelete?: (rows: TData[]) => void;
  onRowSelect?: (row: TData | null) => void;
  filter: string;
  manualPagination?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalRows?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

function Tbl<TData, TValue>({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onRowSelect,
  filter,
  manualPagination = false,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  totalPages: controlledTotalPages,
  onPageChange,
  onPageSizeChange,
  loading,
}: DataTableProps<TData, TValue>) {
  "use no memo";
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Local pagination state (used when not manual)
  const [localPageSize, setLocalPageSize] = useState(5);

  const pageSize = manualPagination ? (controlledPageSize ?? 5) : localPageSize;
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: localPageSize,
      },
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: controlledTotalPages ?? -1,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),

    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(manualPagination && {
        pagination: {
          pageIndex: controlledPageIndex ?? 0,
          pageSize,
        },
      }),
    },
  });

  // Set initial page size for client-side pagination
  React.useEffect(() => {
    if (!manualPagination) {
      table.setPageSize(localPageSize);
    }
  }, [localPageSize, manualPagination, table]);

  // Pagination values
  const currentPageIndex = manualPagination
    ? (controlledPageIndex ?? 0)
    : table.getState().pagination.pageIndex;
  const totalPages = manualPagination
    ? (controlledTotalPages ?? 1)
    : table.getPageCount();

  const canPreviousPage = manualPagination
    ? currentPageIndex > 0
    : table.getCanPreviousPage();
  const canNextPage = manualPagination
    ? currentPageIndex < totalPages - 1
    : table.getCanNextPage();

  const goToPage = (page: number) => {
    const validPage = Math.max(0, Math.min(page, totalPages - 1));

    setRowSelection({});

    if (manualPagination) {
      onPageChange?.(validPage);
    } else {
      table.setPageIndex(validPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (manualPagination) {
      onPageSizeChange?.(newSize);
    } else {
      setLocalPageSize(newSize);
      table.setPageSize(newSize);
      table.setPageIndex(0);
    }
  };

  const filterKey =
    filter === "department"
      ? "department_name"
      : filter === "student"
        ? "student_name"
        : (filter ?? "");

  const filterPlaceholder = `Search ${filter}`;

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  React.useEffect(() => {
    const selectedRow = table.getSelectedRowModel().rows[0]?.original ?? null;
    onRowSelect?.(selectedRow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, onRowSelect]);

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Add row"
            onClick={() => onAdd?.()}
            className="cursor-pointer"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Edit row"
            disabled={selectedRows.length !== 1}
            onClick={() => onEdit?.(selectedRows[0])}
            className={
              selectedRows.length !== 1
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
          >
            <Pencil className="size-4" />
          </Button>

          <DeleteDialog
            onConfirm={() => onDelete?.(selectedRows)}
            trigger={
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Delete row"
                disabled={selectedRows.length === 0}
                className={
                  selectedRows.length !== 1
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }
              >
                <Trash2 className="size-4" />
              </Button>
            }
          />
          {filter && (
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(filterKey)?.setFilterValue(event.target.value)
              }
              className="w-xs lg:min-w-md"
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows :</span>
            <Input
              type="number"
              min={1}
              max={100}
              value={pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) handlePageSizeChange(val);
              }}
              className="w-16 h-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader className="bg-blue-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length > 0 && !loading ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading data..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {pageSize} row(s)
          selected.
        </div>

        <div className="flex items-center gap-2">
          {/* First Page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => goToPage(0)}
            disabled={!canPreviousPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Indicator */}
          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                if (page >= 0 && page < totalPages) {
                  goToPage(page);
                }
              }}
              className="w-14 h-8 text-center"
            />
            <span>of {totalPages}</span>
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => goToPage(currentPageIndex + 1)}
            disabled={!canNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => goToPage(totalPages - 1)}
            disabled={!canNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Tbl;
