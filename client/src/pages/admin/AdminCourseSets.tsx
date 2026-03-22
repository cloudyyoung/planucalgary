import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import JsonView from "react18-json-view";

import AdvancedTable from "@/components/advanced-table";
import { useCourseSets } from "@/hooks/useCourseSets";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../server/src/trpc/router";

const COURSE_SET_TYPE_OPTIONS = ["REQUIRED", "OPTIONAL", "GROUP"] as const

type RouterOutput = inferRouterOutputs<AppRouter>
type CourseSetListItem = RouterOutput["courseSets"]["list"]["items"][number]


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
    },
    {
      accessorKey: "csid",
      header: "CSID",
      size: 200,
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ cell }) => {
        const csid = cell.getValue<string>()
        return <span className="font-mono">{csid}</span>
      },
    },
    {
      accessorKey: "type",
      header: "Course Set Type",
      enableColumnFilter: true,
      enableSorting: true,
      meta: {
        filterVariant: 'select',
        filterOptions: COURSE_SET_TYPE_OPTIONS,
      },
    },
    {
      accessorKey: "course_set_group_id",
      header: "Course Set Group ID",
      size: 250,
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ cell }) => {
        const group_id = cell.getValue<string>()
        return <span className="font-mono">{group_id}</span>
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
      accessorKey: 'raw_json',
      header: 'Raw JSON',
      size: 600,
      cell: ({ cell }) => {
        const raw_json = cell.getValue<any>()
        return <JsonView src={raw_json} displaySize={false} displayArrayIndex={false} />
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

  return (
    <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} />
  )
}
