import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"
import { useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, GripVerticalIcon } from "lucide-react"
import { cn } from "@/lib/utils";

export interface TableProps<T> {
    table: TanStackTable<T>;
}

const AdvancedTable = <T,>({ table }: TableProps<T>) => {
    const columns = table.getAllColumns();
    const rows = table.getRowModel().rows;
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const [isResizing, setIsResizing] = useState(false);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="bg-background">
                <Table
                    style={{
                        width: table.getTotalSize(),
                    }}
                    className={cn(isResizing && "select-none")}
                >
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: header.getSize(),
                                                position: "relative",
                                            }}
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
                                                    {header.column.columnDef.enableResizing !== false && (
                                                        <div
                                                            onMouseDown={header.getResizeHandler()}
                                                            onTouchStart={header.getResizeHandler()}
                                                            className="absolute right-0 top-0 h-full w-1 select-none touch-none bg-border cursor-col-resize hover:bg-primary opacity-50 hover:opacity-100 transition-opacity"
                                                            style={{
                                                                userSelect: isResizing ? "none" : "auto",
                                                            }}
                                                        >
                                                            <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
                                                                <GripVerticalIcon className="size-2.5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                </Table>
            </div>
            <ScrollArea className="flex-1">
                <Table
                    style={{
                        width: table.getTotalSize(),
                    }}
                    className={cn(isResizing && "select-none")}
                >
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
                                            style={{
                                                width: cell.column.getSize(),
                                            }}
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
                </Table>
            </ScrollArea>
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
        </div>
    )
}

export default AdvancedTable