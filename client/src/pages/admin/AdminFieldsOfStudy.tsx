import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import { FieldOfStudy } from "@planucalgary/shared/prisma/client";

import AdvancedTable from "@/components/advanced-table";
import { useFieldsOfStudy } from "@/hooks/useFieldsOfStudy";


export const AdminFieldsOfStudy = () => {
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

    const { data, isLoading, isFetching } = useFieldsOfStudy(props)

    const columns: ColumnDef<FieldOfStudy>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            accessorKey: "name",
            header: "Name",
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
            accessorKey: "notes",
            header: "Notes",
            size: 500,
            enableColumnFilter: true,
            enableSorting: true,
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

    const table = useReactTable({
        data: data?.items || [],
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
