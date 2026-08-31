import FileDetails from "../bundle/FileDetails";
import { action } from "storybook/actions";
import { directories, directoryColors, processed } from "./fixture";

const meta = {
  title: "FileDetails",
  component: FileDetails,
  args: {
    selected: null,
    changeSelected: action("changeSelected"),
  },
};

export default meta;

export const NoValues = {
  args: {
    directoryColors: {},
    directories: [],
    network: { nodes: [], edges: [] },
    hierarchy: [{ parent: "", name: "rootNode" }],
  },
};

export const WithDefaultValues = {
  args: {
    total: processed.rollups.value,
    network: processed.trimmedNetwork,
    hierarchy: processed.hierarchy,
    directoryColors,
    directories,
  },
};
