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
    constructor() {
        super(...arguments);
        this.id = uniqid();
        this.events = new ArraySchema();
        this.ee = new AsyncEE();
    }
    initServer(state) {
        this.stateServer = state;
        const unbindId = this.stateServer.listen('id', (id) => {
            if (typeof id === 'string') {
                this.id = id;
                unbindId();
            }
        }, false);
        const unbindEvents = this.stateServer.listen('events', (events) => {
            unbindEvents();
            events.onAdd((eventServer) => {
                const event = new EventData({
                    id: eventServer.id,
                    name: eventServer.name,
                    args: JSON.parse(eventServer.args),
                });
                this.ee.emit('+events', event).catch(console.error);
            });
        }, false);
    }
    initEvent({ roomClient, roomServer }) {
        if (roomClient) {
        }
        else if (roomServer) {
            roomServer.onMessage('+events', (client, event) => {
                if (event.id !== this.id)
                    return;
                this.ee.emit('+events', event).catch(console.error);
            });
            this.ee.on('+events', (event) => {
                console.log(event);
                this.serverPushEvent(event);
            });
        }
        this.ee.on('+events', (event) => {
            if (event.name) {
                const [type, name] = event.name.split(':');
                if (type === 'rpc') {
                    if (typeof this[name] === 'function') {
                        this[name](...event.args);
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
    sendEvent(event) {
        if (this.helper?.roomClient) {
        }
        else if (this.helper?.roomServer) {
            this.ee.emit('+events', event).catch(console.error);
        }
    }
    serverPushEvent(event) {
        this.events.push(new EventSchema().assign({
            id: this.id,
            name: event.name,
            args: JSON.stringify(event.args),
        }));
    }
    isServerAttached() {
        return Boolean(this.stateServer);
    }
    isClientSide() {
        return Boolean(this?.helper.roomClient);
    }
    isServerSide() {
        return Boolean(this?.helper.roomServer);
    }
    isPlayOffline() {
        return this.isClientSide() && !this.isServerAttached();
    }
    clientOnly(func) {
        return undefined;
    }
    init(data) { }
    async initClient() { }
}
__decorate([
    type('string'),
    __metadata("design:type", Object)
], Module.prototype, "id", void 0);
__decorate([
    type([EventSchema]),
    __metadata("design:type", Object)
], Module.prototype, "events", void 0);
//# sourceMappingURL=Module.js.map