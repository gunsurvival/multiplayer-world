import { AsyncEE } from "../utils/AsyncEE";
export class Player {
    constructor() {
        this.ee = new AsyncEE();
    }
    static create(value) {
        const obj = new this();
        if (value.roomClient) {
            obj.initClient(value.roomClient);
        }
        obj.init();
        return obj;
    }
    static initServer(room) {
        room.onMessage('*', (client, type, message) => {
            client.userData?.player.ee
                .emit(String(type), message)
                .catch(console.error);
        });
    }
    isReady() {
        return this.core !== undefined;
    }
    setCore(core) {
        this.core = core;
    }
    init() { }
    initClient(room) {
        room.onMessage('*', (type, message) => {
            this.ee.emit(String(type), message).catch(console.error);
        });
    }
    sendMessage(type, message, room) {
        if (room) {
            room.send(type, message);
        }
        else {
            this.ee.emit(type, message).catch(console.error);
        }
    }
}
//# sourceMappingURL=Player.js.map