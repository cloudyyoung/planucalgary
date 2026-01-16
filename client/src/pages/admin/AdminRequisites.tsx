import { useState } from "react"
import { ColumnDef, getCoreRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { Requisite } from "@planucalgary/shared"

import AdvancedTable from "@/components/advanced-table";
import { useRequisites } from "@/hooks/useRequisites";

export const columns: ColumnDef<Requisite>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "requisite_type",
        header: "Requisite Type",
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

    const { data } = useRequisites({
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
    })

    const table = useReactTable({
        data: data?.items || [],
        columns,
        rowCount: data?.total || 0,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        manualPagination: true,
        enableSorting: false,
        state: {
            pagination,
            sorting,
        },
    })

    return (
        <AdvancedTable table={table} />
    )
}
