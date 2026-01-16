import { flexRender, type Table as TanStackTable, type Header } from "@tanstack/react-table"
import { useRef, useEffect, useState } from "react"
import { useThrottle } from "react-use"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
                "h-10 px-2 text-left align-middle text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            )}
        >
            {header.isPlaceholder ? null : (
                <Button
                    className="px-0 font-bold"
                    variant="ghost"
                    onClick={header.column.getToggleSortingHandler()}
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
                        ) : header.column.getCanSort() ? (
                            <ChevronsUpDown className="h-4 w-4" />
                        ) : null
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
        <thead className={cn("bg-muted sticky top-0", "h-10 px-2 text-left align-middle text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",)}>
            {table.getHeaderGroups().map((headerGroup) => (
                <>
                    <tr
                        className={cn("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",)}
                        key={headerGroup.id}
                    >
                        {headerGroup.headers.map((header) => (
                            <TableHeaderCell key={header.id} header={header} />
                        ))}
                    </tr>
                    <tr key={`${headerGroup.id}-filters`}>
                        {headerGroup.headers.map((header) => (
                            <th key={`${header.id}-filter`} className="px-2 pb-2">
                                {header.column.getCanFilter() ? (
                                    <ColumnFilterInput header={header} />
                                ) : null}
                            </th>
                        ))}
                    </tr>
                </>
            ))}
        </thead>
    )
}

interface AdvancedTableBodyProps<T> {
    table: TanStackTable<T>;
}

const ColumnFilterInput = <T,>({ header }: { header: Header<T, unknown> }) => {
    const column = header.column;
    const columnFilterValue = (column.getFilterValue() as string) ?? "";
    const [value, setValue] = useState(columnFilterValue);
    const throttledValue = useThrottle(value, 300);

    useEffect(() => {
        column.setFilterValue(throttledValue || undefined);
    }, [column, throttledValue]);

    useEffect(() => {
        if (columnFilterValue !== value) {
            setValue(columnFilterValue);
        }
    }, [columnFilterValue]);

    return (
        <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={`Filter ${String(column.columnDef.header)}...`}
            className="h-8 text-sm font-normal"
        />
    );
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
    const pageSize = table.getState().pagination.pageSize;

    const onPreviousPage = () => {
        table.previousPage();
    }

    const onNextPage = () => {
        table.nextPage();
    }

    const onPageNumberChange = (page: number) => {
        table.setPageIndex(page - 1);
    }

    const onPageSizeChange = (size: number) => {
        table.setPageSize(size);
    }

    return (
        <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
                <Button variant="outline" size="icon" disabled={!table.getCanPreviousPage()} onClick={onPreviousPage} aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled={!table.getCanNextPage()} onClick={onNextPage} aria-label="Next page">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Select
                    value={String(currentPage)}
                    onValueChange={(value) => onPageNumberChange(Number(value))}
                    disabled={pageCount === 0}
                >
                    <SelectTrigger className="w-28 bg-background">
                        <SelectValue placeholder="Page" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: pageCount }).map((_, idx) => {
                            const pageNumber = idx + 1;
                            return (
                                <SelectItem key={pageNumber} value={String(pageNumber)}>
                                    Page {pageNumber}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                <Select
                    value={String(pageSize)}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                    <SelectTrigger className="w-28 bg-background">
                        <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 25, 50, 100, 250, 500].map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size} rows
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row items-center gap-2">
                <p>Total {table.getRowCount()} rows</p>
            </div>
        </div>
    )
}

export interface TableProps<T> {
    table: TanStackTable<T>;
    className?: string;
}

const AdvancedTable = <T,>({ table, className }: TableProps<T>) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const currentPage = table.getState().pagination.pageIndex;

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [currentPage]);

    return (
        <div className="flex flex-col w-full h-screen overflow-hidden">
            <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto flex-1 relative">
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