import React, { useMemo } from "react";
import { useTable, useSortBy } from "react-table";

import { getCSSPercent, getFileSize } from "./stringFormats";
import { ProcessedImportState, TrimmedDataNode } from "../types";

type Column = {
  value: number;
  row: { original: TrimmedDataNode };
};

type Maxes = {
  totalBytes: number;
  requires: number;
  requiredBy: number;
  transitiveRequiresSize: number;
  transitiveRequiredBy: number;
  transitiveRequires: number;
};

function getColumns(
  directoryColors: Props["directoryColors"],
  data: TrimmedDataNode[],
  total?: number
) {
  const maxes = {
    totalBytes: 0,
    requires: 0,
    requiredBy: 0,
    transitiveRequiresSize: 0,
    transitiveRequiredBy: 0,
    transitiveRequires: 0,
  };

  data.forEach((d) => {
    maxes.totalBytes = Math.max(maxes.totalBytes, d.totalBytes);
    maxes.transitiveRequiresSize = Math.max(
      maxes.transitiveRequiresSize,
      d.transitiveRequiresSize
    );
    maxes.requires = Math.max(maxes.requires, d.requires.length);
    maxes.transitiveRequires = Math.max(
      maxes.transitiveRequires,
      d.transitiveRequires.length
    );
    maxes.requiredBy = Math.max(maxes.requiredBy, d.requiredBy.length);
    maxes.transitiveRequiredBy = Math.max(
      maxes.transitiveRequiredBy,
      d.transitiveRequiredBy.length
    );
  });

  function getBar(
    // d: Column,
    d: any,
    accessor: (d: TrimmedDataNode) => number,
    id: keyof Maxes
  ) {
    return (
      <div
        style={{
          background: directoryColors[d.row.original.directory] || "black",
          border: "1px solid white",
          height: 8,
          width: d.value ? getCSSPercent(d.value / maxes[id]) : "0px",
          position: "relative",
          top: 15,
          left: getCSSPercent(maxes[id] - accessor(d.row.original), maxes[id]),
        }}
      />
    );
  }

  return [
    {
      accessor: "text" as any,
      Header: "Name",
      Cell: (d: Column) => {
        return d.value;
      },
    },
    {
      id: "totalBytes",
      accessor: (d: TrimmedDataNode) => d.totalBytes,
      Header: "Size",
      minWidth: 100,
      label: (d: Column) =>
        `${getFileSize(d.value)}, ${getCSSPercent(d.value, total)}`,
    },
    {
      id: "requires",
      accessor: (d: TrimmedDataNode) => d.requires.length,
      Header: "Directly Requires",
      minWidth: 25,
    },
    {
      id: "transitiveRequires",
      accessor: (d: TrimmedDataNode) => d.transitiveRequires.length,
      Header: "All Requires",
      minWidth: 25,
    },
    {
      id: "transitiveRequiresSize",
      accessor: (d: TrimmedDataNode) => d.transitiveRequiresSize,
      Header: "All Requires Size",
      minWidth: 50,
      label: (d: Column) => getFileSize(d.value),
    },
    {
      id: "requiredBy",
      accessor: (d: TrimmedDataNode) => d.requiredBy.length,
      Header: "Directly Required By",
      minWidth: 25,
    },

    {
      id: "transitiveRequiredBy",
      accessor: (d: TrimmedDataNode) => d.transitiveRequiredBy.length,
      Header: "All Required By",
      minWidth: 25,
    },
  ].map((d, i) => {
    return {
      ...d,
      sortDescFirst: i === 0 ? false : true,
      Cell:
        d.Cell ||
        ((c: Column) => {
          return (
            <div className="relative">
              {getBar(c, d.accessor, d.id as keyof Maxes)}

              <span
                style={{ fontSize: 12, position: "absolute", top: 0, right: 0 }}
              >
                <span className="right">
                  {d.label ? d.label(c) : !c.value ? "--" : c.value}
                </span>
              </span>
            </div>
          );
        }),
    };
  });
}

function filterMethod(filter: any, row: any, column: any) {
  return (
    column.accessor(row).toLowerCase().indexOf(filter.value.toLowerCase()) !==
    -1
  );
}

type Props = {
  total?: number;
  changeSelected: React.Dispatch<string>;
  directoryColors: { [dir: string]: string };
  network: ProcessedImportState["trimmedNetwork"];
  header?: JSX.Element;
};

export default function FileDetails(props: Props) {
  const {
    network = {} as ProcessedImportState["trimmedNetwork"],
    changeSelected,
    directoryColors,
    total,
    header,
  } = props;
  const { nodes = [] } = network;

  const columns = useMemo(() => getColumns(directoryColors, nodes, total), [
    directoryColors,
    nodes,
    total,
  ]);

  const data = useMemo(() => nodes, [nodes]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns: columns,
      data,
      defaultCanSort: true,
      disableSortRemove: true,
      initialState: { sortBy: [{ id: "totalBytes", desc: true }] } as any,
    } as any,
    useSortBy
  );

  return (
    <table {...getTableProps()} className="Table">
      <thead>
        <tr>
          <th className="top" scope="colgroup" colSpan={columns.length}>
            {header}
          </th>
        </tr>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                className="bottom"
                {...column.getHeaderProps(
                  (column as any).getSortByToggleProps()
                )}
                scope="col"
              >
                {column.render("Header")}
                <span>
                  {(column as any).isSorted
                    ? (column as any).isSortedDesc
                      ? " 🔽"
                      : " 🔼"
                    : ""}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} className="pointer">
              {row.cells.map((cell: any) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    style={{
                      minWidth: cell.column.minWidth,
                      background:
                        cell.column.Header === "Name"
                          ? directoryColors[cell.row.original.directory]
                          : undefined,
                    }}
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
