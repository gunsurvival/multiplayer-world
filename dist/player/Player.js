import { AsyncEE } from "../utils/AsyncEE";
export class Player {
    static create(value) {
        const obj = new this();
        obj.init();
        if (value) {
            obj.initServer(value);
        }
        return obj;
    }
    ee = new AsyncEE();
    core;
    isReady() {
        return this.core !== undefined;
    }
    setCore(core) {
        this.core = core;
    }
    init() { }
    initServer(room) {
        room.onMessage('*', (client, type, message) => {
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