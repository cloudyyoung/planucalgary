import { useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JsonView from "react18-json-view";
import { DateTime } from "luxon";
import { CloudSync } from "lucide-react";
import { RequisiteRule } from "@prisma/browser";
import { CourseListItem, useCourses } from "@/hooks/useCourses"
import AdvancedTable from "@/components/advanced-table";
import { Input } from "@/components/ui/input";
import { StatefulButton } from "@/components/ui/stateful-button";
import { RequisiteCard } from "@/components/requisite-card";
import { Pill, PillIndicator } from "@/components/ui/pill";
import { trpcClient } from "@/trpc";

export const columns: ColumnDef<CourseListItem>[] = [
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
    accessorKey: "is_active",
    header: "Active",
    size: 100,
    cell: ({ cell }) => {
      const isActive = cell.getValue<boolean>()
      return <Pill>
        <PillIndicator variant={isActive ? "success" : "error"} />
        {isActive ? "Active" : "Inactive"}
      </Pill>
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
    size: 500,
    cell: ({ cell }) => {
      const requisite = cell.getValue<any>()
      const rules = requisite?.rules as RequisiteRule[]
      return <RequisiteCard rules={rules} />
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
    size: 500,
    cell: ({ cell }) => {
      const requisite = cell.getValue<any>()
      const rules = requisite?.rules as RequisiteRule[]
      return <RequisiteCard rules={rules} />
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
    size: 500,
    cell: ({ cell }) => {
      const requisite = cell.getValue<any>()
      const rules = requisite?.rules as RequisiteRule[]
      return <RequisiteCard rules={rules} />
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
    <StatefulButton variant="outline" onClick={() => trpcClient.queues.enqueue.mutate({ job: "courses" })}>
      <CloudSync />
      Crawl
    </StatefulButton>
  </>

  return (
    <AdvancedTable table={table} header={Header} />
  )
}
