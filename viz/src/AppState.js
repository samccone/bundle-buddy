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

    const match = props.match.params;
    this.state = {
      selectedBundles: (match && match.id) || null
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.setState({
        selectedBundles: this.props.match.params.id || null
      });
    }
  }

  updateSelectedBundles(newBundle) {
    if (newBundle === this.state.selectedBundles) {
      this.props.history.push("");
    } else {
      this.props.history.push(newBundle);
    }
  }

  clearSelectedBundles() {
    this.setState({
      selectedBundles: null
    });
  }

  render() {
    console.log("in app state", this.props);
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <App passedData={this.props.passedData} appState={this} />
      </MuiThemeProvider>
    );
  }
}
export default AppState;
