import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SocketProvider } from 'socket.io-react';
import {proxy} from '../package.json'
import io from 'socket.io-client';
import p2p from 'socket.io-p2p';
import * as serviceWorker from './serviceWorker';
const socket = io(proxy);
const p2pCon = new p2p(socket,{numClients:6});
p2pCon.usePeerConnection = true;

ReactDOM.render(
    <BrowserRouter>
      <SocketProvider socket={p2pCon}>
        <App socket={p2pCon}/>
      </SocketProvider>
    </BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
