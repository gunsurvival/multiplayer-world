import { createServer } from 'http';
import { Room, Server } from '@colyseus/core';
import { Schema, type } from '@colyseus/schema';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';

class MySchema extends Schema {
  @type('string') str = '';
  @type('number') num = 0;
}

class MyRoom extends Room<MySchema> {
  onCreate() {
    this.setState(new MySchema());
    this.onMessage('my_message', (client, message) => {
      console.log('received message from', client.sessionId, ':', message);
    });
    this.onMessage('change_x', (client) => {
      this.state.str = String(Math.random());
    });
  }
}

const app = express();
const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
    pingInterval: 5000,
    pingMaxRetries: 3,
  }),
});
server.listen(3000).catch(console.error);
server.define('my_room', MyRoom);
