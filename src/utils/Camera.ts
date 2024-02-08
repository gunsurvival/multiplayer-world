import type * as PIXI from 'pixi.js';
import SAT from 'sat';

import { lerp } from './common';

export class Camera {
  pos = new SAT.Vector(0, 0);
  angle = 0;
  followingPos = new SAT.Vector(0, 0);

  constructor(public stage: PIXI.Container) {}

  get x() {
    return this.pos.x;
  }

  get y() {
    return this.pos.y;
  }

  follow(pos: SAT.Vector) {
    this.followingPos = pos;
  }

  update() {
    this.pos.x =
      -this.followingPos.x * this.stage.scale._x + window.innerWidth / 2;
    this.pos.y =
      -this.followingPos.y * this.stage.scale._y + window.innerHeight / 2;
    this.stage.position.set(
      lerp(this.stage.position.x, this.pos.x, 0.03),
      lerp(this.stage.position.y, this.pos.y, 0.03)
    );
  }

  shake(amount: number) {
    this.stage.position.set(
      this.stage.position.x + (Math.random() * amount - amount / 2),
      this.stage.position.y + (Math.random() * amount - amount / 2)
    );
  }
}
