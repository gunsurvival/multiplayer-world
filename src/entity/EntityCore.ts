import { SATVector, type Body, type Response } from 'detect-collisions';
import uniqid from 'uniqid';

import { type WorldCore } from '@/world/WorldCore';
import { type Effect } from '@/effect/Effect';
import { type TickData } from '@/types/TickData';
import { AsyncEE } from '@/utils/AsyncEE';

export abstract class EntityCore {
  id = uniqid();
  markAsRemove = false;
  ee = new AsyncEE<EntityEventMap>();
  velocity = new SATVector(0, 0);

  bodies = new Array<Body>();

  constructor(public worldCore: WorldCore) {}

  init(data: Record<string, unknown> = {}) {}

  beforeNextTick(tickData: TickData) {
    this.bodies.forEach((body) => body.pos.add(this.velocity));
  }

  nextTick(tickData: TickData) {}

  onCollisionEnter(entity: EntityCore, response: Response) {}
  onCollisionStay(entity: EntityCore, response: Response) {}
  onCollisionExit(entity: EntityCore, response: Response) {}
}

export type EntityEventMap = {
  '+effects': (effect: Effect) => void;
  '-effects': (effect: Effect) => void;
  'collision-enter': (entity: EntityCore) => void;
  'collision-stay': (entity: EntityCore) => void;
  'collision-exit': (entity: EntityCore) => void;
};
