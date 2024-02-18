var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ArraySchema, Schema, type } from '@colyseus/schema';
import uniqid from 'uniqid';
import { EventData, EventSchema } from "../types/EventData";
import { AsyncEE } from "../utils/AsyncEE";
export class Module extends Schema {
    static create(value) {
        const obj = new this(value);
        obj.init(value);
        return obj;
    }
    events = new ArraySchema();
    ee = new AsyncEE();
    roomClient;
    roomServer;
    stateServer;
    stateClient;
    constructor(roomProps) {
        super();
        this.initEvent(roomProps);
        this.ee.on('+events', (event) => {
            if (event.name) {
                const [type, name] = event.name.split(':');
                if (type === 'rpc') {
                    if (Object.hasOwn(this, name)) {
                        this[name](event.args);
                    }
                    else {
                        console.error(`RPC method not found: ${name}`);
                    }
                }
                else {
                    this.ee.emit(event.name, event.args).catch(console.error);
                }
            }
        });
    }
    init(data) { }
    initEvent({ roomClient, roomServer }) {
        if (roomClient) {
            this.roomClient = roomClient;
            this.roomClient.state.events.onAdd((eventServer, key) => {
                const event = new EventData({
                    id: eventServer.id,
                    name: eventServer.name,
                    args: JSON.parse(eventServer.args),
                });
                this.ee.emit('+events', event).catch(console.error);
            });
        }
        else if (roomServer) {
            this.roomServer = roomServer;
            this.roomServer.onMessage('+events', (client, event) => {
                this.ee.emit('+events', event).catch(console.error);
            });
            this.ee.on('+events', (event) => {
                this.sendEvent(event);
            });
        }
    }
    sendEvent(event) {
        if (this.roomClient) {
            this.roomClient.send('+events', event);
        }
        else if (this.roomServer) {
            this.events.push(new EventSchema({
                id: uniqid(),
                name: event.name,
                args: JSON.stringify(event.args),
            }));
        }
    }
    isServerAttached() {
        return Boolean(this.stateServer);
    }
    isClientSide() {
        return !this.roomServer;
    }
    clientOnly(func) {
        return this.isClientSide() ? func?.() : undefined;
    }
}
__decorate([
    type([EventSchema]),
    __metadata("design:type", Object)
], Module.prototype, "events", void 0);
//# sourceMappingURL=Module.js.map