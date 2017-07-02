import React from "react";
import { render } from "react-dom";
import AppState from "./AppState";
import "./index.css";
import injectTapEventPlugin from "react-tap-event-plugin";
import { BrowserRouter as Router, Route } from "react-router-dom";

const target = document.querySelector("#root");
injectTapEventPlugin();
render(
  <Router>
    <div>
      <Route exact path="/" component={AppState} />
      <Route path="/:id" component={AppState} />
    </div>
  </Router>,
  target
);
