import { useState } from "react"
import { ColumnDef, getCoreRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
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
  },
  {
    accessorKey: "prereq_json",
    header: "Prerequisites JSON",
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} />
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
      return <JSONPretty data={json} />
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

  const { data } = useCourses({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    sorting: sorting.length > 0 ? sorting.map(s => `${s.desc ? '-' : ''}${s.id}`).join(',') : undefined,
  })

  const table = useReactTable({
    data: data?.items || [],
    columns,
    rowCount: data?.total || 0,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination,
      sorting,
    },
  })

  return (
    <div className="h-[100vh]">
      <AdvancedTable table={table} />
    </div>
  )
}
