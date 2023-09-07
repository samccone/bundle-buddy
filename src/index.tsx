import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import * as serviceWorker from './serviceWorker';
import './index.css';

const rootEl = document.getElementById('root');

ReactDOM.render(<App />, rootEl);
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    ReactDOM.render(<NextApp />, rootEl);
  });
}

serviceWorker.register();
