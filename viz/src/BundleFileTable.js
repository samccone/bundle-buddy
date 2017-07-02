import React, { Component } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";

const styles = {
  propContainer: {
    width: 200,
    overflow: "hidden",
    margin: "20px auto 0"
  },
  propToggleHeader: {
    margin: "20px auto 10px"
  }
};

const tableData = [
  {
    name: "John Smith",
    status: "Employed"
  },
  {
    name: "Randal White",
    status: "Unemployed"
  },
  {
    name: "Stephanie Sanders",
    status: "Employed"
  },
  {
    name: "Steve Brown",
    status: "Employed"
  },
  {
    name: "Joyce Whitten",
    status: "Employed"
  },
  {
    name: "Samuel Roberts",
    status: "Employed"
  },
  {
    name: "Adam Moore",
    status: "Employed"
  }
];

export default class BundleFileTable extends Component {
  render() {
    const { rows } = this.props;

    const tableData = Object.keys(rows)
      .map(d => {
        return {
          name: d,
          inBundleCount: rows[d].inBundleCount
        };
      })
      .filter(d => d.inBundleCount > 1)
      .sort((a, b) => b.inBundleCount - a.inBundleCount);

    return (
      <div>
        <Table selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={false}
          >
            <TableRow>
              <TableHeaderColumn>% overlap</TableHeaderColumn>
              <TableHeaderColumn colSpan={3}>
                Source File Name
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            deselectOnClickaway={false}
            showRowHover={false}
            stripedRows={false}
          >
            {tableData.map((row, index) =>
              <TableRow key={index}>
                <TableRowColumn>
                  {row.inBundleCount}
                </TableRowColumn>
                <TableRowColumn colSpan={3} className="left-ellipse">
                  {row.name}
                </TableRowColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}
