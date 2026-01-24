import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import { RequisiteSet } from "@planucalgary/shared/prisma/client";
import JSONPretty from "react-json-pretty";

import AdvancedTable from "@/components/advanced-table";
import { useRequisiteSets } from "@/hooks/useRequisiteSets";


export const AdminRequisiteSets = () => {
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

    const { data, isLoading, isFetching } = useRequisiteSets(props)

    const columns: ColumnDef<RequisiteSet>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            accessorKey: "requisite_set_group_id",
            header: "Requisite Set Group ID",
            size: 200,
            enableColumnFilter: true,
            enableSorting: true,
            cell: ({ cell }) => {
                const group_id = cell.getValue<string>()
                return <span className="font-mono">{group_id}</span>
            },
        },
        {
            accessorKey: "version",
            header: "Version",
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            accessorKey: "json",
            header: "JSON",
            size: 600,
            cell: ({ cell }) => {
                const json = cell.getValue<any>()
                return <JSONPretty data={JSON.stringify(json)} />
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
            accessorKey: "csid",
            header: "CSID",
            enableColumnFilter: true,
            enableSorting: true,
            cell: ({ cell }) => {
                const csid = cell.getValue<string>()
                return <span className="font-mono">{csid}</span>
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
