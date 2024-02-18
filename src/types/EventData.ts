import { Schema, type } from '@colyseus/schema';
import uniqid from 'uniqid';

export class EventData {
  id = uniqid();
  name = '';
  args = [];
  constructor(data: Partial<EventData>) {
    this.assign(data);
  }

  assign(data: Partial<EventData>) {
    Object.assign(this, data);
    return this;
  }
}

export class EventSchema extends Schema {
  @type('string') id = '';
  @type('string') class = '';
  @type('string') name = 'UnknownEvent';
  @type('string') args = '[]';
}
