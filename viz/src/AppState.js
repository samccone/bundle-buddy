import React, { Component } from "react";
import App from "./App";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import theme from "./theme/theme";

class AppState extends Component {
  constructor(props) {
    super(props);

    this.updateSelectedBundles = this.updateSelectedBundles.bind(this);
    this.clearSelectedBundles = this.clearSelectedBundles.bind(this);

    this.state = {
      selectedBundles: null
    };
  }

  updateSelectedBundles(newBundle) {
    this.setState({
      selectedBundles: newBundle
    });
  }

  clearSelectedBundles() {
    this.setState({
      selectedBundles: null
    });
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <App appState={this} />
      </MuiThemeProvider>
    );
  }
}
export default AppState;
