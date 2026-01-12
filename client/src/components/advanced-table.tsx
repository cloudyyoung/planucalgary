import { flexRender, type Table as TanStackTable, type Header } from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
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

interface TableHeaderCellProps<T> {
    header: Header<T, unknown>;
}

const TableHeaderCell = <T,>({ header }: TableHeaderCellProps<T>) => {
    return (
        <TableHead
            key={header.id}
            style={{ width: header.getSize(), maxWidth: header.getSize() }}
            className="relative"
        >
            {header.isPlaceholder ? null : (
                <div className="flex items-center gap-2">
                    <button
                        className={`flex items-center gap-2 flex-1 ${header.column.getCanSort() ? "cursor-pointer select-none" : "cursor-default"}`}
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
                </div>
            )}
        </TableHead>
    )
}

interface AdvancedTableHeaderProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTableHeader = <T,>({ table }: AdvancedTableHeaderProps<T>) => {
    return (
        <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHeaderCell key={header.id} header={header} />
                    ))}
                </TableRow>
            ))}
        </TableHeader>
    )
}

interface AdvancedTableBodyProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTableBody = <T,>({ table }: AdvancedTableBodyProps<T>) => {
    const columns = table.getAllColumns();
    const rows = table.getRowModel().rows;

    return (
        <TableBody>
            {rows?.length ? (
                rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell
                                key={cell.id}
                                style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                            >
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
    )
}

interface AdvancedTablePaginationProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTablePagination = <T,>({ table }: AdvancedTablePaginationProps<T>) => {
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;

    return (
        <div className="bg-gray-50 p-2 border-t">
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
        </div>
    )
}

const AdvancedTable = <T,>({ table }: TableProps<T>) => {
    return (
        <Table>
            <AdvancedTableHeader table={table} />
            <AdvancedTableBody table={table} />
            <AdvancedTablePagination table={table} />
        </Table>
    )
}

export default AdvancedTable