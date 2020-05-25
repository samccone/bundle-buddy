import React, { useMemo, Fragment } from "react";
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
      d.transitiveRequires.length - d.requires.length
    );
    maxes.requiredBy = Math.max(maxes.requiredBy, d.requiredBy.length);
    maxes.transitiveRequiredBy = Math.max(
      maxes.transitiveRequiredBy,
      d.transitiveRequiredBy.length - d.requiredBy.length
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
          // background: directoryColors[d.row.original.directory] || "black",
          background: `var(--grey500)`,
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
        return <span className="name">{d.value}</span>;
      },
    },
    {
      id: "totalBytes",
      accessor: (d: TrimmedDataNode) => d.totalBytes,
      Header: "Size",
      minWidth: 150,
      label: (d: Column) => (
        <div className="flex">
          <div style={{ minWidth: "30%" }} className="relative">
            <span
              style={{ fontSize: 12, position: "absolute", top: -10, right: 0 }}
            >
              <b>{getCSSPercent(d.value, total)}</b>
            </span>
          </div>
          <div className="relative" style={{ minWidth: "70%" }}>
            <span
              style={{ fontSize: 12, position: "absolute", top: -10, right: 0 }}
            >
              {getFileSize(d.value)}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "requires",
      accessor: (d: TrimmedDataNode) => d.requires.length,
      Header: "Direct Imports",
      minWidth: 25,
    },
    {
      id: "transitiveRequires",
      accessor: (d: TrimmedDataNode) =>
        d.transitiveRequires.length - d.requires.length,
      Header: "Indirect Imports",
      minWidth: 25,
    },
    {
      id: "transitiveRequiresSize",
      accessor: (d: TrimmedDataNode) => d.transitiveRequiresSize,
      Header: "All Imported Size",
      minWidth: 50,
      format: (d: Column) => getFileSize(d.value),
    },
    {
      id: "requiredBy",
      accessor: (d: TrimmedDataNode) => d.requiredBy.length,
      Header: "Directly Imported By",
      minWidth: 25,
    },

    {
      id: "transitiveRequiredBy",
      accessor: (d: TrimmedDataNode) =>
        d.transitiveRequiredBy.length - d.requiredBy.length,
      Header: "Indirectly Imported By",
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

              {d.label ? (
                d.label(c)
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    position: "absolute",
                    top: 0,
                    right: 0,
                  }}
                >
                  <span className="right">
                    {d.format ? d.format(c) : !c.value ? "--" : c.value}
                  </span>
                </span>
              )}
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
  selected: string | null;
  selectedPanel: any;
};

export default function FileDetails(props: Props) {
  const {
    network = {} as ProcessedImportState["trimmedNetwork"],
    changeSelected,
    directoryColors,
    total,
    header,
    selected,
    selectedPanel,
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
        {rows.map((row: any) => {
          prepareRow(row);
          const id = row.original.id;
          return (
            <Fragment>
              <tr
                {...row.getRowProps()}
                className={`pointer ${
                  id === selected ? "paper selected" : ""
                } `}
                onClick={() => changeSelected(id)}
              >
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
              {id === selected && (
                <tr>
                  <td colSpan={columns.length}>{selectedPanel}</td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
