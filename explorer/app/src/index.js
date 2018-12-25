import React from "react";
import ReactDOM from "react-dom";
import Home from "./Home";

import * as serviceWorker from "./serviceWorker";
import "./index.css";

ReactDOM.render(<Home />, document.getElementById("root"));
serviceWorker.register();
