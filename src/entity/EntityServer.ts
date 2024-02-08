import { type WorldServer } from '@/world/WorldServer';
import { type TickData } from '@/types/TickData';

import { type EntityCore } from './EntityCore';

export abstract class EntityServer {
  constructor(
    public worldServer: WorldServer,
    public entityCore: EntityCore
  ) {}

  init() {}
  nextTick(tickData: TickData) {}
}
