import { useState } from "react"
import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { Course, useCourses } from "@/hooks/useCourses"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "prereq",
    header: "Prerequisites",
  },
  {
    accessorKey: "prereq_json",
    header: "Prerequisites JSON",
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} theme={theme}></JSONPretty>
    }
  },
  {
    accessorKey: "antireq",
    header: "Antirequisites",
  },
  {
    accessorKey: "antireq_json",
    header: "Antirequisites JSON",
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} theme={theme}></JSONPretty>
    }
  },
  {
    accessorKey: "coreq",
    header: "Corequisites",
  },
  {
    accessorKey: "coreq_json",
    header: "Corequisites JSON",
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} theme={theme}></JSONPretty>
    }
  },
]

const theme = {
  main: 'line-height:1.3;color:#5f6d70;background:transparent;overflow:auto;',
  error: 'line-height:1.3;color:#5f6d70;background:#ffe0e0;overflow:auto;',
  key: 'color:#f92672;',
  string: 'color:#fd971f;',
  value: 'color:#a6e22e;',
  boolean: 'color:#ac81fe;',
}

export const AdminCourses = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })

  const { data } = useCourses({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  })

  const table = useReactTable({
    data: data?.items || [],
    columns,
    rowCount: data?.total || 0,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  })

  return (
    <div className="h-screen p-4">
      <div className="rounded-md border shadow h-full flex flex-col overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="overflow-auto flex-1">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption className="sticky bottom-0 bg-background p-2">
            <div className="flex flex-row items-center justify-end gap-2">
              <p>Page {table.getState().pagination.pageIndex + 1}/{table.getPageCount()} ({table.getRowCount()} rows)</p>
              <Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Prev</Button>
              <Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button>
            </div>
          </TableCaption>
        </Table>
      </div>
    </div>
  )
}
