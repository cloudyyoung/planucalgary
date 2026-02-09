import { useMemo, useState } from "react";
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { RequisiteRule } from "@planucalgary/shared/prisma/client";
import JsonView from "react18-json-view";

import AdvancedTable from "@/components/advanced-table";
import { useRequisiteRules } from "@/hooks/useRequisiteRules";


export const AdminRequisiteRules = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const props = useMemo(() => ({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    sorting: sorting.map(({ id, desc }) => desc ? `-${id}` : id),
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
  }), [pagination, sorting, columnFilters]);

  const { data, isLoading, isFetching } = useRequisiteRules(props);

  const columns: ColumnDef<RequisiteRule>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "requisite_id",
      header: "Requisite ID",
      size: 240,
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ cell }) => {
        const requisiteId = cell.getValue<string>();
        return <span className="font-mono">{requisiteId}</span>;
      },
    },
    {
      accessorKey: "parent_rule_id",
      header: "Parent Rule ID",
      size: 240,
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ cell }) => {
        const parentRuleId = cell.getValue<string | null>();
        return parentRuleId ? <span className="font-mono">{parentRuleId}</span> : null;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      size: 260,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "condition",
      header: "Condition",
      size: 180,
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "min_courses",
      header: "Min Courses",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "max_courses",
      header: "Max Courses",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "min_credits",
      header: "Min Credits",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "max_credits",
      header: "Max Credits",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "credits",
      header: "Credits",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "number",
      header: "Number",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "restriction",
      header: "Restriction",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "grade",
      header: "Grade",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "grade_type",
      header: "Grade Type",
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: "Description",
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
      accessorKey: "raw_json",
      header: "Raw JSON",
      size: 600,
      cell: ({ cell }) => {
        const rawJson = cell.getValue<any>();
        return <JsonView src={rawJson} displaySize={false} displayArrayIndex={false} />;
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      enableSorting: true,
      cell: ({ cell }) => {
        const time = DateTime.fromISO(cell.getValue<string>());
        return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      enableSorting: true,
      cell: ({ cell }) => {
        const time = DateTime.fromISO(cell.getValue<string>());
        return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
      },
    },
  ], []);

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
  });

  return (
    <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} />
  );
};
