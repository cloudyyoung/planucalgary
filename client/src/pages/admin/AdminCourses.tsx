import { useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { Course } from "@planucalgary/shared"

import { useCourses } from "@/hooks/useCourses"
import AdvancedTable from "@/components/advanced-table";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "subject_code",
    header: "Subject Code",
    cell: ({ cell }) => {
      const code = cell.getValue<string>()
      return <span className="font-mono">{code}</span>
    }
  },
  {
    accessorKey: "course_number",
    header: "Course Number",
    cell: ({ cell }) => {
      const code = cell.getValue<string>()
      return <span className="font-mono">{code}</span>
    }
  },
  {
    accessorKey: "prereq",
    header: "Prerequisites",
    size: 300,
  },
  {
    accessorKey: "prereq_json",
    header: "Prerequisites JSON",
    size: 400,
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} />
    }
  },
  {
    accessorKey: "antireq",
    header: "Antirequisites",
    size: 300,
  },
  {
    accessorKey: "antireq_json",
    header: "Antirequisites JSON",
    size: 400,
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} />
    }
  },
  {
    accessorKey: "coreq",
    header: "Corequisites",
    size: 300,
  },
  {
    accessorKey: "coreq_json",
    header: "Corequisites JSON",
    size: 400,
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} />
    }
  },
]

export const AdminCourses = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data } = useCourses({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    sorting: sorting.length > 0 ? sorting.map(s => `${s.desc ? '-' : ''}${s.id}`) : undefined,
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value]))
  })

  const table = useReactTable({
    data: data?.items || [],
    columns,
    rowCount: data?.total || 0,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    defaultColumn: {
      enableColumnFilter: false,
      enableSorting: true,
    },
    state: {
      pagination,
      sorting,
    },
  })

  return (
    <AdvancedTable table={table} />
  )
}
