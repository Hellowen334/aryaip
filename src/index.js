import 'core-js/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch'; // eski webOS'ta fetch polyfill
import App from './App';

ReactDOM.render(
  React.createElement(App),
  document.getElementById('root')
);