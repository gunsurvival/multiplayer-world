import { type Room as RoomServer } from '@colyseus/core';
import { ArraySchema, Schema } from '@colyseus/schema';
import { type Room as RoomClient } from 'colyseus.js';
import { EventData, EventSchema } from '@/types/EventData';
import { AsyncEE } from '@/utils/AsyncEE';
import { type ModuleHelper } from './ModuleHelper';
type RoomProps = {
    roomClient?: RoomClient<Module>;
    roomServer?: RoomServer<Module>;
};
export declare abstract class Module extends Schema {
    id: string;
    events: ArraySchema<EventSchema>;
    ee: AsyncEE<{
        '+events': (event: EventData) => void;
    }>;
    stateServer?: typeof this;
    stateClient?: Awaited<ReturnType<this['initClient']>>;
    helper: ModuleHelper;
    awatingClientState?: Promise<any>;
    initServer(state: Schema): void;
    initEvent({ roomClient, roomServer }: RoomProps): void;
    sendEvent(event: EventData): void;
    serverPushEvent(event: EventData): void;
    isServerAttached(): boolean;
    isClientSide(): this is {
        stateClient: Record<string, any>;
    };
    isServerSide(): this is {
        stateServer: Record<string, unknown>;
    };
    isPlayOffline(): boolean;
    clientOnly<T>(func: () => T | Promise<T>): T | undefined;
    init(data: Record<string, unknown>): void;
    initClient(): Promise<any>;
}
export {};
//# sourceMappingURL=Module.d.ts.map