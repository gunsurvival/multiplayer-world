import { type TickData } from '@/types/TickData';

import { type PlayerCore } from './PlayerCore';

export class PlayerServer {
  constructor(public playerCore: PlayerCore) {}
  init() {}

  nextTick(tickData: TickData) {}
}
