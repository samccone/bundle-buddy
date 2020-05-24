import React, { useMemo } from "react";
import ReactTable from "react-table";

// import { colors } from "../theme";
import { getCSSPercent, getFileSize } from "./stringFormats";
import { ProcessedImportState, TrimmedDataNode } from "../types";

type Column = {
  value: number;
  original: TrimmedDataNode;
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
    d: Column,
    accessor: (d: TrimmedDataNode) => number,
    id: keyof Maxes
  ) {
    return (
      <div
        style={{
          background: directoryColors[d.original.directory] || "black",
          border: "1px solid white",
          height: 8,
          width: d.value ? getCSSPercent(d.value, maxes[id]) : "0px",
          position: "relative",
          top: 15,
          left: getCSSPercent(maxes[id] - accessor(d.original), maxes[id]),
        }}
      />
    );
  }

  return [
    {
      accessor: "text",
      Header: "Name",
      Cell: (d: Column) => {
        return <span style={{ fontSize: 12 }}>{d.value}</span>;
      },
    },
    {
      id: "totalBytes",
      accessor: (d: TrimmedDataNode) => d.totalBytes,
      Header: "Size",
      minWidth: 50,
      label: (d: Column) =>
        `${getFileSize(d.value)}, ${getCSSPercent(d.value, total)}`,
    },
    {
      id: "requires",
      accessor: (d: TrimmedDataNode) => d.requires.length,
      Header: "Direct Requires",
      headerClassName: "rotated",
      minWidth: 25,
    },
    {
      id: "transitiveRequires",
      accessor: (d: TrimmedDataNode) => d.transitiveRequires.length,
      Header: "All Requires",
      headerClassName: "rotated",
      minWidth: 25,
    },
    {
      id: "transitiveRequiresSize",
      accessor: (d: TrimmedDataNode) => d.transitiveRequiresSize,
      Header: "All Requires Size",
      headerClassName: "rotated",
      minWidth: 50,
      label: (d: Column) => getFileSize(d.value),
    },
    {
      id: "requiredBy",
      accessor: (d: TrimmedDataNode) => d.requiredBy.length,
      Header: "Direct Required By",
      headerClassName: "rotated",
      minWidth: 25,
    },

    {
      id: "transitiveRequiredBy",
      accessor: (d: TrimmedDataNode) => d.transitiveRequiredBy.length,
      Header: "All Required By",
      headerClassName: "rotated",
      minWidth: 25,
    },
  ].map((d) => {
    return {
      ...d,
      Cell:
        d.Cell ||
        ((c: Column) => (
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
        )),
    };
  });
}

function getTrProps(changeSelected: Props["changeSelected"]) {
  return (state: any, row: any) => {
    return {
      onClick: () => {
        changeSelected(row.original.id);
      },
      className: "pointer",
    };
  };
}

function filterMethod(filter: any, row: any, column: any) {
  return (
    column.accessor(row).toLowerCase().indexOf(filter.value.toLowerCase()) !==
    -1
  );
}

const defaultSorted = [
  {
    id: "totalBytes",
    desc: true,
  },
];

type Props = {
  total?: number;
  changeSelected: React.Dispatch<string>;
  directoryColors: { [dir: string]: string };
  network: ProcessedImportState["trimmedNetwork"];
};

export default function FileDetails(props: Props) {
  const {
    network = {} as ProcessedImportState["trimmedNetwork"],
    changeSelected,
    directoryColors,
    total,
  } = props;
  const { nodes = [] } = network;

  const columns = useMemo(() => getColumns(directoryColors, nodes, total), [
    directoryColors,
    nodes,
    total,
  ]);

  const trProps = useMemo(() => getTrProps(changeSelected), [changeSelected]);

  return (
    <div>
      <ReactTable
        // getProps={getProps}
        data={nodes}
        key="SeasonsList"
        getTrProps={trProps}
        // getTdProps={tdProps}
        defaultFilterMethod={filterMethod as any}
        defaultSortDesc={true}
        defaultSorted={defaultSorted}
        pageSize={nodes.length || 25}
        defaultPageSize={nodes.length || 25}
        showPagination={false}
        columns={columns}
        className=" -highlight"
      />
    </div>
  );
}
