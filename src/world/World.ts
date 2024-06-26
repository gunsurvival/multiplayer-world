import { System, type Response } from "detect-collisions"
import { Room as RoomServer } from "@colyseus/core"
import { Room as RoomClient } from "colyseus.js"

import { Schema } from "../schema/Schema"
import { pairClientServer } from "../utils/common"
import { waitFor } from "../utils/waitFor"
import { Server } from "../decorators"
import { ServerController } from "../ServerController"
import { MapSchema, type } from "../schema"
import { Entity } from "../entity/Entity"
import type { BodyRefEntity } from "../utils/dectect-collisions"
import { safeGenId } from "../utils/safeGenId"
import { RPCPacket } from "@/types/RPCPacket"

export abstract class World extends Schema {
	@type({ map: Entity }) entities = new MapSchema<Entity>()

	room?: RoomServer | RoomClient
	__holderMap = new Map<Schema["id"], Schema>() // holding schema at client
	__schemaMap = new Map<Schema["id"], Schema>() // holding schema at both
	__isServer = false
	__isClient = false

	clientState = {}
	frameCount = 0
	entityRegistry = new Map<string, typeof Entity>()
	controllerRegistry = new Map<string, typeof ServerController<Entity>>()

	physics = new System()
	collisionHashMap = new Map<string, Response>()
	newCollisionHashMap = new Map<string, Response>()

	constructor({ mode, room, entityClasses, controllerClasses }: WorldOptions) {
		super()
		if (mode === "server") {
			this.__isServer = true
			this.__isClient = false
			if (!room) {
				throw new Error("RoomServer is required for server mode!")
			}
			this.room = room
		} else if (mode === "client") {
			this.__isServer = false
			this.__isClient = true
			if (!room) {
				throw new Error("RoomClient is required for client mode!")
			}
			this.room = room
		} else if (mode === "both") {
			this.__isServer = true
			this.__isClient = true
			if (room) {
				throw new Error('Do not pass any "room" in mode "both"!')
			}
		} else {
			throw new Error("Invalid mode!")
		}

		if (entityClasses) {
			Object.entries(entityClasses).forEach(([className, entityClass]) => {
				this.registerEntityClass(entityClass)
			})
		}

		if (controllerClasses) {
			Object.entries(controllerClasses).forEach(
				([className, controllerClass]) => {
					this.registerControllerClass(controllerClass)
				}
			)
		}
	}

	abstract prepare(options: Parameters<this["init"]>[0]): Promise<void>

	nextTick(delta: number) {
		this.frameCount++
	}

	init(
		options: Partial<{
			entities: [string, number, ReturnType<Entity["getSnapshot"]>][]
		}>
	) {
		if (options.entities) {
			this.entities.clear()
			options.entities.forEach(async ([className, id, entitySnapshot]) => {
				this.skipCheck().addEntityById(id, className, entitySnapshot)
			})
		}
	}

	getSnapshot(): Parameters<this["init"]>[0] {
		return {
			entities: Array.from(this.entities.values()).map((entity) => [
				entity.constructor.name,
				entity.id,
				entity.getSnapshot(),
			]) as [string, number, ReturnType<Entity["getSnapshot"]>][],
		}
	}

	start(): () => void {
		this.frameCount = 0
		const nextTick = this.nextTick.bind(this)
		let interval = setInterval(() => {
			nextTick(1000 / 60)
		}, 1000 / 60)
		return () => {
			clearInterval(interval)
		}
	}

	@Server()
	// Why skipSync: we are just create id on server side to make sure both client and server have the same id (passing to addEntityById)
	// So we don't need to sync this line to client as the addEntityById will be skipped on client side (because it's server only)
	async addEntity(
		className: string,
		options?: {}
		// options: Parameters<
		// 	(typeof Entities)[ClassName] extends typeof Entity
		// 		? InstanceType<(typeof Entities)[ClassName]>["init"]
		// 		: (options: {}) => any
		// >[0]
	) {
		const id = safeGenId()
		return this.addEntityById(id, className, options)
	}

	@Server({ sync: true })
	addEntityById(id: number, className: string, options?: {}) {
		const entityClass = this.entityRegistry.get(className)
		if (!entityClass) {
			throw new Error(
				`Entity class "${className}" not found! Do you forget to register it?`
			)
		}
		// @ts-ignore
		const entity = new entityClass() as Entity
		entity.id = id
		this.entities.set(entity.id, entity)
		//! init must be apear after Map set or Array push
		// entity._options = options

		// Flow must be like this: prepare -> init -> physic insert -> onAddToWorld

		const afterPrepare = () => {
			entity.init(options)
			if (entity.body) {
				;(entity.body as BodyRefEntity).entitiyRef = entity
				this.physics.insert(entity.body)
				// console.log("insert", className, this.world.entities.size)
			}
			entity.onAddToWorld()
			entity.readyToRender = true
		}

		if (this.isClient) {
			// only run prepare on client or both
			;(async () => {
				await entity.prepare(options)
				afterPrepare()
			})().catch((error) => {
				console.error(
					`Error while preparing entity ${entity.constructor.name}:`,
					error
				)
			})
		} else {
			// server only, do not run prepare
			afterPrepare()
		}

		return entity
	}

