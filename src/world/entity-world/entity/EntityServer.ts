import { ModuleServer } from '@/module';
import { type TickData } from '@/types';
import { Schema, type } from '@colyseus/schema';

import { type WorldCore } from '../WorldCore';
import { type EntityCore } from './EntityCore';

export class VectorSchema extends Schema {
  @type('number') x = 0;
  @type('number') y = 0;
}

export abstract class EntityServer extends ModuleServer {
  @type('string') id: string;
  @type('string') name = this.constructor.name;
  @type('number') scale = 1;
  @type('number') angle = 0;
  @type(VectorSchema) pos: VectorSchema = new VectorSchema().assign({
    x: 0,
    y: 0,
  });

  @type(VectorSchema) velocity: VectorSchema = new VectorSchema().assign({
    x: 0,
    y: 0,
  });

  abstract stats: Schema; // Redefine this in the child class (colyseus schema). Base stats that are not affected by effects

  constructor(public entityCore: EntityCore) {
    super(entityCore);
    this.id = entityCore.id;
    this.entityCore = entityCore;
  }

  init() {
    this.updateBase();
    this.updateStats(this.stats, this.entityCore._stats);
  }

  updateBase() {
    this.angle = this.entityCore.body.angle;
    this.scale = this.entityCore.body.scale;
    this.pos.x = this.entityCore.body.pos.x;
    this.pos.y = this.entityCore.body.pos.y;
    this.velocity.x = this.entityCore.velocity.x;
    this.velocity.y = this.entityCore.velocity.y;
  }

  updateStats(stats: Schema, coreStats: Record<string, unknown>) {
    for (const key in coreStats) {
      if (Object.hasOwn(stats, key)) {
        // @ts-expect-error - Assign coreStats[key] to stats[key]
        stats[key] = coreStats[key];
      }
    }
  }

  abstract update(world: WorldCore, tickData: TickData): void;
}
