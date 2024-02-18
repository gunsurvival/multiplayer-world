import { type Module } from '@/module';
import { type Room as RoomServer } from '@colyseus/core';
import { type Room as RoomClient } from 'colyseus.js';
import { AsyncEE } from '@/utils/AsyncEE';
export declare class Player {
    static create<T extends typeof Player>(this: T, value?: RoomServer): InstanceType<T>;
    ee: AsyncEE<import("@/utils/AsyncEE").EventsMap>;
    core?: Module;
    isReady(): this is {
        core: Module;
    };
    setCore(core: Module): void;
    init(): void;
    initServer(room: RoomServer): void;
    sendMessage(type: string, message: string, room?: RoomClient): void;
}
