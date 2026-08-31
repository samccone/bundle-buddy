import React from "react";
import ByTypeBarChart from "../bundle/Header";
import { processed } from "./fixture";

const meta = {
  title: "ByTypeBarChart",
  component: ByTypeBarChart,
  args: {
    download: <button className="download paper">download analysis</button>,
  },
};

export default meta;

export const NoValues = {};

export const WithDefaultValues = {
  args: { rollups: processed.rollups },
};
