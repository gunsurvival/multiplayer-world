import { type Room as RoomServer } from 'colyseus';
import { type Room as RoomClient } from 'colyseus.js';

import { type Module } from './Module';

export class ModuleHelper {
  roomClient?: RoomClient<Module>;
  roomServer?: RoomServer<Module>;

  constructor(
    roomProps:
      | {
          roomServer: RoomServer;
          roomClient?: undefined;
        }
      | {
          roomClient: RoomClient;
          roomServer?: undefined;
        }
  ) {
    this.roomClient = roomProps.roomClient;
    this.roomServer = roomProps.roomServer;
  }

  create<T extends typeof Module>(
    Classifier: T,
    value: Parameters<InstanceType<T>['init']>[0] extends void
      ? Record<string, unknown>
      : Parameters<InstanceType<T>['init']>[0],
    cbAfterConstruct?: (obj: InstanceType<T>) => void
  ): InstanceType<T> {
    // @ts-expect-error - This is a dynamic call to a constructor
    const obj = new Classifier({
      roomClient: this.roomClient,
      roomServer: this.roomServer,
    }) as InstanceType<T>;
    cbAfterConstruct?.(obj);
    obj.helper = this;

    const init = () => {
      obj.initEvent({
        roomClient: this.roomClient,
        roomServer: this.roomServer,
      });
      obj.init(value);
    };

    if (obj.isClientSide()) {
      obj.awatingClientState = obj.initClient();
      obj.awatingClientState.then(init).catch(console.error);
    } else {
      init();
    }

    // }

    // obj.initEvent({
    //   roomServer: this.roomServer,
    // });
    // obj.init(value);

    return obj;
  }
}
