export declare class OnlineEvent {
    items: OnlineEventData[];
    push(eventName: string, ...args: unknown[]): void;
    remove(id: string): void;
}
export type OnlineEventData = {
    id: string;
    name: string;
    args: any[];
};
//# sourceMappingURL=OnlineEvent.d.ts.map