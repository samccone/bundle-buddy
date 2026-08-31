import Report from "../bundle/Report";
// The sample project has no duplicates, so this story keeps its own fixture to
// show the populated state.
import DUPLICATE_NODE_MODULES from "./data/duplicateNodeModules.json";

const meta = {
  title: "Report",
  component: Report,
};

export default meta;

export const NoValues = {};

export const WithDefaultValues = {
  args: { duplicateNodeModules: DUPLICATE_NODE_MODULES },
};
