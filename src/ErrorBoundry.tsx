import { Component } from "react";
import * as Sentry from "@sentry/browser";

class ErrorBoundry extends Component {
  constructor(props: {}) {
    super(props);
    Sentry.init({
      dsn: "https://9e475abe454047779775876c0d1af187@sentry.io/1365297"
    });
    this.state = { error: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (process.env.NODE_ENV === "production") {
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        });
        Sentry.captureException(error);
      });
    } else {
      console.error(error, errorInfo);
    }
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundry;
