import React from "react";
import ReactDOM from "react-dom";
import Home from "./home/Home";
import Bundle from "./bundle/Bundle";
import Import from "./import/Import";
import * as serviceWorker from "./serviceWorker";
import "./index.css";

const pathname = window.location.pathname;

if (pathname === "/home" || pathname === "/")
  ReactDOM.render(<Home />, document.getElementById("root"));

if (pathname === "/bundle")
  ReactDOM.render(<Bundle />, document.getElementById("root"));

if (pathname === "/import")
  ReactDOM.render(<Import />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
