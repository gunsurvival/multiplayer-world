export class AsyncEE<Events extends EventsMap> {
  private readonly eventHandlers = new Map<string, DefaultHandler[]>();

  on<Ev extends EventNames<Events>>(event: Ev, handler: Events[Ev]) {
    const eventHandlers = this.eventHandlers.get(event) ?? [];
    eventHandlers.push(handler as DefaultHandler);
    this.eventHandlers.set(event, eventHandlers);
  }

  remove<Ev extends EventNames<Events>>(event: Ev, handler: Events[Ev]) {
    const eventHandlers = this.eventHandlers.get(event);
    if (!eventHandlers) {
      return;
    }

    const index = eventHandlers.indexOf(handler as DefaultHandler);
    if (index !== -1) {
      eventHandlers.splice(index, 1);
      if (eventHandlers.length === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  once<Ev extends EventNames<Events>>(event: Ev, handler: Events[Ev]) {
    const onceHandler = async (...args: Parameters<Events[Ev]>) => {
      await handler(...args);
      this.remove(event, onceHandler as Events[Ev]);
    };

    this.on(event, onceHandler as Events[Ev]);
  }

  async emit<Ev extends EventNames<Events>>(
    event: Ev,
    ...args: Parameters<Events[Ev]>
  ) {
    const values: Array<ReturnType<Events[Ev]>> = [];
    const eventHandlers = this.eventHandlers.get(event)?.slice();
    if (eventHandlers?.length) {
      for (const handler of eventHandlers) {
        // eslint-disable-next-line no-await-in-loop
        const value = (await handler(...args)) as ReturnType<Events[Ev]>;
        if (value) {
          values.push(value);
        }
      }
    }

    return values;
  }
}

type DefaultHandler = EventHandler<any[]>;

/**
 * An events map is an interface that maps event names to their value, which
 * represents the type of the `on` listener.
 */
type EventsMap = Record<string, DefaultHandler>;

/**
 * Returns a union type containing all the keys of an event map.
 */
type EventNames<Map extends EventsMap> = keyof Map & string;

/** The tuple type representing the handler of an event listener */
type EventHandler<Params extends any[]> = (...args: Params) => unknown;
