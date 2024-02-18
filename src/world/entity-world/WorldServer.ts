import { type TickData } from '@/types/TickData';

import { type WorldCore } from './WorldCore';

export abstract class WorldServer {
  constructor(public worldCore: WorldCore) {}
  init() {}

  nextTick(tickData: TickData) {}
}
