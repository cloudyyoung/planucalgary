import { useState } from "react"
import { useReactTable, getCoreRowModel, flexRender, PaginationState } from '@tanstack/react-table'
import JSONPretty from "react-json-pretty"

import { useCourses } from "src/hooks/useCourses"
import { TextInput } from "flowbite-react"



const theme = {
  main: 'line-height:1.3;color:#5f6d70;background:transparent;overflow:auto;',
  error: 'line-height:1.3;color:#5f6d70;background:#ffe0e0;overflow:auto;',
  key: 'color:#f92672;',
  string: 'color:#fd971f;',
  value: 'color:#a6e22e;',
  boolean: 'color:#ac81fe;',
}

const Courses = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [keywords, setKeywords] = useState<string | undefined>()

  const { courses, total } = useCourses({
    keywords,
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  })

  const table = useReactTable({
    columns: [
      { header: 'ID', accessorKey: 'id', size: 20, },
      { header: 'Code', accessorKey: 'code', size: 40, },
      { header: 'Name', accessorKey: 'long_name' },
      { header: 'Active', accessorKey: 'is_active' },
      { header: 'Prereq', accessorKey: 'prereq' },
      {
        header: 'Prereq JSON', accessorKey: 'prereq_json',
        cell: ({ cell }) => {
          const json = cell.getValue()
          return (
            <div className="flex flex-row items-center gap-2">
              {json && <JSONPretty theme={theme} data={JSON.stringify(json)}></JSONPretty>}
            </div>
          )
        },
      },
      { header: 'Antireq', accessorKey: 'antireq' },
      {
        header: 'Antireq JSON', accessorKey: 'antireq_json',
        cell: ({ cell }) => {
          const json = cell.getValue()
          return (
            <div className="flex flex-row items-center gap-2">
              {json && <JSONPretty theme={theme} data={JSON.stringify(json)}></JSONPretty>}
            </div>
          )
        },
      },
      { header: 'Coreq', accessorKey: 'coreq' },
      {
        header: 'Coreq JSON', accessorKey: 'coreq_json',
        cell: ({ cell }) => {
          const json = cell.getValue()
          return (
            <div className="flex flex-row items-center gap-2">
              {json && <JSONPretty theme={theme} data={JSON.stringify(json)}></JSONPretty>}
            </div>
          )
        },
      },
    ],
    data: courses,
    rowCount: total,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  })

  return (
    <>
      <TextInput className="mx-4" placeholder="Keywords..." value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      <div className="overflow-x-auto rounded-lg m-4">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-4" type={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-1" type={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map(footerGroup => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>

        <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-4 justify-between text-sm">
          <div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize} rows
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="flex items-center gap-1">
              Go to page:
              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  table.setPageIndex(page)
                }}
                className="block pt-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-20 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </span>
          </div>
          <div className="flex flex-row gap-4">
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount().toLocaleString()}
              </strong>
            </span>
            <div className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <button
                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </button>
              <button
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </button>
              <button
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </button>
              <button
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Courses