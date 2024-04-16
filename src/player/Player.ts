import { type Module } from '@/module';
import { type Room as RoomServer } from '@colyseus/core';
import { type Room as RoomClient } from 'colyseus.js';

import { AsyncEE } from '@/utils/AsyncEE';

export class Player {
  static create<T extends typeof Player>(
    this: T,
    value: { roomClient?: RoomClient }
  ): InstanceType<T> {
    const obj = new this() as InstanceType<T>;
    if (value.roomClient) {
      obj.initClient(value.roomClient);
    }

    obj.init();
    return obj;
  }

  static initServer(room: RoomServer) {
    // Only call this once
    room.onMessage('*', (client, type, message) => {
      client.userData?.player.ee
        .emit(String(type), message)
        .catch(console.error);
    });
  }

  ee = new AsyncEE();
  core?: Module;

  isReady(): this is { core: Module } {
    return this.core !== undefined;
  }

  setCore(core: Module) {
    this.core = core;
  }

  init() {}

  initClient(room: RoomClient) {
    room.onMessage('*', (type, message) => {
      // console.log('receive', type, message);
      this.ee.emit(String(type), message).catch(console.error);
    });
  }

  sendMessage(type: string, message: string, room?: RoomClient) {
    if (room) {
      room.send(type, message);
    } else {
      this.ee.emit(type, message).catch(console.error);
    }
  }
}
