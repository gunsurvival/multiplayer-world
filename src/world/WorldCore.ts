import { System, type Body, type Response } from 'detect-collisions';

import { type EntityCore } from '@/entity/EntityCore';
import { type EventData } from '@/types/EventData';
import { type TickData } from '@/types/TickData';
import { AsyncEE } from '@/utils/AsyncEE';

export abstract class WorldCore {
  entities = new Map<string, EntityCore>();
  system = new System();
  collisionHashMap = new Map<string, Response>();
  newCollisionHashMap = new Map<string, Response>();
  ee = new AsyncEE<WorldEventMap>();
  events = new Array<EventData>();
  isOnline = false;

  init() {}

  nextTick(tickData: TickData) {
    this.newCollisionHashMap.clear();

    this.entities.forEach((entity: EntityCore, id) => {
      if (entity.markAsRemove) {
        this.addEvent('api:-entities', id).catch(console.error);
        return;
      }

      entity.beforeNextTick(tickData);
      entity.nextTick(tickData);

      entity.bodies.forEach((body) => {
        this.system.updateBody(body);
        this.system.checkOne(body, ({ ...response }: ResponseBodyRefEntity) => {
          const entityA = response.a.entityRef;
          const entityB = response.b.entityRef;

          if (entityA && entityB) {
            // if (entityA.isStatic && entityB.isStatic) {
            //   // If current both entities are static, skip collision check
            //   return;
            // }

            const uniq = entityA.id + entityB.id;
            this.newCollisionHashMap.set(uniq, response);
            if (this.collisionHashMap.has(uniq)) {
              entity.onCollisionStay(entityB, response);
            } else {
              this.collisionHashMap.set(uniq, response);
              entityA.onCollisionEnter(entityB, response);
              entityA.ee.emit('collision-enter', entityB).catch(console.error);
            }
          }
        });
      });
    });
    this.collisionHashMap.forEach(
      (response: ResponseBodyRefEntity, uniq: string) => {
        if (!this.newCollisionHashMap.has(uniq)) {
          const entityA = response.a.entityRef;
          const entityB = response.b.entityRef;
          if (entityA && entityB) {
            const uniq = entityA.id + entityB.id;
            this.collisionHashMap.delete(uniq);
            entityA.onCollisionExit(entityB, response);
            entityA.ee.emit('collision-exit', entityB).catch(console.error);
          }
        }
      }
    );
  }

  async addEvent<Ev extends keyof WorldEventMap>(
    type: Ev,
    ...args: Parameters<WorldEventMap[Ev]>
  ) {
    if (this.isOnline) {
      // ignore history events when online, only server world core can
      return;
    }

    const event: EventData = { type, args };
    this.events.push(event);
    this.ee.emit('+events', event).catch(console.error);
    const values = await this.ee.emit(type, ...args);
    return values[0];
  }

  async add(entityCore: EntityCore) {
    entityCore.bodies.forEach((body) => {
      this.system.insert(body);
    });
    this.entities.set(entityCore.id, entityCore);
    entityCore.bodies.forEach((body) => {
      (body as BodyRefEntity).entityRef = entityCore;
    });
    // Need to reference the entity's id in the body because the body is passed to the System.checkOne callback, not the entity
    await this.ee.emit('+entities', entityCore).catch(console.error);
  }

  remove(entityCore: EntityCore) {
    entityCore.bodies.forEach((body) => {
      this.system.remove(body);
    });
    this.entities.delete(entityCore.id);
    this.ee.emit('-entities', entityCore).catch(console.error);
  }
}

export type WorldEventMap = {
  'api:+entities': (className: string, args?: unknown[]) => void;
  'api:-entities': (id: string) => void;
  '+entities': (entity: EntityCore) => void;
  '-entities': (entity: EntityCore) => void;
  '+events': (event: EventData) => void;
};

type BodyRefEntity = Body & { entityRef: EntityCore };
type ResponseBodyRefEntity = Omit<Response, 'a' | 'b'> & {
  a: BodyRefEntity;
  b: BodyRefEntity;
};
