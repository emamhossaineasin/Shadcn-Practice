"use client";
import { Input } from "@/components/ui/input";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAdd?: () => void;
  onEdit?: (row: TData) => void;
  onDelete?: (rows: TData[]) => void;
  onRowSelect?: (row: TData | null) => void;
  filter: string;
}

function Tbl<TData, TValue>({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onRowSelect,
  filter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    },
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  React.useEffect(() => {
    const selectedRow = table.getSelectedRowModel().rows[0]?.original ?? null;
    console.log("Selected Row:", selectedRow);
    onRowSelect?.(selectedRow);
  }, [table.getState().rowSelection]);

  return (
    <div className="">
      <div className="flex items-center">
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
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Delete row"
            disabled={selectedRows.length === 0}
            onClick={() => onDelete?.(selectedRows)}
            className={
              selectedRows.length !== 1
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
          >
            <Trash2 className="size-4" />
          </Button>
          {filter === "department" && (
            <Input
              placeholder="Filter department name..."
              value={
                (table
                  .getColumn("department_name")
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn("department_name")
                  ?.setFilterValue(event.target.value)
              }
              className="lg:min-w-md"
            />
          )}
          {filter === "student" && (
            <Input
              placeholder="Filter student name..."
              value={
                (table.getColumn("student_name")?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn("student_name")
                  ?.setFilterValue(event.target.value)
              }
              className="lg:min-w-md"
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
            {table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 pt-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Tbl;