	@Server()
	removeEntity(entity: Entity | Entity[]) {
		const entities = Array.isArray(entity) ? entity : [entity]
		entities.forEach((entity) => {
			this.removeEntityById(entity.id)
			entity.onRemoveFromWorld()
		})
	}

	@Server()
	removeEntityById(id: number | number[]) {
		const ids = Array.isArray(id) ? id : [id]
		ids.forEach((id) => {
			const entity = this.entities.get(id)
			if (entity) {
				entity.markAsRemoved = true
			}
		})
	}

	registerEntityClass(entityClass: typeof Entity<World>) {
		if (this.entityRegistry.has(entityClass.name)) {
			throw new Error(
				`Entity class "${entityClass.name}" already exists in world "${this.constructor.name}"!`
			)
		}
		this.entityRegistry.set(entityClass.name, entityClass as typeof Entity)
	}

	registerControllerClass(controllerClass: typeof ServerController<Entity>) {
		if (this.controllerRegistry.has(controllerClass.name)) {
			throw new Error(
				`Controller class "${controllerClass.name}" already exists in world "${this.constructor.name}"!`
			)
		}
		this.controllerRegistry.set(controllerClass.name, controllerClass)
	}

	beforeTick(entity: Entity, delta: number) {
		entity.beforeTick(delta)
	}
	finalizeTick(entity: Entity, delta: number) {
		entity.finalizeTick(delta)
	}

	get isClient() {
		return this.__isClient
	}

	get isServer() {
		return this.__isServer
	}

	isServerOnly(): this is { room: RoomServer } {
		return this.isServer && !this.isClient
	}

	isClientOnly(): this is { room: RoomClient } {
		return !this.isServer && this.isClient
	}

	isBoth(): this is { room: undefined } {
		return this.isServer && this.isClient
	}

	clientOnly<T extends any>(func: () => T): T {
		if (this.isClient) {
			return func()
		} else {
			return new Proxy(
				{},
				{
					get: () => {
						throw new Error("This property is client-only!")
					},
					set: () => {
						throw new Error("This property is client-only!")
					},
				}
			) as T
		}
	}

	/** Run this setup on client */
	async setupServerRPC(roomClient: RoomClient) {
		const applySnapshot = async () => {
			return new Promise<ReturnType<this["getSnapshot"]>>((resolve) => {
				const remove = roomClient.onMessage(
					"snapshot",
					(snapshot: ReturnType<this["getSnapshot"]>) => {
						this.init(snapshot)
						console.log("snapshot", JSON.stringify(snapshot))
						remove()
						resolve(snapshot)
					}
				)
				roomClient.send("get-snapshot")
			})
		}

		const pairing = async () => {
			return new Promise<void>((resolve) => {
				// roomClient.onStateChange.once((state) => {
				pairClientServer(this, roomClient.state, this.__holderMap)
				resolve()
				// })
			})
		}

		const setupRPC = () => {
			return roomClient.onMessage<RPCPacket>("rpc", async (message) => {
				console.log("rpc", message)
				const [id, method, args = []] = message
				try {
					// TODO: refactor this not to use waitFor, hook on holderMap adding event
					await waitFor(() => this.__holderMap.has(id), {
						waitForWhat: `holderMap has ${id}`,
						timeoutMs: 5000,
						immediate: true,
						intervalMs: 10,
					})

					const clientSchema = this.__holderMap.get(id)!
					const handler =
						clientSchema.serverHandlers.get(method) ||
						clientSchema.clientHandlers.get(method) ||
						(clientSchema[method as keyof typeof clientSchema] as Function)
					if (!handler) {
						throw new Error(`Handler not found for ${method}`)
					}
					if (!(handler instanceof Function)) {
						throw new Error(`Handler "${method}" is not a function!`)
					}
					// console.log(`CLIENT: Invoking ${message.method} with args:`, message.args);
					clientSchema?.eventHandlers
						.get(method)
						?.forEach((handler) => handler.bind(clientSchema)(...args))

					handler.bind(clientSchema)(...args)
				} catch (error) {
					console.error(`RPC error for method "${method}":`, message, error)
				}
			})
		}

		await applySnapshot()
		await pairing()
		setupRPC()
		roomClient.send("ready-to-join")
	}

	/** Run this setup on server */
	setupClientRPC(roomServer: RoomServer) {
		roomServer.onMessage<RPCPacket>(
			"rpc-controller",
			async (client, message) => {
				const [id, method, args = []] = message
				try {
					const controllers = client.userData?.controllers as
						| Map<number, ServerController>
						| undefined
					const controller = controllers?.get(id)
					if (!controller) {
						throw new Error(`Controller not found on client for id "${id}"`)
					}

					const handler = controller.controllerHandlers.get(method)
					if (!handler) {
						throw new Error(
							`Handler "${method}" not found on controller "${controller.constructor.name}"!`
						)
					}
					if (!(handler instanceof Function)) {
						throw new Error(`Handler "${method}" is not a function!`)
					}
					handler.bind(controller)(...args)
				} catch (error) {
					console.error("RPC error:", error)
				}
			}
		)
	}
}

export type WorldOptions = (
	| {
			mode: "server"
			room: RoomServer
	  }
	| {
			mode: "client"
			room: RoomClient
	  }
	| {
			mode: "both"
			room?: undefined
	  }
) & {
	entityClasses?: Record<string, typeof Entity<World>>
	controllerClasses?: Record<string, typeof ServerController<Entity>>
}
