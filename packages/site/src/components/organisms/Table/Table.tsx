import styled from "@emotion/styled";
import {
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableCellProps as MuiTableCellProps,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableProps as MuiTableProps,
  TableRow as MuiTableRow,
} from "@mui/material";
import React from "react";

export type ColumnProps<Datum> = {
  label: React.ReactNode;
  getValue: (datum: Datum, index: number) => React.ReactNode;
} & MuiTableCellProps;

type TableClellProps<Datum> = {
  datum: Datum;
  datumIndex: number;
  column: ColumnProps<Datum>;
};

function TableClell<Datum>({
  datum,
  datumIndex,
  column,
}: TableClellProps<Datum>) {
  const { label, getValue, ...rest } = column;

  return <MuiTableCell {...rest}>{getValue(datum, datumIndex)}</MuiTableCell>;
}

function TableHeadCell<Datum>({
  column,
}: Omit<TableClellProps<Datum>, "datum">) {
  const { label, getValue, ...rest } = column;

  return <MuiTableCell {...rest}>{label}</MuiTableCell>;
}

type TableRowProps<Datum> = {
  datum: Datum;
  datumIndex: number;
  columns: Array<ColumnProps<Datum>>;
};

function TableRow<Datum>({ datum, columns, datumIndex }: TableRowProps<Datum>) {
  return (
    <MuiTableRow>
      {columns.map((column, index) => (
        <TableClell
          key={index}
          datum={datum}
          datumIndex={datumIndex}
          column={column}
        />
      ))}
    </MuiTableRow>
  );
}

type TableProps<Datum> = {
  data: Datum[];
  columns: Array<ColumnProps<Datum>>;
} & MuiTableProps;

function Table<Datum>(props: TableProps<Datum>) {
  const { data, columns, ...rest } = props;
  return (
    <MuiTable {...rest}>
      <MuiTableHead>
        <MuiTableRow>
          {columns.map((column, index) => (
            <TableHeadCell key={index} datumIndex={index} column={column} />
          ))}
        </MuiTableRow>
      </MuiTableHead>
      <MuiTableBody>
        {data.map((datum, index) => (
          <TableRow
            key={index}
            datum={datum}
            datumIndex={index}
            columns={columns}
          />
        ))}
      </MuiTableBody>
    </MuiTable>
  );
}

export default Table;
