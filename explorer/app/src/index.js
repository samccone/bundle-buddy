import React from "react";
import ReactDOM from "react-dom";
import Home from "./home/Home";
import Bundle from "./bundle/Bundle";
import Import from "./import/Import";
import * as serviceWorker from "./serviceWorker";
import "./index.css";

const pathname = window.location.pathname;

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}
const state = parseQuery(window.location.search);

if (pathname === "/home" || pathname === "/")
  ReactDOM.render(<Home />, document.getElementById("root"));

if (pathname === "/bundle")
  ReactDOM.render(
    <Bundle initialState={state} />,
    document.getElementById("root")
  );

if (pathname === "/import")
  ReactDOM.render(<Import />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
