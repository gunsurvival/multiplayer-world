import type * as PIXI from 'pixi.js';
import SAT from 'sat';
export declare class Camera {
    stage: PIXI.Container;
    pos: SAT.Vector;
    angle: number;
    followingPos: SAT.Vector;
    constructor(stage: PIXI.Container);
    get x(): number;
    get y(): number;
    follow(pos: SAT.Vector): void;
    update(): void;
    shake(amount: number): void;
}
//# sourceMappingURL=Camera.d.ts.map