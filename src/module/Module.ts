import { type Room as RoomServer } from '@colyseus/core';
import { ArraySchema, Schema, type } from '@colyseus/schema';
import { type Room as RoomClient } from 'colyseus.js';
import uniqid from 'uniqid';

import { EventData, EventSchema } from '@/types/EventData';
import { AsyncEE } from '@/utils/AsyncEE';

type RoomProps =
  | {
      roomClient: RoomClient<Module>;
      roomServer: undefined;
    }
  | {
      roomClient: undefined;
      roomServer: RoomServer<Module>;
    };

export abstract class Module extends Schema {
  static create<T extends typeof Module>(
    this: T,
    value: { roomClient?: RoomClient; roomServer?: any } & (Parameters<
      InstanceType<T>['init']
    >[0] extends void
      ? Record<string, unknown>
      : Parameters<InstanceType<T>['init']>[0])
  ): InstanceType<T> {
    // @ts-expect-error - This is a dynamic call to a constructor
    const obj = new this(value) as InstanceType<T>;
    obj.init(value);
    return obj;
  }

  @type([EventSchema]) events = new ArraySchema<EventSchema>();

  ee = new AsyncEE<{
    '+events': (event: EventData) => void;
  }>();

  roomClient?: RoomClient<Module>;
  roomServer?: RoomServer<Module>;

  stateServer?: Schema; // state on the server
  stateClient?: Record<string, any>; // state on the client

  constructor(roomProps: RoomProps) {
    super();
    this.initEvent(roomProps);
    this.ee.on('+events', (event) => {
      if (event.name) {
        const [type, name] = event.name.split(':');
        if (type === 'rpc') {
          if (Object.hasOwn(this, name)) {
            // @ts-expect-error - This is a dynamic call to a method on the class
            this[name](event.args);
          } else {
            console.error(`RPC method not found: ${name}`);
          }
        } else {
          // @ts-expect-error - event.name is not a valid key
          this.ee.emit(event.name, event.args).catch(console.error);
        }
      }
    });
  }

  init(data: Record<string, unknown>) {}

  initEvent({ roomClient, roomServer }: RoomProps) {
    if (roomClient) {
      this.roomClient = roomClient;
      // if server events change the state, we need to update the client
      this.roomClient.state.events.onAdd((eventServer, key) => {
        const event = new EventData({
          id: eventServer.id,
          name: eventServer.name,
          args: JSON.parse(eventServer.args),
        });
        this.ee.emit('+events', event).catch(console.error);
      });
    } else if (roomServer) {
      this.roomServer = roomServer;
      this.roomServer.onMessage('+events', (client, event: EventData) => {
        this.ee.emit('+events', event).catch(console.error);
      });
      this.ee.on('+events', (event: EventData) => {
        this.sendEvent(event); // add to array schema 'events'
      });
    }
  }

  sendEvent(event: EventData) {
    if (this.roomClient) {
      // send to server
      this.roomClient.send('+events', event);
    } else if (this.roomServer) {
      // add to array schema 'events'
      this.events.push(
        new EventSchema({
          id: uniqid(),
          name: event.name,
          args: JSON.stringify(event.args),
        })
      );
    }
  }

  isServerAttached() {
    return Boolean(this.stateServer);
  }

  isClientSide(): this is { stateClient: Record<string, unknown> } {
    return !this.roomServer;
  }

  clientOnly<T>(func?: () => T) {
    return this.isClientSide() ? func?.() : undefined;
  }
}
