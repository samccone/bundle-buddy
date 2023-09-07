import React, {Component} from 'react';
import * as Sentry from '@sentry/browser';
import {ReportErrorUri} from './report_error';

class ErrorBoundry extends Component<{}, {error: Error | null}> {
  constructor(props: {}) {
    super(props);
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: 'https://9e475abe454047779775876c0d1af187@sentry.io/1365297',
      });
    }
    this.state = {error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (process.env.NODE_ENV === 'production') {
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
    if (this.state.error) {
      const errorReport = new ReportErrorUri();
      errorReport.addError('Uncaught application error', this.state.error);

      return (
        <div>
          <p>
            <span role="img" aria-label="shrug emoji">
              🤷
            </span>{' '}
            error encountered, please&nbsp;
            <a target="_blank" rel="noopener noreferrer" href={errorReport.toUri()}>
              file a bug!
            </a>
          </p>
          <pre>
            {this.state.error.message}
            <br />
            ---------------
            <br />
            {this.state.error.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundry;
