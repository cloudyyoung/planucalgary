import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table"

import { Button } from "./ui/button";

export interface TableProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTable = <T,>({ table }: TableProps<T>) => {
    const columns = table.getAllColumns();
    const rows = table.getRowModel().rows;

    return (
        <Table>
            <TableHeader className="sticky top-0 bg-background shadow-md">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            )
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody className="overflow-auto flex-1">
                {rows?.length ? (
                    rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            <TableCaption className="sticky bottom-0 bg-background p-2">
                <div className="flex flex-row items-center justify-end gap-2">
                    <p>Page {table.getState().pagination.pageIndex + 1}/{table.getPageCount()} ({table.getRowCount()} rows)</p>
                    <Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Prev</Button>
                    <Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button>
                </div>
            </TableCaption>
        </Table>
    )
}

export default AdvancedTable