import { useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JsonView from "react18-json-view";
import { DateTime } from "luxon";
import { Course } from "@planucalgary/shared/prisma/client";

import { useCourses } from "@/hooks/useCourses"
import AdvancedTable from "@/components/advanced-table";
import { Input } from "@/components/ui/input";
import { RequisiteViewer } from "@/components/requisite-viewer";

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
    },
  },
  {
    accessorKey: "course_number",
    header: "Course Number",
    cell: ({ cell }) => {
      const number = cell.getValue<string>()
      return <span className="font-mono">{number}</span>
    },
  },
  {
    accessorKey: "prereq",
    header: "Prerequisites",
    size: 300,
  },
  {
    accessorKey: "prereq_requisite",
    header: "Prerequisites",
    size: 400,
    cell: ({ cell }) => {
      const requisite = cell.getValue<any>()
      return <RequisiteViewer requisite={requisite} />
    },
  },
  {
    accessorKey: "antireq",
    header: "Antirequisites",
    size: 300,
  },
  {
    accessorKey: "antireq_requisite",
    header: "Antirequisites",
    size: 400,
    cell: ({ cell }) => {
      const requisite = cell.getValue<any>()
      return <RequisiteViewer requisite={requisite} />
    },
  },
  {
    accessorKey: "coreq",
    header: "Corequisites",
    size: 300,
  },
  {
    accessorKey: "coreq_requisite",
    header: "Corequisites",
    size: 400,
    cell: ({ cell }) => {
      const requisite = cell.getValue<any>()
      return <RequisiteViewer requisite={requisite} />
    },
  },
  {
    accessorKey: 'raw_requisites',
    header: 'Raw Requisites',
    size: 600,
    cell: ({ cell }) => {
      const raw_json = cell.getValue<any>()
      return <JsonView src={raw_json} displaySize={false} displayArrayIndex={false} collapsed />
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    enableSorting: true,
    cell: ({ cell }) => {
      const time = DateTime.fromISO(cell.getValue<string>())
      return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    enableSorting: true,
    cell: ({ cell }) => {
      const time = DateTime.fromISO(cell.getValue<string>())
      return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
    },
  }
]

export const AdminCourses = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [keywords, setKeywords] = useState<string>("")

  const { data } = useCourses({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    sorting: sorting.length > 0 ? sorting.map(s => `${s.desc ? '-' : ''}${s.id}`) : undefined,
    keywords,
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
  })

  const table = useReactTable({
    data: data?.items || [],
    columns,
    rowCount: data?.total,
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

  const Header = <>
    <Input placeholder="Search courses..." className="max-w-sm bg-background" value={keywords} onChange={e => setKeywords(e.target.value)} />
  </>

  return (
    <AdvancedTable table={table} header={Header} />
  )
}
