import uniqid from 'uniqid';

export class OnlineEvent {
  items = new Array<OnlineEventData>();

  push(eventName: string, ...args: unknown[]) {
    this.items.push({
      id: uniqid(),
      name: eventName,
      args,
    });
  }

  remove(id: string) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}

export type OnlineEventData = {
  id: string;
  name: string;
  args: any[];
};
