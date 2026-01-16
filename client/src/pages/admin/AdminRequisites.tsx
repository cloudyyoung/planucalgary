import { useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, RowData, SortingState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { Requisite, RequisiteTypeSchema } from "@planucalgary/shared"

import AdvancedTable from "@/components/advanced-table";
import { useRequisites } from "@/hooks/useRequisites";


declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
    filterOptions?: TValue[]
  }
}

export const columns: ColumnDef<Requisite>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "requisite_type",
    header: "Requisite Type",
    enableColumnFilter: true,
    meta: {
      filterVariant: "select",
      filterOptions: RequisiteTypeSchema.options,
    }
  },
  {
    accessorKey: "departments",
    header: "Departments",
  },
  {
    accessorKey: "faculties",
    header: "Faculties",
  },
  {
    accessorKey: "text",
    header: "Text",
    size: 600,
  },
  {
    accessorKey: "json",
    header: "JSON",
    size: 600,
    cell: ({ cell }) => {
      const json = cell.getValue<string>()
      return <JSONPretty data={json} />
    },
  },
]

export const AdminRequisites = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data } = useRequisites({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value]))
  })

  const table = useReactTable({
    data: data?.items || [],
    columns,
    rowCount: data?.total || 0,
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
    <AdvancedTable table={table} />
  )
}
