import { type Room as RoomServer } from 'colyseus';
import { type Room as RoomClient } from 'colyseus.js';
import { type Module } from './Module';
export declare class ModuleHelper {
    roomClient?: RoomClient<Module>;
    roomServer?: RoomServer<Module>;
    constructor(roomProps: {
        roomServer: RoomServer;
        roomClient?: undefined;
    } | {
        roomClient: RoomClient;
        roomServer?: undefined;
    });
    create<T extends typeof Module>(Classifier: T, value: Parameters<InstanceType<T>['init']>[0] extends void ? Record<string, unknown> : Parameters<InstanceType<T>['init']>[0], cbAfterConstruct?: (obj: InstanceType<T>) => void): InstanceType<T>;
}
//# sourceMappingURL=ModuleHelper.d.ts.map