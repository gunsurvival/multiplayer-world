import type { Room as RoomServer } from '@colyseus/core';
import { ArraySchema, Schema, type } from '@colyseus/schema';
import type { Room as RoomClient } from 'colyseus.js';
import uniqid from 'uniqid';

import { EventData, EventSchema } from '@/types/EventData';
import { AsyncEE } from '@/utils/AsyncEE';

import type { ModuleHelper } from './ModuleHelper';

type RoomProps = {
  roomClient?: RoomClient<Module>;
  roomServer?: RoomServer<Module>;
};

export abstract class Module extends Schema {
  @type('string') id = uniqid();
  @type([EventSchema]) events = new ArraySchema<EventSchema>();

  ee = new AsyncEE<{
    '+events': (event: EventData) => void;
  }>();

  stateServer?: typeof this; // state on the server
  stateClient?: Awaited<ReturnType<this['initClient']>>; // state on the client

  helper!: ModuleHelper; // Must be created via ModuleHelper to have this property

  awatingClientState?: Promise<any>;

  initServer(state: Schema) {
    this.stateServer = state as typeof this;

    const unbindId = this.stateServer.listen(
      // @ts-expect-error TS not recognizing the stateServer property
      'id',
      (id) => {
        if (typeof id === 'string') {
          this.id = id as string;
          unbindId();
        }
      },
      false
    );

    const unbindEvents = this.stateServer.listen(
      // @ts-expect-error TS not recognizing the stateServer property
      'events',
      (events: ArraySchema<EventSchema>) => {
        unbindEvents();
        events.onAdd((eventServer) => {
          const event = new EventData({
            id: eventServer.id,
            name: eventServer.name,
            args: JSON.parse(eventServer.args),
          });
          this.ee.emit('+events', event).catch(console.error);
        });
      },
      false
    );
  }

  initEvent({ roomClient, roomServer }: RoomProps) {
    if (roomClient) {
      // if server events change the state, we need to update the client
      // roomClient.state)
    } else if (roomServer) {
      // TODO: fix this performance issue, it's not good to listen and check id, should listen at root and check
      roomServer.onMessage('+events', (client, event: EventData) => {
        // TODO: add protect rpc and authenticate here
        if (event.id !== this.id) return;
        this.ee.emit('+events', event).catch(console.error);
      });

      this.ee.on('+events', (event: EventData) => {
        console.log(event);
        this.serverPushEvent(event); // add to array schema 'events'
      });
    }

    this.ee.on('+events', (event) => {
      if (event.name) {
        const [type, name] = event.name.split(':');
        if (type === 'rpc') {
          // @ts-expect-error - event.name is not a valid key
          if (typeof this[name] === 'function') {
            // @ts-expect-error - This is a dynamic call to a method on the class
            this[name](...event.args);
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

  sendEvent(event: EventData) {
    if (this.helper?.roomClient) {
      // send to server
      // if (!this.isServerAttached()) {
      //   // TODO: add ability to play offline
      //   // this.ee.emit('+events', event).catch(console.error);
      //   return;
      // }
      // this.helper.roomClient.send(
      //   '+events',
      //   new EventData({
      //     id: this.id,
      //     name: event.name,
      //     args: event.args,
      //   })
      // );
      // console.log('sendEvent', event, this.id, this.helper.roomClient.id);
    } else if (this.helper?.roomServer) {
      // add to array schema 'events'
      this.ee.emit('+events', event).catch(console.error);
    }
  }

  serverPushEvent(event: EventData) {
    // console.log(event, this.id);
    this.events.push(
      new EventSchema().assign({
        id: this.id,
        name: event.name,
        args: JSON.stringify(event.args),
      })
    );
  }

  isServerAttached() {
    return Boolean(this.stateServer);
  }

  isClientSide(): this is { stateClient: Record<string, any> } {
    return Boolean(this?.helper.roomClient);
  }

  isServerSide(): this is { stateServer: Record<string, unknown> } {
    return Boolean(this?.helper.roomServer);
  }

  isPlayOffline() {
    return this.isClientSide() && !this.isServerAttached();
  }

  clientOnly<T>(func: () => T | Promise<T>) {
    return undefined as T | undefined;
  }

  init(data: Record<string, unknown>): void {}
  async initClient(): Promise<any> {}
}
