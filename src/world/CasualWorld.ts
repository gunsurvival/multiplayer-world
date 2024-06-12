import { World } from "./World"
import { Entity } from "../entity/Entity"
import {
	type ResponseBodyRefEntity,
	serializeResponse,
} from "@/utils/dectect-collisions"

export abstract class CasualWorld extends World {
	beforeTick(entity: Entity, delta: number) {
		entity.beforeTick(delta)
	}

	finalizeTick(entity: Entity, delta: number) {
		entity.finalizeTick(delta)

		if (entity.vel.len() > 0.1) {
			// skip small movements for performance
			entity.pos.x += entity.vel.x
			entity.pos.y += entity.vel.y
			// entity.vel.x *= entity.friction
			entity.vel.y = Number((entity.vel.y * entity.friction).toFixed(2))
			entity.vel.x = Number((entity.vel.x * entity.friction).toFixed(2))
		}
		entity.body?.setPosition(entity.pos.x, entity.pos.y)
	}

	nextTick(delta: number): void {
		super.nextTick(delta)
		this.entities.forEach((entity) => {
			this.beforeTick(entity, delta)
		})
		this.entities.forEach((entity) => {
			entity.controller?.nextTick(delta)
			// @ts-ignore  TODO: xoa window.isSync
			if (this.isClientOnly() && entity.serverState && window.isSync) {
				entity.reconcileServerState(entity.serverState)
			}
			if (entity.readyToRender) entity.nextTick(delta)
		})

		// ---- DETECT COLLISIONS ----
		this.newCollisionHashMap.clear()
		this.physics.update()
		this.physics.checkAll(({ ...response }: ResponseBodyRefEntity) => {
			const entityA = response.a.entitiyRef
			const entityB = response.b.entitiyRef
			if (entityA && entityB) {
				const uniq = `${entityA.id}-${entityB.id}`
				const serializedResponse = serializeResponse(response)
				this.newCollisionHashMap.set(uniq, response)
				if (this.collisionHashMap.has(uniq)) {
					entityA.onCollisionStay(entityB.id, serializedResponse)
				} else {
					this.collisionHashMap.set(uniq, response)
					entityA.onCollisionEnter(entityB.id, serializedResponse)
				}
			}
		})

		this.collisionHashMap.forEach(
			(response: ResponseBodyRefEntity, uniq: string) => {
				if (!this.newCollisionHashMap.has(uniq)) {
					const entityA = response.a.entitiyRef
					const entityB = response.b.entitiyRef
					if (entityA && entityB) {
						const uniq = `${entityA.id}-${entityB.id}`
						const serializedResponse = serializeResponse(response)
						this.collisionHashMap.delete(uniq)
						entityA.onCollisionExit(entityB.id, serializedResponse)
					}
				}
			}
		)

		this.entities.forEach((entity) => {
			this.finalizeTick(entity, delta)
			if (entity.markAsRemoved) {
				// console.log(
				// 	"remove entity",
				// 	entity.constructor.name,
				// 	this.entities.size
				// )
				if (entity.body) this.physics.remove(entity.body)
				this.entities.delete(entity.id)
				entity.onRemoveFromWorld()
			}
		})
	}
}
