import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import { Program } from "@planucalgary/shared/prisma/client";

import AdvancedTable from "@/components/advanced-table";
import { usePrograms } from "@/hooks/usePrograms";


export const AdminPrograms = () => {
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

    const { data, isLoading, isFetching } = usePrograms(props)

    const columns: ColumnDef<Program>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            accessorKey: "code",
            header: "Code",
            enableColumnFilter: true,
            enableSorting: true,
            cell: ({ cell }) => {
                const code = cell.getValue<string>()
                return <span className="font-mono">{code}</span>
            },
        },
        {
            accessorKey: "name",
            header: "Name",
            size: 300,
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            accessorKey: "pid",
            header: "PID",
            enableColumnFilter: true,
            enableSorting: true,
            cell: ({ cell }) => {
                const pid = cell.getValue<string>()
                return <span className="font-mono">{pid}</span>
            },
        },
        {
            accessorKey: "is_active",
            header: "Active",
            enableSorting: true,
            enableColumnFilter: true,
            cell: ({ cell }) => {
                const isActive = cell.getValue<boolean>()
                return <span>{isActive ? "Yes" : "No"}</span>
            },
            meta: {
                filterVariant: "select",
                filterOptions: [
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                ],
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
