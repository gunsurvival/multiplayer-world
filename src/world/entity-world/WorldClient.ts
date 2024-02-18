import { Application, type DisplayObject } from 'pixi.js';

import { type EntityClient } from '@/world/entity-world/entity/EntityClient';
import { type EntityCore } from '@/world/entity-world/entity/EntityCore';
import { type WorldCore } from '@/world/entity-world/WorldCore';
import { type TickData } from '@/types/TickData';

export abstract class WorldClient {
  app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#133a2b',
    antialias: true,
    resizeTo: window,
  });

  entities = new Map<string, EntityClient>();
  entityClassifiers = new Map<string, typeof EntityClient>();

  constructor(public worldCore: WorldCore) {
    // @ts-expect-error asdasdasds
    globalThis.__PIXI_APP__ = this.app;
  }

  init() {
    this.worldCore.ee.on('+entities', (entityCore: EntityCore) => {
      const EntityClientClassifier = this.entityClassifiers.get(
        entityCore.constructor.name
      );
      if (!EntityClientClassifier) {
        throw new Error(
          `EntityClientClassifier not found for ${entityCore.constructor.name}`
        );
      }

      // @ts-expect-error cannot create abstract class
      const entityClient = new EntityClientClassifier(this, entityCore);
      entityClient.init();
      this.entities.set(entityCore.id, entityClient);
      this.addStage(entityClient.displayObjects);

      // Const entityServer = this.room.state.entities.get(entityCore.id);
      // if (entityServer) {
      // 	entityClient.initServer(entityServer);
      // } else {
      // 	// Previous object that have been removed from the server but still exists on worldCore.events(api:entities add) to be re-add
      // }

      // if (entityCore.id === this.room.sessionId) {
      // 	this.playAs(entityCore);
      // }
    });

    this.worldCore.ee.on('-entities', (entityCore: EntityCore) => {
      const entity = this.entities.get(entityCore.id);
      if (entity) {
        this.removeStage(entity.displayObjects);
        this.entities.delete(entityCore.id);
      }
    });
  }

  nextTick(tickData: TickData) {
    this.entities.forEach((entity) => {
      entity.nextTick(tickData);
    });
  }

  addStage(displayObjects: DisplayObject[]) {
    displayObjects.forEach((displayObject) => {
      this.app.stage.addChild(displayObject);
    });
  }

  removeStage(displayObjects: DisplayObject[]) {
    displayObjects.forEach((displayObject) => {
      this.app.stage.removeChild(displayObject);
    });
  }

  registerEntityClassifier(entityClientClassifier: typeof EntityClient) {
    this.entityClassifiers.set(
      entityClientClassifier.constructor.name,
      entityClientClassifier
    );
  }

  removeEntityClassifier(entityClientClassifier: typeof EntityClient) {
    this.entityClassifiers.delete(entityClientClassifier.constructor.name);
  }
}
