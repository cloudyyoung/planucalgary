import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import JsonView from "react18-json-view";
import { RefreshCw } from "lucide-react";

import AdvancedTable from "@/components/advanced-table";
import { useCourseSets } from "@/hooks/useCourseSets";
import { StatefulButton } from "@/components/ui/stateful-button";
import { Pill } from "@/components/ui/pill";
import { trpcClient } from "@/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { Router } from "../../../../server/src/trpc/router";

type RouterOutput = inferRouterOutputs<Router>
type CourseSetListItem = RouterOutput["course_sets"]["list"]["items"][number]


export const AdminCourseSets = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const props = useMemo(() => ({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    sorting: sorting.map(({ id, desc }) => desc ? `-${id}` : id),
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
  }), [pagination, sorting, columnFilters])

  const { data, isLoading, isFetching } = useCourseSets(props)

  const columns: ColumnDef<CourseSetListItem>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      enableColumnFilter: true,
      size: 200,
      cell: ({ cell }) => {
        const csid = cell.getValue<string>()
        return <span className="font-mono">{csid}</span>
      },
    },
    {
      accessorKey: "course_set_group_id",
      header: "Course Set Group ID",
      size: 200,
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ cell }) => {
        const group_id = cell.getValue<string>()
        return <span className="font-mono">{group_id}</span>
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      enableColumnFilter: true,
      enableSorting: true,
      size: 80,
      meta: {
        filterVariant: 'select',
        filterOptions: ["static", "dynamic"],
      },
      cell: ({ cell }) => {
        const type = cell.getValue<string>()
        return <Pill>{type}</Pill>
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      size: 500,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 500,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: 'courses',
      header: 'Courses',
      size: 400,
      cell: ({ cell }) => {
        const courses = cell.getValue<{ id: string; code: string }[]>()
        if (!courses?.length) return <span className="text-muted-foreground">—</span>
        return <div className="flex flex-wrap gap-1">{courses.map(c => <Pill key={c.id}>{c.code}</Pill>)}</div>
      },
    },
    {
      accessorKey: 'course_list',
      header: 'Course List',
      size: 400,
      cell: ({ cell }) => {
        const list = cell.getValue<string[]>()
        if (!list?.length) return <span className="text-muted-foreground">—</span>
        return <span className="font-mono text-sm">{list.join(", ")}</span>
      },
    },
    {
      accessorKey: 'raw_json',
      header: 'Raw JSON',
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
  ], [])

  const tableData: CourseSetListItem[] = (data?.items as CourseSetListItem[] | undefined) ?? []

  const table = useReactTable({
    data: tableData,
    columns,
    rowCount: data?.total,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    defaultColumn: {
      enableColumnFilter: false,
      enableSorting: false,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
    },
  })

  const Header = <>
    <StatefulButton variant="outline" onClick={() => trpcClient.queues.enqueue.mutate({ job: "course-sets" })}>
      <RefreshCw />
      Crawl
    </StatefulButton>
    <StatefulButton variant="outline" onClick={() => trpcClient.queues.enqueue.mutate({ job: "build-course-sets" })}>
      <RefreshCw />
      Build
    </StatefulButton>
  </>

  return (
    <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} header={Header} />
  )
}
