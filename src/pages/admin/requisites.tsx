import { useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, flexRender, PaginationState } from '@tanstack/react-table'
import { Badge, Label, Modal, Radio, Select, Textarea, Table } from 'flowbite-react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

import { useRequisites } from "src/hooks/useRequisites";
import { Button } from "src/components"
import api from "src/api";

const theme = {
  main: 'line-height:1.3;color:#5f6d70;background:transparent;overflow:auto;',
  error: 'line-height:1.3;color:#5f6d70;background:#ffe0e0;overflow:auto;',
  key: 'color:#f92672;',
  string: 'color:#fd971f;',
  value: 'color:#a6e22e;',
  boolean: 'color:#ac81fe;',
}

const MANUAL_JSON_CHOICE = -999
const NULL_JSON_CHOICE = -998

const Requisites = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [requisiteId, setRequisiteId] = useState('')
  const [requisiteType, setRequisiteType] = useState<"PREREQ" | "COREQ" | "ANTIREQ">()
  const [text, setText] = useState('')
  const [choices, setChoices] = useState<object[]>([])
  const [manualJson, setManualJson] = useState('')
  const [chosenChoiceIndex, setChosenChoiceIndex] = useState(-1)
  const [isChoosing, setIsChoosing] = useState(false)

  const { requisites, total, refetch } = useRequisites({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    type: requisiteType,
  })

  const onOpenModal = (text: string, choices: object[], json: object, requisiteId: string) => {
    setRequisiteId(requisiteId)
    setText(text)
    setManualJson('')
    setChoices(choices)
    setChosenChoiceIndex(-1)
    setIsChoosing(true)

    const choosenIndex = choices.findIndex(choice => JSON.stringify(choice) === JSON.stringify(json))
    if (json === null) {
      setChosenChoiceIndex(NULL_JSON_CHOICE)
    } else if (choosenIndex !== -1) {
      setChosenChoiceIndex(choosenIndex)
    } else {
      setChosenChoiceIndex(MANUAL_JSON_CHOICE)
      setManualJson(JSON.stringify(json, null, 2))
    }
  }

  const onCloseModal = () => {
    setIsChoosing(false)
  }

  const onGenerateRequisite = async (requisiteId: string) => {
    const response = await api.post(`/requisites/${requisiteId}`, {}, { timeout: 20000 })
    const data = response.data
    const choices = data.json_choices
    const json = data.json
    refetch()

    // check if choices is an array
    if (!Array.isArray(choices)) {
      console.warn(choices)
      return
    }

    if (!data.json) {
      onOpenModal(data.text, choices, json, requisiteId)
    }
  }

  const onUpdateRequisite = async () => {
    let json = null
    if (chosenChoiceIndex === MANUAL_JSON_CHOICE) {
      json = JSON.parse(manualJson)
    } else if (chosenChoiceIndex === NULL_JSON_CHOICE) {
      json = null
    } else {
      json = choices[chosenChoiceIndex]
    }
    await api.put(`/requisites/${requisiteId}`, { json })
    refetch()
    onCloseModal()
  }

  const onManualJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualJson(e.target.value)
    setChosenChoiceIndex(MANUAL_JSON_CHOICE)
  }

  const choicesRender = useMemo(() => {
    const choiceOccurences: Record<string, number> = {}

    for (const choice of choices) {
      const json = JSON.stringify(choice)
      if (choiceOccurences[json]) {
        choiceOccurences[json]++
      } else {
        choiceOccurences[json] = 1
      }
    }

    return Object.entries(choiceOccurences).map(([json, count]) => {
      return { json, count }
    })
  }, [choices])

  const table = useReactTable({
    columns: [
      { header: 'ID', accessorKey: 'id', size: 20, },
      { header: 'Type', accessorKey: 'requisite_type', size: 20, },
      { header: 'Text', accessorKey: 'text', size: 500, },
      {
        header: 'Json', accessorKey: 'json',
        size: 500,
        cell: ({ cell, row }) => {
          const id = row.id
          const json = cell.getValue()
          const text = row.original.text
          const choices = row.original.json_choices
          const onClick = () => onOpenModal(text, choices, json, id)
          return (
            <div className="flex flex-row items-center gap-2">
              {json && <JSONPretty theme={theme} data={JSON.stringify(json)}></JSONPretty>}
              {choices.length > 0 && <Button onClick={onClick}>Choose</Button>}
            </div>
          )
        }
      },
      {
        header: 'Json Choices', accessorKey: 'json_choices',
        size: 100,
        cell: ({ cell, row }) => {
          const onClick = () => onGenerateRequisite(row.id)
          return (
            <div className="flex flex-row items-center gap-2">
              <p>{cell.getValue<string[]>().length} choices</p>
              <Button onClick={onClick}>Generate</Button>
            </div>
          )
        },
      },
      { header: 'Departments', accessorKey: 'departments', size: 40, },
      { header: 'Faculties', accessorKey: 'faculties', size: 40, },
      { header: 'Program', accessorKey: 'program', size: 40, },
    ],
    data: requisites,
    rowCount: total,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  })

  return (
    <>
      <div className="mx-4">
        <Select id="type" required onChange={(e) => setRequisiteType(e.target.value as any)} className="w-fit">
          <option value={undefined}>All</option>
          <option value="PREREQ">PREREQ</option>
          <option value="COREQ">COREQ</option>
          <option value="ANTIREQ">ANTIREQ</option>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-lg m-4">
        <Table>
          <Table.Head>
            {table.getFlatHeaders().map(header => (
              <Table.HeadCell key={header.id} className="px-3 py-4" style={{ width: header.getSize() }}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body className="divide-y">
            {table.getRowModel().rows.map(row => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <Table.Cell key={cell.id} className="px-3 py-1" style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
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
        </Table>

        <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-4 justify-between text-sm">
          <div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500].map(pageSize => (
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

        <Modal show={isChoosing} onClose={() => setIsChoosing(false)} size='2xl'>
          <Modal.Header>{text}</Modal.Header>
          <Modal.Body>
            <fieldset className="flex flex-col gap-4">
              {
                choicesRender.map(({ json, count }, index) => (
                  <>
                    <div className="flex items-center gap-2 w-full">
                      <Radio key={index} name="choices" id={`radio-${index}`} value={index} checked={chosenChoiceIndex === index} onChange={() => setChosenChoiceIndex(index)} />
                      <Label htmlFor={`radio-${index}`} className="w-full">
                        <div className="flex flex-row justify-between items-center">
                          <JSONPretty theme={theme} data={json} />
                          <Badge size="sm" href="#">x{count}</Badge>
                        </div>
                      </Label>
                    </div>
                    <hr className="w-full h-0.5 mx-auto bg-gray-200 border-0 rounded-sm dark:bg-gray-600"></hr>
                  </>
                ))
              }

              <div className="flex items-center gap-2 w-full">
                <Radio name="choices" id="radio-manual" value="null" checked={chosenChoiceIndex === NULL_JSON_CHOICE} onChange={() => setChosenChoiceIndex(NULL_JSON_CHOICE)} />
                <Label htmlFor="radio-manual" className="w-full">
                  <div className="flex flex-row justify-between items-center">
                    <JSONPretty theme={theme} data="null" />
                    <Badge size="sm" href="#">Remove JSON</Badge>
                  </div>
                </Label>
              </div>

              <hr className="w-full h-0.5 mx-auto bg-gray-200 border-0 rounded-sm dark:bg-gray-600"></hr>

              <div className="flex items-center gap-2 w-full">
                <Radio name="choices" id="radio-manual" value="manual" checked={chosenChoiceIndex === MANUAL_JSON_CHOICE} onChange={() => setChosenChoiceIndex(MANUAL_JSON_CHOICE)} />
                <Label htmlFor="radio-manual" className="w-full">
                  <div className="grid grid-flow-col cols-2 gap-2">
                    <Textarea placeholder="Enter manual json" className="col-span-1" rows={6} value={manualJson} onChange={onManualJsonChange} />
                    <JSONPretty theme={theme} data={manualJson} className="col-span-1" />
                  </div>
                </Label>
              </div>
            </fieldset>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onUpdateRequisite} priority="primary" variant="filled">Confirm</Button>
            <Button onClick={onCloseModal}>Decline</Button>
          </Modal.Footer>
        </Modal>
      </div >
    </>
  )
}

export default Requisites