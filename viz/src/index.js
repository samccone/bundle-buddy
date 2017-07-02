import React from "react";
import { render } from "react-dom";
import AppState from "./AppState";
import App from "./App";
import "./index.css";
import injectTapEventPlugin from "react-tap-event-plugin";

const target = document.querySelector("#root");
injectTapEventPlugin();
render(<AppState />, target);
