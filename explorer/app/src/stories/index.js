import React from "react";
import { storiesOf } from "@storybook/react";
import ByTypeBarChart from "../bundle/ByTypeBarChart";
import "../index.css";
import DEFAULT_TOTALS from "./data/filetype.json";

storiesOf("Bundle Page: ByTypeBarChart", module)
  .add("no values", () => <ByTypeBarChart />)
  .add("with default values", () =>
    <ByTypeBarChart totalsByType={DEFAULT_TOTALS} />
  );
