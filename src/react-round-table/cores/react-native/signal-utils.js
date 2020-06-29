import io from 'socket.io-client';
import {handleConnectEvent, handleMessageEvent} from './event-utils';

// single root socket
let _socket = null;

// send message signal to server
export const sendMessage = message => {
  if (_socket) {
    console.debug(`Send Message: ${message.id}`);
    _socket.send(message);
  }
};

// connect to server
export const connect = address => {
  if (_socket) return;
  console.debug(`Connect to Round Table server: ${address}/roundTable`);
  _socket = io(`${address}/roundTable`);
  _socket.on('connect', () => handleConnectEvent(_socket));
  _socket.on('message', message => handleMessageEvent(message));
};
