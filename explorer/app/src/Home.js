import React, { Component } from "react";
import Header from "./Header";
import Bundle from "./bundle/Bundle";
import Import from "./import/Import";
// noopener noreferrer

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

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
    const pathname = window.location.pathname;

    const initialState = parseQuery(window.location.search);

    let Page;

    if (pathname === "/bundle") Page = Bundle;

    if (pathname === "/import") Page = Import;

    return (
      <div className="App">
        <Header />
        {Page && <Page {...initialState} />}
      </div>
    );
  }
}

export default Home;
