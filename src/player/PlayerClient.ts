import { type DisplayObject } from 'pixi.js';

import { type EntityClient } from '@/entity/EntityClient';
import { type TickData } from '@/types/TickData';

import { type PlayerCore } from './PlayerCore';

export abstract class PlayerClient {
  displayObject?: DisplayObject;

  constructor(public playerCore: PlayerCore) {}

  init() {}

  isReady() {
    return this.playerCore.isReady();
  }

  playAs(entityClient: EntityClient) {
    this.playerCore.playAs(entityClient.entityCore);
  }

  nextTick(tickData: TickData) {}
}
