import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import * as serviceWorker from "./serviceWorker";
import "./index.css";

const rootEl = document.getElementById("root");
if (rootEl == null) {
  throw new Error("missing #root element");
}

createRoot(rootEl).render(<App />);

serviceWorker.register();
