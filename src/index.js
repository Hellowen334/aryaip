import 'core-js/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch'; // eski webOS'ta fetch polyfill
import App from './App';

window.iptvConfig = {
  type: 'm3u',
  url: 'http://s196.k97d18.com/get.php?username=y79g59t88x68&password=x51x03052023&type=adv_m3u_icon&output=ts'
};

ReactDOM.render(
  React.createElement(App),
  document.getElementById('root')
);