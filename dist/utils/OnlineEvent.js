import uniqid from 'uniqid';
export class OnlineEvent {
    items = new Array();
    push(eventName, ...args) {
        this.items.push({
            id: uniqid(),
            name: eventName,
            args,
        });
    }
    remove(id) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
}
//# sourceMappingURL=OnlineEvent.js.map