import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
import Header from "./Header";
// noopener noreferrer

const Bundle = lazy(() => import("./bundle/Bundle"));
const Import = lazy(() => import("./import/Import"));

class Home extends Component {
  constructor(props) {
    super(props);

    this.changeSelected = this.changeSelected.bind(this);
  }

  state = {
    selected: null
  };

  changeSelected(selected) {
    this.setState({ selected });
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header/>
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route path="/bundle" component={Bundle}></Route>
              <Route path="/import" component={Import}></Route>
            </Switch>
          </Suspense>
        </div>
      </Router>
    );
  }
}

export default Home;
