import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import JsonView from "react18-json-view"
import { DateTime } from "luxon"
import { QueueJob, QueueCounts } from "@planucalgary/shared"
import { Card, CardContent } from "@/components/ui/card"
import AdvancedTable from "@/components/advanced-table"
import { useQueueStatus } from "@/hooks/useQueueStatus"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const JobColumns: ColumnDef<QueueJob>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
  },
  {
    accessorKey: "name",
    header: "Job Name",
    size: 150,
  },
  {
    accessorKey: "state",
    header: "State",
    size: 100,
    cell: ({ cell }) => {
      const state = cell.getValue<string>()
      const colors: Record<string, string> = {
        waiting: "bg-blue-100 text-blue-800",
        active: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        delayed: "bg-purple-100 text-purple-800",
        paused: "bg-gray-100 text-gray-800",
      }
      const color = colors[state] || "bg-gray-100 text-gray-800"
      return (
        <span className={`px-2 py-1 rounded text-sm font-medium ${color}`}>
          {state}
        </span>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    size: 120,
    cell: ({ cell }) => {
      const progress = cell.getValue<any>()
      if (typeof progress === "number") {
        return <Progress value={progress} />
      }
      return <>{progress}</>
    },
  },
  {
    id: "attempts",
    header: "Attempts",
    size: 50,
    cell: ({ row }) => {
      const started = row.original.attempts_started
      const made = row.original.attempts_made
      return (
        <span>
          {made} / {started}
        </span>
      )
    },
  },
  {
    accessorKey: "data",
    header: "Data",
    size: 250,
    cell: ({ cell }) => {
      const data = cell.getValue<any>()
      return <JsonView src={data} displaySize={false} displayArrayIndex={false} collapsed />
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    size: 90,
    cell: ({ cell }) => {
      const timestamp = cell.getValue<number>()
      const time = DateTime.fromMillis(timestamp)
      return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
    },
  },
  {
    accessorKey: "processed_at",
    header: "Processed At",
    size: 90,
    cell: ({ cell }) => {
      const timestamp = cell.getValue<number | undefined>()
      if (!timestamp) return
      const time = DateTime.fromMillis(timestamp)
      return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
    },
  },
  {
    accessorKey: "finished_at",
    header: "Finished At",
    size: 90,
    cell: ({ cell }) => {
      const timestamp = cell.getValue<number | undefined>()
      if (!timestamp) return
      const time = DateTime.fromMillis(timestamp)
      return time.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
    },
  },
  {
    accessorKey: "return_value",
    header: "Return Value",
    size: 250,
    cell: ({ cell }) => {
      const value = cell.getValue<any>()
      return <JsonView src={value} displaySize={false} displayArrayIndex={false} collapsed />
    },
  },
]

const QueueStats = ({ counts }: { counts: QueueCounts }) => {
  const stats = [
    { label: "Waiting", value: counts.waiting, color: "bg-blue-600" },
    { label: "Active", value: counts.active, color: "bg-yellow-600" },
    { label: "Completed", value: counts.completed, color: "bg-green-600" },
    { label: "Failed", value: counts.failed, color: "bg-red-600" },
    { label: "Delayed", value: counts.delayed, color: "bg-purple-600" },
    { label: "Paused", value: counts.paused, color: "bg-gray-600" },
  ]

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-1">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={cn("rounded-full px-3 py-1 min-w-[3.4rem] inline-block text-xl font-bold text-white", stat.color)}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AdminCatalogQueue() {
  const { data, isLoading } = useQueueStatus()

  const table = useReactTable({
    data: data?.jobs ?? [],
    columns: JobColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnFilters: false,
  })

  return (
    <AdvancedTable table={table} header={data && <QueueStats counts={data.counts} />} isLoading={isLoading} />
  )
}
