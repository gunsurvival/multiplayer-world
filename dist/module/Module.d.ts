import { type Room as RoomServer } from '@colyseus/core';
import { ArraySchema, Schema } from '@colyseus/schema';
import { type Room as RoomClient } from 'colyseus.js';
import { EventData, EventSchema } from '@/types/EventData';
import { AsyncEE } from '@/utils/AsyncEE';
type RoomProps = {
    roomClient: RoomClient<Module>;
    roomServer: undefined;
} | {
    roomClient: undefined;
    roomServer: RoomServer<Module>;
};
export declare abstract class Module extends Schema {
    static create<T extends typeof Module>(this: T, value: {
        roomClient?: RoomClient;
        roomServer?: any;
    } & (Parameters<InstanceType<T>['init']>[0] extends void ? Record<string, unknown> : Parameters<InstanceType<T>['init']>[0])): InstanceType<T>;
    events: ArraySchema<EventSchema>;
    ee: AsyncEE<{
        '+events': (event: EventData) => void;
    }>;
    roomClient?: RoomClient<Module>;
    roomServer?: RoomServer<Module>;
    stateServer?: Schema;
    stateClient?: Record<string, any>;
    constructor(roomProps: RoomProps);
    init(data: Record<string, unknown>): void;
    initEvent({ roomClient, roomServer }: RoomProps): void;
    sendEvent(event: EventData): void;
    isServerAttached(): boolean;
    isClientSide(): this is {
        stateClient: Record<string, unknown>;
    };
    clientOnly<T>(func?: () => T): T | undefined;
}
export {};
