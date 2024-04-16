var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createServer } from 'http';
import { Room, Server } from '@colyseus/core';
import { Schema, type } from '@colyseus/schema';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
class MySchema extends Schema {
    constructor() {
        super(...arguments);
        this.str = '';
        this.num = 0;
    }
}
__decorate([
    type('string'),
    __metadata("design:type", Object)
], MySchema.prototype, "str", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Object)
], MySchema.prototype, "num", void 0);
class MyRoom extends Room {
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
//# sourceMappingURL=test.js.map