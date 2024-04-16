export class AsyncEE {
    constructor() {
        this.eventHandlers = new Map();
    }
    on(event, handler) {
        const eventHandlers = this.eventHandlers.get(event) ?? [];
        eventHandlers.push(handler);
        this.eventHandlers.set(event, eventHandlers);
    }
    remove(event, handler) {
        const eventHandlers = this.eventHandlers.get(event);
        if (!eventHandlers) {
            return;
        }
        const index = eventHandlers.indexOf(handler);
        if (index !== -1) {
            eventHandlers.splice(index, 1);
            if (eventHandlers.length === 0) {
                this.eventHandlers.delete(event);
            }
        }
    }
    once(event, handler) {
        const onceHandler = async (...args) => {
            await handler(...args);
            this.remove(event, onceHandler);
        };
        this.on(event, onceHandler);
    }
    async emit(event, ...args) {
        const values = [];
        const eventHandlers = this.eventHandlers.get(event)?.slice();
        if (eventHandlers?.length) {
            for (const handler of eventHandlers) {
                const value = (await handler(...args));
                if (value) {
                    values.push(value);
                }
            }
        }
        return values;
    }
}
//# sourceMappingURL=AsyncEE.js.map