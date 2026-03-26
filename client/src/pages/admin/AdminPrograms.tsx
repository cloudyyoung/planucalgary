import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import { DateTime } from "luxon"
import JsonView from "react18-json-view";
import { Check, X } from "lucide-react";

import AdvancedTable from "@/components/advanced-table";
import { usePrograms } from "@/hooks/usePrograms";
import { FacultyPills } from "@/components/faculty-pills";
import { DepartmentPills } from "@/components/department-pills";

type FacultyItem = {
    code: string
    name: string
    display_name: string
    is_active: boolean
    created_at: Date
    updated_at: Date
}

type DepartmentItem = {
    code: string
    name: string
    display_name: string
    is_active: boolean
    created_at: Date
    updated_at: Date
}

type ProgramListItem = {
    id: string
    code: string
    pid: string
    name: string
    long_name: string | null
    display_name: string
    is_active: boolean
    requisites: unknown
    degree_designation_code: string | null
    created_at: string
    updated_at: string
    faculties: FacultyItem[]
    departments: DepartmentItem[]
}


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

    const columns: ColumnDef<ProgramListItem>[] = useMemo(() => [
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
            accessorKey: "name",
            header: "Name",
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            accessorKey: 'long_name',
            header: 'Long Name',
            size: 200,
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            accessorKey: 'display_name',
            header: 'Display Name',
            size: 200,
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            accessorKey: "is_active",
            header: "Active",
            enableSorting: true,
            enableColumnFilter: true,
            cell: ({ cell }) => {
                const isActive = cell.getValue<boolean>()
                return <span>{isActive ? <Check className="text-emerald-600" /> : <X className="text-destructive" />}</span>
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
            accessorKey: 'faculties',
            header: 'Faculties',
            size: 200,
            cell: ({ cell }) => {
                const faculties = cell.getValue<FacultyItem[]>()
                return <FacultyPills faculties={faculties} />
            },
        },
        {
            accessorKey: 'departments',
            header: 'Departments',
            size: 200,
            cell: ({ cell }) => {
                const departments = cell.getValue<DepartmentItem[]>()
                return <DepartmentPills departments={departments} />
            },
        },
        {
            accessorKey: 'requisites',
            header: 'Requisites',
            size: 600,
            cell: ({ cell }) => {
                const requisites = cell.getValue<unknown>()
                return <div className="overflow-hidden text-wrap break-all">
                    <JsonView src={requisites} displaySize={false} displayArrayIndex={false} />
                </div>
            },
        },
        {
            accessorKey: 'degree_designation_code',
            header: 'Degree Designation Code',
            size: 200,
            enableSorting: true,
            enableColumnFilter: true,
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

    const tableData: ProgramListItem[] = (data?.items as ProgramListItem[] | undefined) ?? []

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
