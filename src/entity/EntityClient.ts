import { type DisplayObject } from 'pixi.js';

import { type WorldClient } from '@/world/WorldClient';
import { type TickData } from '@/types/TickData';

import { type EntityCore } from './EntityCore';
import { type EntityServer } from './EntityServer';

export abstract class EntityClient {
  displayObjects = new Array<DisplayObject>();

  constructor(
    public worldClient: WorldClient,
    public entityCore: EntityCore
  ) {}

  init() {}

  initServer(entityServer: EntityServer) {}

  nextTick(tickData: TickData) {
    this.displayObjects.forEach((displayObject, index) => {
      displayObject.x = this.entityCore.bodies[index].pos.x;
      displayObject.y = this.entityCore.bodies[index].pos.y;
      displayObject.rotation = this.entityCore.bodies[index].angle;
    });
  }
}
