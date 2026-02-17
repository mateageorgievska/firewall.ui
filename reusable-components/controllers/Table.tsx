/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Fragment, useEffect, useState } from "react";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  TableFrame,
  TableHeader,
  TableHeaderRow,
  TableHeaderColumn,
  TableBody,
  TableData,
  TableRow,
  TableColumn,
} from "../table-parts";
import { FormattedMessage } from "react-intl";
import { PaginationServerSide } from "../pagination/index";

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({
    itemRank,
  });
  return itemRank.passed;
};
type Props = {
  data: unknown[];
  columns: ColumnDef<any, unknown>[];
  isFetching?: boolean;
  isSorting?: boolean;
  globalFilter?: string;
  setGlobalFilter?: (filterText: string) => void;
  rowSelection?: RowSelectionState;
  setRowSelection?: (value: RowSelectionState) => void;
  setSelectedRows?: (rows: unknown[]) => void;
  autoExpand?: boolean;
  onRowClicked?: (row: unknown) => void;
  colorRow?: string;
  subHeaderComponent?: React.ReactNode;
};

type ServerPaginationProps = Props & {
  totalRecords: number;
  pagination: PaginationState;
  setPagination?: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;
};

export const ServerPagination: React.FC<ServerPaginationProps> = (props) => {
  const {
    data,
    columns,
    isFetching,
    isSorting,
    totalRecords,
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    setSelectedRows,
    autoExpand = false,
    onRowClicked,
    colorRow,
  } = props;
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable<any>({
    data,
    columns,
    pageCount: Math.ceil(totalRecords / pagination.pageSize),
    state: {
      sorting: isSorting ? sorting : [],
      globalFilter,
      pagination,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        setRowSelection?.(updater({}));
      } else {
        setRowSelection?.(updater);
      }
    },
    filterFns: {
      fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
  });

  useEffect(() => {
    if (setRowSelection && setSelectedRows) {
      setSelectedRows(
        table.getSelectedRowModel().flatRows.map((row) => row.original)
      );
    }
  }, [rowSelection, table, setSelectedRows]);

  useEffect(() => {
    if (autoExpand) {
      table.toggleAllRowsExpanded();
    }
  }, [autoExpand, table]);
  return (
    <Fragment>
      <TableFrame bordered>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableHeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta;
                return (
                  <TableHeaderColumn
                    key={header.id}
                    colSpan={header.colSpan}
                    sortable={header.column.getCanSort()}
                    sortDir={header.column.getIsSorted()}
                    onToggleSorting={header.column.getToggleSortingHandler()}
                    align={meta ? meta["textAlign"] : "left"}
                  >
                    {header.isPlaceholder ? null : (
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                    )}
                  </TableHeaderColumn>
                );
              })}
            </TableHeaderRow>
          ))}
        </TableHeader>
        <TableBody>
          {table?.getRowModel().rows.map((row) => {
            return (
              <TableRow
                key={row.id}
                bordered
                hover
                onClick={() => (onRowClicked ? onRowClicked(row) : null)}
                highlight={row.id === colorRow}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <TableData
                      key={cell.id}
                      align={meta ? meta["textAlign"] : "left"}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableData>
                  );
                })}
              </TableRow>
            );
          })}
          <TableRow>
            {isFetching ? (
              <TableColumn colSpan={1000}>
                <div className="flex items-center space-x-4">
                  <FormattedMessage
                    id="table.data"
                    defaultMessage="Fetching data . . ."
                  />
                </div>
              </TableColumn>
            ) : (
              <TableColumn colSpan={1000}>
                <FormattedMessage
                  id="table.showingRows"
                  defaultMessage="Showing {rowLength} of ~ {totalRecords}"
                  values={{
                    rowLength: table.getRowModel().rows.length,
                    totalRecords: totalRecords,
                  }}
                />
              </TableColumn>
            )}
          </TableRow>
        </TableBody>
      </TableFrame>
      <div className="mt-4">
        {autoExpand ? (
          <></>
        ) : (
          <PaginationServerSide
            canNextPage={
              table.getState().pagination.pageIndex < table.getPageCount()
            }
            canPreviousPage={
              table.getState().pagination.pageIndex <= table.getPageCount() &&
              table.getState().pagination.pageIndex > 1
            }
            gotoPage={table.setPageIndex}
            nextPage={table.nextPage}
            pageCount={table.getPageCount()}
            pageIndex={table.getState().pagination.pageIndex}
            previousPage={table.previousPage}
            setPageSize={table.setPageSize}
            pageSize={table.getState().pagination.pageSize}
          />
        )}
      </div>
    </Fragment>
  );
};
