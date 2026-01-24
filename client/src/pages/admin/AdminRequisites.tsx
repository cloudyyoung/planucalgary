import { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import JSONPretty from 'react-json-pretty';
import { RequisiteJson } from "@planucalgary/shared/prisma/client"
import { RequisiteJsonValidation, RequisitesSyncDestination, RequisitesSyncDestinationSchema, RequisiteTypeSchema } from "@planucalgary/shared";
import { Bot, Check, Pencil, X } from "lucide-react";
import { DateTime } from "luxon"
import Editor from '@monaco-editor/react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdvancedTable from "@/components/advanced-table";
import { useRequisites, useRequisitesGenerateChoices, useRequisitesSync, useRequisitesUpdate } from "@/hooks/useRequisites";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/stateful-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export const AdminRequisites = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [syncDestination, setSyncDestination] = useState<RequisitesSyncDestination>()

  const props = useMemo(() => ({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    sorting: sorting.map(({ id, desc }) => desc ? `-${id}` : id),
    ...Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
  }), [pagination, sorting, columnFilters])

  const { data, isLoading, isFetching } = useRequisites(props)
  const { mutateAsync: generateChoices } = useRequisitesGenerateChoices(props)
  const { mutateAsync: updateJson } = useRequisitesUpdate(props)
  const { mutateAsync: syncRequisites } = useRequisitesSync()

  const columns: ColumnDef<RequisiteJson & RequisiteJsonValidation>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      enableColumnFilter: true,
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

        const onClickJsonChoice = (choice: any) => {
          setJsonEdit(JSON.stringify(choice, null, 2))
        }

        const onGenerateChoices = async () => {
          await generateChoices(row.original.id)
        }

        const onUpdate = async () => {
          await updateJson({ id: row.original.id, json: JSON.parse(jsonEdit) })
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
                            <Button key={index} variant="ghost" className="h-full min-h-20 text-left justify-start w-full text-xs" onClick={() => onClickJsonChoice(choice)}>
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
                      <div className="h-[40vh]">
                        <Editor
                          defaultLanguage="json"
                          value={jsonEdit}
                          onChange={(value) => setJsonEdit(value || "")}
                          className="font-mono !leading-[1.3] border rounded w-full"
                        />
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

  const onSync = async () => {
    if (syncDestination) {
      await syncRequisites(syncDestination)
    }
  }

  const Header = <>
    <Select
      value={syncDestination}
      onValueChange={(value) => setSyncDestination(value as RequisitesSyncDestination)}
    >
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue placeholder="Sync Destination" />
      </SelectTrigger>
      <SelectContent>
        {RequisitesSyncDestinationSchema.options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <StatefulButton variant="outline" onClick={onSync} disabled={!syncDestination}>Sync</StatefulButton>
  </>

  return (
    <AdvancedTable table={table} header={Header} isLoading={isLoading} isFetching={isFetching} />
  )
}
