import { flexRender, type Table as TanStackTable, type Header, RowData } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef, useEffect, useState } from "react"
import { useDebounce } from "react-use"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils";
import { IndeterminateProgress } from "./ui/indeterminate-progress";

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
    filterOptions?: TValue[] | FilterOption[]
  }
}

export type FilterOption = {
  label: string;
  value: string;
}

interface TableHeaderCellProps<T> {
  header: Header<T, unknown>;
}

const TableHeaderCell = <T,>({ header }: TableHeaderCellProps<T>) => {
  return (
    <th
      key={header.id}
      style={{
        display: 'flex',
        width: header.getSize(),
        minWidth: header.getSize(),
        maxWidth: header.getSize(),
      }}
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
  isFetching: boolean;
}

const AdvancedTableHeader = <T,>({ table, isFetching }: AdvancedTableHeaderProps<T>) => {
  return (
    <thead
      className={cn("bg-muted sticky top-0 z-10")}
      style={{ display: 'grid', position: 'sticky', top: 0, zIndex: 10 }}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <>
          <tr
            className={cn("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",)}
            key={headerGroup.id}
            style={{ display: 'flex', width: '100%' }}
          >
            {headerGroup.headers.map((header) => (
              <TableHeaderCell key={header.id} header={header} />
            ))}
          </tr>
          <tr key={`${headerGroup.id}-filters`} style={{ display: 'flex', width: '100%' }}>
            {headerGroup.headers.map((header) => (
              <th
                key={`${header.id}-filter`}
                className={cn(header.column.getCanFilter() && "px-2 pb-2")}
                style={{
                  display: 'flex',
                  width: header.getSize(),
                  minWidth: header.getSize(),
                  maxWidth: header.getSize(),
                }}
              >
                {header.column.getCanFilter() ? (
                  <ColumnFilter header={header} />
                ) : null}
              </th>
            ))}
          </tr>
        </>
      ))}
      {
        isFetching && (
          <tr style={{ display: 'flex', width: '100%' }}>
            <td className="absolute bottom-0 w-full">
              <IndeterminateProgress />
            </td>
          </tr>
        )
      }
    </thead>
  )
}

interface AdvancedTableBodyProps<T> {
  table: TanStackTable<T>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ColumnFilter = <T, TValue>({ header }: { header: Header<T, unknown> }) => {
  const column = header.column;
  const filterValue = column.getFilterValue() as (string | undefined)
  const filterVariant = column.columnDef.meta?.filterVariant

  const [value, setValue] = useState(filterValue ?? '');
  const [debouncedValue, setDebouncedValue] = useState('');

  useDebounce(() => {
    setDebouncedValue(value);
  }, 300, [value]);

  useEffect(() => {
    const filteredValue = debouncedValue === '' ? undefined : debouncedValue;
    column.setFilterValue(filteredValue);
  }, [column, debouncedValue]);

  if (filterVariant === 'text' || filterVariant === undefined) {
    return (
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`Filter ${String(column.columnDef.header)}...`}
        className="h-8 text-sm font-normal"
      />
    );
  } else if (filterVariant === 'select') {
    const options = column.columnDef.meta?.filterOptions as (TValue[] | FilterOption[]) ?? [];

    const isFilterOption = (opt: any): opt is FilterOption => {
      return typeof opt === 'object' && 'label' in opt && 'value' in opt;
    }

    return (
      <Select
        defaultValue="all"
        value={filterValue ?? 'all'}
        onValueChange={(value) => column.setFilterValue(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="h-8 text-sm font-normal w-full">
          <SelectValue placeholder={`Filter ${String(column.columnDef.header)}...`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All
          </SelectItem>
          {options.map((option) => {
            const value = isFilterOption(option) ? option.value : String(option);
            const label = isFilterOption(option) ? option.label : String(option);
            return (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  return null;
}

interface TableBodyRowProps {
  row: any;
  virtualRow: any;
  rowVirtualizer: any;
}

const TableBodyRow = ({ row, virtualRow, rowVirtualizer }: TableBodyRowProps) => {
  return (
    <tr
      data-index={virtualRow.index}
      ref={(node) => rowVirtualizer.measureElement(node)}
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      )}
      style={{
        display: 'flex',
        position: 'absolute',
        transform: `translateY(${virtualRow.start}px)`,
        width: '100%',
      }}
    >
      {row.getVisibleCells().map((cell: any) => (
        <td
          key={cell.id}
          className={cn(
            "flex items-center p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-wrap break-words",
          )}
          style={{
            width: cell.column.getSize(),
            minWidth: cell.column.getSize(),
            maxWidth: cell.column.getSize(),
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

const AdvancedTableBody = <T,>({ table, scrollContainerRef }: AdvancedTableBodyProps<T>) => {
  const columns = table.getAllColumns();
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 44,
    measureElement:
      typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0")}
      style={{
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {rows?.length ? (
        rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <TableBodyRow
              key={row.id}
              row={row}
              virtualRow={virtualRow}
              rowVirtualizer={rowVirtualizer}
            />
          );
        })
      ) : (
        <tr style={{ display: 'flex', width: '100%' }}>
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
  header?: React.ReactNode;
  isLoading?: boolean;
  isFetching?: boolean;
}

const AdvancedTable = <T,>({ table, className, header, isLoading = false, isFetching = false }: TableProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentPage = table.getState().pagination.pageIndex;
  const currentFiltering = table.getState().columnFilters;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage, currentFiltering]);

  useEffect(() => {
    table.resetPageIndex();
  }, [currentFiltering]);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden relative">
      {header && (
        <div className="p-2 bg-muted flex flex-row gap-2">
          {header}
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
          <Spinner className="size-8" />
        </div>
      )}
      <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto flex-1 relative">
        <table className={cn("text-sm w-full", className)} style={{ display: 'grid' }}>
          <AdvancedTableHeader table={table} isFetching={isFetching} />
          <AdvancedTableBody table={table} scrollContainerRef={scrollContainerRef} />
        </table>
      </div>
      <div className="bg-muted text-muted-foreground text-sm p-2 shrink-0">
        <AdvancedTablePagination table={table} />
      </div>
    </div>
  )
}

export default AdvancedTable