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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react"

export interface TableProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTable = <T,>({ table }: TableProps<T>) => {
    const columns = table.getAllColumns();
    const rows = table.getRowModel().rows;
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;

    return (
        <Table>
            <TableHeader className="sticky top-0 bg-background shadow-md">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : (
                                        <button
                                            className={`flex items-center gap-2 ${header.column.getCanSort() ? "cursor-pointer select-none" : "cursor-default"}`}
                                            type="button"
                                            onClick={header.column.getToggleSortingHandler()}
                                            disabled={!header.column.getCanSort()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getCanSort() ? (
                                                header.column.getIsSorted() === "asc" ? (
                                                    <ArrowUp className="h-4 w-4" />
                                                ) : header.column.getIsSorted() === "desc" ? (
                                                    <ArrowDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronsUpDown className="h-4 w-4" />
                                                )
                                            ) : null}
                                        </button>
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
                    <p>Page {currentPage}/{pageCount} ({table.getRowCount()} rows)</p>
                    <Select
                        value={String(currentPage)}
                        onValueChange={(value) => table.setPageIndex(Number(value) - 1)}
                        disabled={pageCount === 0}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue placeholder="Page" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: pageCount }).map((_, idx) => {
                                const pageNumber = idx + 1;
                                return (
                                    <SelectItem key={pageNumber} value={String(pageNumber)}>
                                        {pageNumber}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <Button variant="secondary" size="icon" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} aria-label="Previous page">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} aria-label="Next page">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </TableCaption>
        </Table>
    )
}

export default AdvancedTable