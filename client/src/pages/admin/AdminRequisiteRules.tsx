import { useMemo, useState } from "react";
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { DateTime } from "luxon";
import JsonView from "react18-json-view";

import { RefreshCw } from "lucide-react";

import AdvancedTable from "@/components/advanced-table";
import { RequisiteRuleListItem, RequisiteRuleListOutput, useRequisiteRules } from "@/hooks/useRequisiteRules";
import { Pill } from "@/components/ui/pill";
import { StatefulButton } from "@/components/ui/stateful-button";
import { trpcClient } from "@/trpc";


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
  const response = data as RequisiteRuleListOutput | undefined;

  const columns: ColumnDef<RequisiteRuleListItem>[] = useMemo(() => [
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
      accessorKey: "referring_courses",
      header: "Referring Courses",
      size: 300,
      cell: ({ cell }) => {
        const courses = cell.getValue<{ course_id: string; code: string }[]>();
        return (
          <div className="flex flex-row gap-1">
            {courses.map((course) => (
              <Pill key={course.course_id}>
                <span className="font-mono">{course.code}</span>
              </Pill>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "referring_programs",
      header: "Referring Programs",
      size: 300,
      cell: ({ cell }) => {
        const programs = cell.getValue<{ program_id: string }[]>();
        return (
          <ul>
            {programs.map((program) => (
              <li key={program.program_id}>
                <span className="font-mono">{program.program_id}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "referring_course_sets",
      header: "Referring Course Sets",
      size: 300,
      cell: ({ cell }) => {
        const courses = cell.getValue<{ course_id: string }[]>();
        return (
          <ul>
            {courses.map((course) => (
              <li key={course.course_id}>
                <span className="font-mono">{course.course_id}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "referring_requisite_sets",
      header: "Referring Requisite Sets",
      size: 300,
      cell: ({ cell }) => {
        const courses = cell.getValue<{ course_id: string }[]>();
        return (
          <ul>
            {courses.map((course) => (
              <li key={course.course_id}>
                <span className="font-mono">{course.course_id}</span>
              </li>
            ))}
          </ul>
        );
      },
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
    data: response?.items || [],
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
  });

  const Header = (
    <StatefulButton variant="outline" onClick={() => trpcClient.queues.enqueue.mutate({ job: "build-requisite-rules" })}>
      <RefreshCw />
      Crawl
    </StatefulButton>
  );

  return (
    <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} header={Header} />
  );
};
