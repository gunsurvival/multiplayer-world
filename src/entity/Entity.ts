import { Schema, type, Vec2 } from "@/schema"
import { Server } from "@/decorators"
import { ServerController } from "@/ServerController"
import type { Body } from "detect-collisions"
import { World } from "@/world/World"
import type { SerializedResponse } from "@/utils/dectect-collisions"
import { lerp, lerpAngle } from "@/utils/smooth"
import { safeGenId } from "@/utils/safeGenId"

export abstract class Entity<
	TWorld extends World = World
> extends Schema<TWorld> {
	@type(Vec2) pos = new Vec2()
	@type("float32") rotation = 0

	body: Body | undefined
	vel = new Vec2()
	friction = 0.91
	readyToRender = false
	controller: ServerController | undefined
	markAsRemoved = false

	get isControlling() {
		return Boolean(this.controller)
	}

	abstract prepare(options: Parameters<this["init"]>[0]): Promise<void>

	init(options: Record<string, any> = {}): void {
		const defaultOptions = options as Partial<{
			pos: { x: number; y: number }
			vel: { x: number; y: number }
			rotation: number
		}>
		if (defaultOptions.pos) {
			this.pos.x = defaultOptions.pos.x
			this.pos.y = defaultOptions.pos.y
			if (this.body) this.body.setPosition(this.pos.x, this.pos.y)
		}
		if (defaultOptions.vel) {
			this.vel.x = defaultOptions.vel.x
			this.vel.y = defaultOptions.vel.y
		}
		if (defaultOptions.rotation) {
			this.rotation = defaultOptions.rotation
		}
	}

	initClient(options: {}) {}

	getSnapshot(): Parameters<this["init"]>[0] {
		return {
			pos: { x: this.pos.x, y: this.pos.y },
			vel: { x: this.vel.x, y: this.vel.y },
		}
	}

	onAddToWorld() {}
	onRemoveFromWorld() {}

	// TODO: change "typeof this" to be filtered schema only
	onAttachServerState(serverState: typeof this) {}
	reconcileServerState(serverState: typeof this) {
		this.pos.x = lerp(this.pos.x, serverState.pos.x, 0.1)
		this.pos.y = lerp(this.pos.y, serverState.pos.y, 0.1)
		// this.vel.x = lerp(this.vel.x, serverState.vel.x, 0.1)
		// this.vel.y = lerp(this.vel.y, serverState.vel.y, 0.1)
		this.rotation = lerpAngle(this.rotation, serverState.rotation, 0.1)
	}

	beforeTick(deltaTime: number) {}
	finalizeTick(deltaTime: number) {}
	nextTick(deltaTime: number) {}

	@Server()
	addController(className: string, options: {}) {
		const id = safeGenId()
		return this.addControllerById(id, className, options)
	}

	// @Server({ isPrivate: true })
	@Server()
	addControllerById(id: number, className: string, options: {}) {
		const controllerClass = this.world.controllerRegistry.get(className)
		if (!controllerClass) {
			throw new Error(`Controller class "${className}" not found!`)
		}
		const controller = new controllerClass(id, this) as ServerController<Entity>
		controller.init(options)
		if (this.isClient) {
			controller.setupClient()
		}

		this.controller = controller
		console.log("Controller added: ", controller.id)
		return controller
	}

	@Server()
	applyForceByAngle(angle: number, force: number) {
		this.vel.x += Math.cos(angle) * force
		this.vel.y += Math.sin(angle) * force
	}

	@Server()
	applyForceByVelocity(
		velocity: {
			x: number
			y: number
		},
		force: number
	) {
		this.vel.x += velocity.x * force
		this.vel.y += velocity.y * force
	}

	@Server()
	onCollisionEnter(otherId: number, response: SerializedResponse) {}

	// Dont use server decorator here (lack of datapack)
	onCollisionStay(otherId: number, response: SerializedResponse) {}

	@Server()
	onCollisionExit(otherId: number, response: SerializedResponse) {}

	@Server({ sync: true })
	destroy() {
		this.markAsRemoved = true
	}
}
