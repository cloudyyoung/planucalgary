import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { Requisite, RequisiteTypeSchema } from "@planucalgary/shared"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdvancedTable from "@/components/advanced-table";
import { useRequisites } from "@/hooks/useRequisites";
import { Button } from "@/components/ui/button";
import { Bot, Check, Pickaxe, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";


export const AdminRequisites = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data, isLoading, isFetching } = useRequisites({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value]))
  })

  const columns: ColumnDef<Requisite>[] = useMemo(() => [
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
      accessorKey: "json_valid",
      header: "Valid",
      size: 60,
      cell: ({ cell }) => {
        const isValid = cell.getValue<boolean>()
        return isValid ? <Check className="text-success" /> : <X className="text-destructive" />
      }
    },
    {
      accessorKey: "json",
      header: "JSON",
      size: 400,
      cell: ({ cell, row }) => {
        const json = cell.getValue<string>()
        const jsonChoices = row.original.json_choices
        const text = row.original.text

        return (
          <div className="flex flex-row justify-start items-center gap-6">
            <div className="flex flex-row gap-1">
              <Button variant="outline" size="icon"><Bot /></Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Pickaxe />
                    {
                      jsonChoices && jsonChoices.length > 0 && (
                        <div className="absolute bottom-0 right-0 text-xs font-mono rounded-full px-0.5 pointer-events-none">{jsonChoices.length}</div>
                      )
                    }
                  </Button>
                </DialogTrigger>
                <DialogContent className="lg:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{text}</DialogTitle>
                    <DialogDescription className="space-y-2">
                      <div className="max-h-[30vh] overflow-y-auto flex flex-row gap-2">
                        {
                          jsonChoices.map((choice, index) => (
                            <Button key={index} variant="ghost" className="h-full text-left justify-start w-full">
                              <JSONPretty data={choice} />
                            </Button>
                          ))
                        }
                      </div>
                      <Button variant="outline">
                        <Bot /> Generate Choices
                      </Button>
                      <Textarea value={JSON.stringify(json, null, 2)} className="h-[30vh]" />
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="default" onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.navigator.clipboard.writeText(JSON.stringify(json, null, 2))
                    }}>
                      Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <JSONPretty data={json} />
          </div>
        )
      },
    },
    {
      id: "errors-and-warnings",
      header: "Errors and Warnings",
      size: 400,
      cell: ({ row }) => {
        const errors = row.original.json_errors || []
        const warnings = row.original.json_warnings || []

        return (
          <div className="flex flex-col gap-2">
            {errors.length > 0 && (
              <div>
                <ul className="list-none list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm bg-destructive/10 text-destructive p-2">
                      <span>{error.message}</span>
                      <pre>{error.value}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {warnings.length > 0 && (
              <div>
                <ul className="list-none list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm bg-caution/10 text-caution p-2">
                      <span>{warning.message}</span>
                      <pre>{warning.value}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "text",
      header: "Text",
      size: 600,
    },
  ], [])

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
    <AdvancedTable table={table} isLoading={isLoading} isFetching={isFetching} />
  )
}
