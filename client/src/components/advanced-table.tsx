import { flexRender, type Table as TanStackTable, type Header } from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils";

interface TableHeaderCellProps<T> {
    header: Header<T, unknown>;
}

const TableHeaderCell = <T,>({ header }: TableHeaderCellProps<T>) => {
    return (
        <th
            key={header.id}
            style={{ width: header.getSize() }}
            className={cn(
                "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            )}
        >
            {header.isPlaceholder ? null : (
                <Button
                    className="px-0"
                    variant="ghost"
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
                </Button>
            )}
        </th>
    )
}

interface AdvancedTableHeaderProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTableHeader = <T,>({ table }: AdvancedTableHeaderProps<T>) => {
    return (
        <thead className={cn("bg-muted sticky top-0", "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",)}>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr
                    className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",)}
                    key={headerGroup.id}
                >
                    {headerGroup.headers.map((header) => (
                        <TableHeaderCell key={header.id} header={header} />
                    ))}
                </tr>
            ))}
        </thead>
    )
}

interface AdvancedTableBodyProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTableBody = <T,>({ table }: AdvancedTableBodyProps<T>) => {
    const columns = table.getAllColumns();
    const rows = table.getRowModel().rows;

    return (
        <tbody className={cn("[&_tr:last-child]:border-0")}>
            {rows?.length ? (
                rows.map((row) => (
                    <tr
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                        )}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                className={cn(
                                    "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                                )}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length} className="h-24 text-center">
                        No results.
                    </td>
                </tr>
            )}
        </tbody>
    )
}

interface AdvancedTablePaginationProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTablePagination = <T,>({ table }: AdvancedTablePaginationProps<T>) => {
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;

    return (
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
            <Button variant="outline" size="icon" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

export interface TableProps<T> {
    table: TanStackTable<T>;
    className?: string;
}

const AdvancedTable = <T,>({ table, className }: TableProps<T>) => {
    return (
        <div className="flex flex-col w-full h-screen overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto flex-1 relative">
                <table className={cn("text-sm w-full", className)}>
                    <AdvancedTableHeader table={table} />
                    <AdvancedTableBody table={table} />
                </table>
            </div>
            <div className="bg-muted text-muted-foreground text-sm p-2 shrink-0">
                <AdvancedTablePagination table={table} />
            </div>
        </div>
    )
}

export default AdvancedTable