import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { Requisite, RequisiteTypeSchema } from "@planucalgary/shared"
import { Bot, Check, Pencil, X } from "lucide-react";
import { DateTime } from "luxon"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdvancedTable from "@/components/advanced-table";
import { useRequisites, useRequisitesGenerateChoices, useRequisitesUpdate } from "@/hooks/useRequisites";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatefulButton } from "@/components/ui/stateful-button";


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
    sorting: sorting.map(({ id, desc }) => desc ? `-${id}` : id),
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
  })

  const columns: ColumnDef<Requisite>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
    },
    {
      accessorKey: "requisite_type",
      header: "Requisite Type",
      enableColumnFilter: true,
      enableSorting: true,
      meta: {
        filterVariant: "select",
        filterOptions: RequisiteTypeSchema.options,
      }
    },
    {
      accessorKey: "departments",
      header: "Departments",
      enableSorting: true,
    },
    {
      accessorKey: "faculties",
      header: "Faculties",
      enableSorting: true,
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
      id: "json",
      header: "JSON",
      size: 400,
      cell: ({ row }) => {
        const json = row.original.json
        const jsonChoices = row.original.json_choices
        const text = row.original.text

        const [dialogOpen, setDialogOpen] = useState(false)
        const [jsonEdit, setJsonEdit] = useState<string>("")

        const { mutateAsync: generateChoices } = useRequisitesGenerateChoices(row.original.id)
        const { mutateAsync: updateJson } = useRequisitesUpdate(row.original.id)

        const onClickJsonChoice = (choice: any) => {
          setJsonEdit(JSON.stringify(choice, null, 2))
        }

        const onGenerateChoices = async () => {
          await generateChoices()
        }

        const onUpdate = async () => {
          await updateJson({ json: JSON.parse(jsonEdit) })
          setDialogOpen(false)
        }

        const onOpenChange = (open: boolean) => {
          setDialogOpen(open)
          if (open) {
            setJsonEdit(JSON.stringify(json, null, 2))
          }
        }

        return (
          <div className="flex flex-row justify-start items-center gap-6">
            <div className="flex flex-row gap-1">
              <StatefulButton variant="outline" onClick={onGenerateChoices} className="w-9">
                <Bot />
              </StatefulButton>
              <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-9">
                    <Pencil />
                  </Button>
                </DialogTrigger>
                <DialogContent className="lg:max-w-4xl overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>{text}</DialogTitle>
                    <DialogDescription className="space-y-2">
                      <div className="max-h-[30vh] max-w-4xl overflow-auto flex flex-row px-6 -mx-6">
                        {
                          jsonChoices.map((choice, index) => (
                            <Button key={index} variant="ghost" className="h-full min-h-20 text-left justify-start w-full" onClick={() => onClickJsonChoice(choice)}>
                              <JSONPretty data={choice} />
                            </Button>
                          ))
                        }
                      </div>
                      <div>
                        <StatefulButton variant="outline" onClick={onGenerateChoices} className="w-full">
                          <Bot /> Generate Choices
                        </StatefulButton>
                      </div>
                      <div className="grid grid-cols-2 gap-4 overflow-auto h-[40vh]">
                        <Textarea value={jsonEdit} className="p-2 font-mono text-xs !leading-[1.3]" onChange={(e) => setJsonEdit(e.target.value)} />
                        <JSONPretty data={jsonEdit} className="p-2 mb-1" />
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <StatefulButton className="w-28 h-10" onClick={onUpdate}>
                      Update
                    </StatefulButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <JSONPretty data={JSON.stringify(json)} />
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
                      <JSONPretty data={JSON.stringify(error.value)} className="text-xs" />
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
                      <JSONPretty data={JSON.stringify(warning.value)} className="text-xs" />
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
    {
      accessorKey: 'updated_at',
      header: 'Updated At',
      cell: ({ cell }) => {
        const time = DateTime.fromISO(cell.getValue<string>())
        return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ cell }) => {
        const time = DateTime.fromISO(cell.getValue<string>())
        return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
      },
    }
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
