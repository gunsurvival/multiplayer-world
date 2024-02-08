import { TextStyle } from '@pixi/text';
// import { PixiFpsCounter } from 'pixi-fps-counter';
import Stats from 'stats.js';

import { type PlayerClient, type WorldClient } from './index';
import { type TickData } from './types/TickData';

export class Game {
  stats = {
    fps: new Stats(),
    ping: new Stats(),
  };

  // counter?: PixiFpsCounter;

  isMobile = false;
  playerClient: PlayerClient | undefined;

  private readonly internal = {
    tps: 0,
    targetDelta: 1000 / 60,
    elapsedMs: 0,
    elapseTick: 0,
    accumulator: 0,
    ping: 0,
    tpsCountInterval: 0,
  };

  async connect() {}

  init() {}

  initDOM() {}

  start(worldClient: WorldClient, playerClient: PlayerClient) {
    // Const camera = new Camera(world.app.stage);
    // this.counter = new PixiFpsCounter(worldClient.app.ticker, {
    //   backgroundColor: 0x9f3a0d,
    //   backgroundPadding: 20,
    //   dragParent: worldClient.app.stage,
    //   textStyle: new TextStyle({
    //     fill: '#fff7db',
    //     fontSize: 32,
    //     fontWeight: 'bolder',
    //     strokeThickness: 9,
    //   }),
    //   updateCoefficient: 10,
    // });
    // worldClient.app.stage.addChild(this.counter);

    worldClient.app.ticker.add((_delta) => {
      const { deltaMS } = worldClient.app.ticker;
      const { internal } = this;

      internal.accumulator += deltaMS;
      // This.stats.fps.begin();
      while (internal.accumulator >= internal.targetDelta) {
        internal.elapseTick++;
        internal.accumulator -= internal.targetDelta;
        const tickData: TickData = {
          accumulator: internal.accumulator,
          elapsedMs: internal.elapsedMs,
          deltaMs: internal.targetDelta,
          delta: 1,
        };

        if (playerClient.isReady()) {
          playerClient.playerCore.nextTick(tickData);
          playerClient.nextTick(tickData);
          // Update camera
          // camera.update();

          // Update player angle to mouse
          // const {entity} = player.playerCore;
          // if (entity && !this.isMobile) {
          // 	const playerX = entity.body.pos.x;
          // 	const playerY = entity.body.pos.y;
          // 	const playerScreenPos = worldClient.app.stage.toScreen(playerX, playerY);
          // 	this.player.entity.body.angle = Math.atan2(
          // 		this.pointerPos.y - playerScreenPos.y,
          // 		this.pointerPos.x - playerScreenPos.x,
          // 	);
          // }
        }

        worldClient.worldCore.nextTick(tickData);
        worldClient.nextTick(tickData);
        internal.elapsedMs += internal.targetDelta;
      }

      // This.stats.fps.end();
    });
  }
}
