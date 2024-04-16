export declare class AsyncEE<Events extends EventsMap> {
    private readonly eventHandlers;
    on<Ev extends EventNames<Events>>(event: Ev, handler: Events[Ev]): void;
    remove<Ev extends EventNames<Events>>(event: Ev, handler: Events[Ev]): void;
    once<Ev extends EventNames<Events>>(event: Ev, handler: Events[Ev]): void;
    emit<Ev extends EventNames<Events>>(event: Ev, ...args: Parameters<Events[Ev]>): Promise<ReturnType<Events[Ev]>[]>;
}
type DefaultHandler = EventHandler<any[]>;
export type EventsMap = Record<string, DefaultHandler>;
type EventNames<Map extends EventsMap> = keyof Map & string;
type EventHandler<Params extends any[]> = (...args: Params) => unknown;
export {};
//# sourceMappingURL=AsyncEE.d.ts.map