import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function Table({
    className,
    cardGrid = true,
    toolbarActions,
    searchValue,
    onSearchChange,
    clientPagination = true,
    ...props
}: React.ComponentProps<'table'> & {
    cardGrid?: boolean;
    toolbarActions?: React.ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    clientPagination?: boolean;
}) {
    const tableRef = React.useRef<HTMLTableElement>(null);
    const [uncontrolledSearch, setUncontrolledSearch] = React.useState('');
    const [filterOptions, setFilterOptions] = React.useState<
        { index: number; label: string; options: string[] }[]
    >([]);
    const [selectedFilters, setSelectedFilters] = React.useState<
        Record<number, string>
    >({});
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [resultCount, setResultCount] = React.useState(0);
    const [dateColumnIndex, setDateColumnIndex] = React.useState<number | null>(
        null,
    );
    const search = searchValue ?? uncontrolledSearch;

    function updateSearch(value: string) {
        if (onSearchChange) {
            onSearchChange(value);
        } else {
            setUncontrolledSearch(value);
        }

        setCurrentPage(1);
    }

    React.useLayoutEffect(() => {
        const table = tableRef.current;

        if (!table) {
            return;
        }

        const headings = Array.from(
            table.querySelectorAll('thead tr:first-child th'),
        );
        const headingLabels = headings.map(
            (heading) => heading.textContent?.trim() ?? '',
        );
        const dateIndex = headingLabels.findIndex((label) =>
            /date|created at|updated at|scheduled at|visit date/i.test(label),
        );
        const detectedDateColumnIndex = dateIndex >= 0 ? dateIndex : null;
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const valuesByColumn = headingLabels.map(() => new Set<string>());

        rows.forEach((row) => {
            const cells = Array.from(row.children).filter(
                (cell): cell is HTMLTableCellElement =>
                    cell instanceof HTMLTableCellElement,
            );
            cells.forEach((cell, index) => {
                if (
                    cardGrid &&
                    !cell.hasAttribute('colspan') &&
                    headings[index]
                ) {
                    cell.dataset.label =
                        headings[index].textContent?.trim() ?? 'Details';
                }
            });

            cells.forEach((cell, index) => {
                const value = cell.textContent?.trim();

                if (value && !cell.hasAttribute('colspan') && valuesByColumn[index]) {
                    valuesByColumn[index].add(value);
                }
            });
        });

        const nextFilterOptions = headingLabels.flatMap((label, index) => {
            const normalizedLabel = label.toLowerCase();
            const isDate = index === dateIndex;
            const isActionColumn = /action|description|notes?|address|email|phone|amount|price|total|revenue|name|patient|doctor|clinic|appointment|reservation|date|day|time|quantity|stock|id|code/i.test(
                label,
            );
            const options = Array.from(valuesByColumn[index]).sort((a, b) =>
                a.localeCompare(b),
            );

            if (
                isDate ||
                isActionColumn ||
                (normalizedLabel !== 'status' && options.length < 2) ||
                options.length > 12
            ) {
                return [];
            }

            return [{ index, label, options }];
        });
        setFilterOptions((current) =>
            JSON.stringify(current) === JSON.stringify(nextFilterOptions)
                ? current
                : nextFilterOptions,
        );
        setDateColumnIndex((current) =>
            current === detectedDateColumnIndex
                ? current
                : detectedDateColumnIndex,
        );

        const normalizedSearch = search.trim().toLocaleLowerCase();
        const matchingRows = rows.filter((row) => {
            const cells = Array.from(row.children).filter(
                (cell): cell is HTMLTableCellElement =>
                    cell instanceof HTMLTableCellElement,
            );

            if (cells.some((cell) => cell.hasAttribute('colspan'))) {
                return false;
            }

            const matchesSearch =
                !normalizedSearch ||
                row.textContent?.toLocaleLowerCase().includes(normalizedSearch);
            const matchesSelects = filterOptions.every(({ index }) => {
                const selectedValue = selectedFilters[index];

                return (
                    !selectedValue ||
                    cells[index]?.textContent?.trim() === selectedValue
                );
            });
            const rowDate =
                dateIndex >= 0
                    ? parseTableDate(cells[dateIndex]?.textContent ?? '')
                    : '';
            const matchesStartDate = !startDate || (rowDate !== '' && rowDate >= startDate);
            const matchesEndDate = !endDate || (rowDate !== '' && rowDate <= endDate);

            return Boolean(matchesSearch && matchesSelects && matchesStartDate && matchesEndDate);
        });

        setResultCount((current) =>
            current === matchingRows.length ? current : matchingRows.length,
        );
        const effectivePage = clientPagination ? currentPage : 1;
        const firstVisibleIndex = (effectivePage - 1) * pageSize;
        const lastVisibleIndex = clientPagination
            ? firstVisibleIndex + pageSize
            : matchingRows.length;
        const visibleRows = new Set(
            matchingRows.slice(firstVisibleIndex, lastVisibleIndex),
        );

        rows.forEach((row) => {
            const hasEmptyState = Array.from(row.children).some(
                (cell) => cell instanceof HTMLTableCellElement && cell.hasAttribute('colspan'),
            );
            row.toggleAttribute(
                'hidden',
                hasEmptyState ? matchingRows.length > 0 : !visibleRows.has(row),
            );
        });

        const pageCount = Math.max(1, Math.ceil(matchingRows.length / pageSize));

        if (clientPagination && currentPage > pageCount) {
            setCurrentPage(pageCount);
        }
    }, [
        cardGrid,
        clientPagination,
        currentPage,
        endDate,
        filterOptions,
        pageSize,
        props.children,
        search,
        selectedFilters,
        startDate,
    ]);

    const hasActiveFilters =
        Object.values(selectedFilters).some(Boolean) || Boolean(startDate) || Boolean(endDate) || Boolean(search);
    const pageCount = Math.max(1, Math.ceil(resultCount / pageSize));
    const firstResult = resultCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const lastResult = Math.min(currentPage * pageSize, resultCount);

    return (
        <div className="space-y-3">
             
            <div
                data-slot="table-container"
                className={cn(
                    'relative w-full min-w-0',
                    !cardGrid && 'overflow-x-auto',
                )}
            >
                <table
                    ref={tableRef}
                    data-slot="table"
                    data-card-grid={cardGrid ? 'true' : undefined}
                    className={cn('w-full caption-bottom text-sm', className)}
                    {...props}
                />
            </div>
            {(clientPagination || resultCount > 0) && (
                <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground" aria-live="polite">
                        Showing {firstResult} to {lastResult} of {resultCount}
                    </p>
                    {clientPagination && (
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <label className="flex items-center gap-2 text-muted-foreground">
                                <span>Rows per page</span>
                                <select
                                    value={pageSize}
                                    onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setCurrentPage(1);
                                    }}
                                    aria-label="Rows per page"
                                    className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
                                >
                                    {[10, 20, 50].map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </label>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    className="h-8 rounded-md border border-input px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="min-w-16 text-center text-muted-foreground">
                                    {currentPage} / {pageCount}
                                </span>
                                <button
                                    type="button"
                                    disabled={currentPage >= pageCount}
                                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                                    className="h-8 rounded-md border border-input px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function parseTableDate(value: string): string {
    const isoDate = value.match(/\b\d{4}-\d{2}-\d{2}\b/);

    if (isoDate) {
        return isoDate[0];
    }

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime())
        ? ''
        : parsedDate.toISOString().slice(0, 10);
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead
            data-slot="table-header"
            className={cn('[&_tr]:border-b', className)}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
                className,
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
                className,
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
                className,
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    const { children, ...cellProps } = props;

    return (
        <td
            data-slot="table-cell"
            className={cn(
                'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
                className,
            )}
            {...cellProps}
        >
            <div data-slot="table-cell-content" className="min-w-0">
                {children}
            </div>
        </td>
    );
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('mt-4 text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};
