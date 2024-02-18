import { Schema } from '@colyseus/schema';
export declare class EventData {
    id: string;
    name: string;
    args: never[];
    constructor(data: Partial<EventData>);
    assign(data: Partial<EventData>): this;
}
export declare class EventSchema extends Schema {
    id: string;
    class: string;
    name: string;
    args: string;
}
