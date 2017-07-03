import { scaleQuantize } from "d3-scale";
import { blueGrey100, teal100 } from "material-ui/styles/colors";

export const colorScale = scaleQuantize()
.domain([1, 5])
.range([teal100, "#ffafb6", "#ff616f", "#d21c5b", "#6d253e"]);
