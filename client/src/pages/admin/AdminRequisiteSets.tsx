import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import JsonView from "react18-json-view";
import { CloudSync } from "lucide-react";
import { RequisiteRule } from "@prisma/client";

import AdvancedTable from "@/components/advanced-table";
import { RequisiteSetListItem, RequisiteSetListOutput, useRequisiteSets } from "@/hooks/useRequisiteSets";
import { StatefulButton } from "@/components/ui/stateful-button";
import { trpcClient } from "@/trpc";
import { RequisiteCard } from "@/components/requisite-card";


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
    const response = data as RequisiteSetListOutput | undefined

    const columns: ColumnDef<RequisiteSetListItem>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
            enableColumnFilter: true,
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
            accessorKey: "requisite_set_group_id",
            header: "Requisite Set Group ID",
            size: 250,
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
            accessorKey: 'requisite_rules',
            header: 'Rules',
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
            accessorKey: 'raw_json',
            header: 'Raw JSON',
            size: 600,
            cell: ({ cell }) => {
                const raw_json = cell.getValue<any>()
                return <JsonView src={raw_json} collapsed={1} displaySize={false} displayArrayIndex={false} />
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

    const tableData: RequisiteSetListItem[] = response?.items ?? []

    const table = useReactTable({
        data: tableData,
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

    const Header = (
        <StatefulButton variant="outline" onClick={() => trpcClient.queues.enqueue.mutate({ job: "requisite-sets" })}>
            <CloudSync />
            Crawl
        </StatefulButton>
    )

    return (
        <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} header={Header} />
    )
}
