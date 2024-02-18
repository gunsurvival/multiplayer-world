import { Module } from '@/module';
import { SATVector, type Body, type Response } from 'detect-collisions';
import uniqid from 'uniqid';

import { type Effect } from '@/world/entity-world/effect/Effect';
import { type WorldCore } from '@/world/entity-world/WorldCore';
import { type TickData } from '@/types/TickData';
import { AsyncEE } from '@/utils/AsyncEE';

export abstract class EntityCore extends Module {
  id = uniqid();
  markAsRemove = false;
  ee = new AsyncEE<EntityEventMap>();
  velocity = new SATVector(0, 0);

  abstract body: Body;
  abstract stats: Record<string, unknown>;
  abstract _stats: Record<string, unknown>;

  constructor(public worldCore: WorldCore) {
    super();
  }

  init(data: Record<string, unknown> = {}) {}

  beforeNextTick(tickData: TickData) {
    this.body.pos.add(this.velocity);
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
