import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import { Drill } from "lucide-react";

import AdvancedTable from "@/components/advanced-table";
import { FieldsOfStudyListItem, useFieldsOfStudy } from "@/hooks/useFieldsOfStudy";
import JsonView from "react18-json-view";
import { StatefulButton } from "@/components/ui/stateful-button";
import { trpcClient } from "@/trpc";


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

    const columns: ColumnDef<FieldsOfStudyListItem>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            accessorKey: "name",
            header: "Name",
            size: 250,
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            id: "requisite_set_group_id",
            accessorFn: (row) => row.requisite_set?.requisite_set_group_id,
            header: "Requisite Set Group ID",
            size: 250,
            enableColumnFilter: false,
            enableSorting: false,
            cell: ({ cell }) => {
                const group_id = cell.getValue<string>()
                return <span className="font-mono">{group_id}</span>
            },
        },
        {
            id: "version",
            accessorFn: (row) => row.requisite_set?.version,
            header: "Version",
            enableColumnFilter: false,
            enableSorting: false,
        },
        {
            id: "requisite_set_name",
            accessorFn: (row) => row.requisite_set?.name,
            header: "Requisite Set Name",
            size: 500,
            enableColumnFilter: false,
            enableSorting: false,
        },
        {
            id: "description",
            accessorFn: (row) => row.requisite_set?.description,
            header: "Description",
            size: 500,
            enableColumnFilter: false,
            enableSorting: false,
        },
        {
            id: "raw_json",
            accessorFn: (row): unknown => (row as any).requisite_set?.raw_json,
            header: "Raw JSON",
            size: 600,
            enableColumnFilter: false,
            enableSorting: false,
            cell: ({ cell }) => {
                const raw_json = cell.getValue<unknown>()
                return raw_json ? <JsonView src={raw_json} displaySize={false} displayArrayIndex={false} /> : null
            },
        },
        {
            accessorKey: "requisite_set",
            header: "Course Sets",
            size: 600,
            enableColumnFilter: false,
            enableSorting: false,
            cell: ({ cell }) => {
                const requisite_set = cell.getValue<any>()
                const course_sets = requisite_set?.requisite_rules.flatMap((r: any) => r.referring_course_sets) ?? []
                return <ul className="flex flex-col gap-3">
                    {course_sets.map((cs: any) => (
                        <li key={cs.id}>
                            <div>{cs.name}</div>
                            <JsonView src={cs.raw_json} displaySize={false} displayArrayIndex={false} />
                        </li>
                    ))}
                </ul>
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

    const tableData: FieldsOfStudyListItem[] = (data?.items as FieldsOfStudyListItem[] | undefined) ?? []

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

    const Header = (
        <StatefulButton variant="outline" onClick={() => trpcClient.queues.enqueue.mutate({ job: "extract-fields-of-study" })}>
            <Drill />
            Extract
        </StatefulButton>
    )

    return (
        <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} header={Header} />
    )
}
