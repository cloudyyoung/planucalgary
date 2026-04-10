import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import JsonView from "react18-json-view"

import AdvancedTable from "@/components/advanced-table"
import { RequisiteListItem, RequisiteListOutput, useRequisites } from "@/hooks/useRequisites"
import { Pill } from "@/components/ui/pill"
import { RequisiteCard } from "@/components/requisite-card"
import { RequisiteRule } from "@prisma/client"

export const AdminRequisites = () => {
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

  const { data, isLoading, isFetching } = useRequisites(props)
  const response = data as RequisiteListOutput | undefined

  const columns: ColumnDef<RequisiteListItem>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 180,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      size: 400,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      size: 400,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "rules",
      header: "Rules",
      size: 600,
      cell: ({ cell }) => {
        const rules = cell.getValue() as RequisiteRule[]
        if (!rules?.length) return null
        return (
          <ul className="flex flex-col gap-2">
            <RequisiteCard rules={rules} />
          </ul>
        )
      },
    },
    {
      accessorKey: "raw_rules",
      header: "Raw Rules",
      size: 600,
      cell: ({ cell }) => {
        const raw_rules = cell.getValue<any>()
        return <JsonView src={raw_rules} collapsed={1} displaySize={false} displayArrayIndex={false} />
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      enableSorting: true,
      cell: ({ cell }) => {
        const time = DateTime.fromISO(cell.getValue<string>())
        return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      enableSorting: true,
      cell: ({ cell }) => {
        const time = DateTime.fromISO(cell.getValue<string>())
        return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
      },
    },
  ], [])

  const table = useReactTable({
    data: response?.items ?? [],
    columns,
    rowCount: response?.total,
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
