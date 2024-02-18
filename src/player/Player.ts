import { type Module } from '@/module';
import { type Room as RoomServer } from '@colyseus/core';
import { type Room as RoomClient } from 'colyseus.js';

import { AsyncEE } from '@/utils/AsyncEE';

export class Player {
  static create<T extends typeof Player>(
    this: T,
    value?: RoomServer
  ): InstanceType<T> {
    const obj = new this() as InstanceType<T>;
    obj.init();
    if (value) {
      obj.initServer(value);
    }

    return obj;
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

  // call at server
  initServer(room: RoomServer) {
    room.onMessage('*', (client, type, message) => {
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
