import { type EntityCore } from '@/entity/EntityCore';
import { type TickData } from '@/types/TickData';
import { AsyncEE } from '@/utils/AsyncEE';

export abstract class PlayerCore {
  entity?: EntityCore;
  ee = new AsyncEE<PlayerEventMap>();
  state = {
    keyboard: {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
    },
    mouse: {
      left: false,
      middle: false,
      right: false,
    },
  };

  isReady(): this is { entity: EntityCore } {
    return this.entity !== undefined;
  }

  init() {}

  playAs(entity: EntityCore) {
    this.entity = entity;
    this.ee.emit('ready').catch(console.error);
  }

  nextTick(tickData: TickData) {}
}

export type PlayerEventMap = {
  ready: () => void;
  playAs: (entityCore: EntityCore) => void;
};
