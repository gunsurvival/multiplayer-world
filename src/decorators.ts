import { ServerController } from "./ServerController"
import { Schema } from "./schema/Schema"
import {
	_clientHandlersMap,
	_controllerHandlersMap,
	_serverHandlersMap,
	clientHandlersMap,
	controllerHandlersMap,
	serverHandlersMap,
} from "./shared/handlersMap"
import { RPCPacket } from "./types/RPCPacket"

export function Server({ sync = false } = {}) {
	// This decorator will make the method only run if the world is server side and send signal to call the method remotely on client side
	// It's mean any method that has this decorator will treat as "dispatch" method to client
	// Example creating a bullet, the bullet will be created on server (random data will be calculated on server)
	// and then dispatch to client to make sure both client and server have the same bullet data

	return function (
		target: any,
		propertyKey: any,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const originalMethod = descriptor.value
		checkFunction(originalMethod)

		const serverHandlers = _serverHandlersMap.get(target.constructor) || {}
		if (!_serverHandlersMap.has(target.constructor)) {
			_serverHandlersMap.set(target.constructor, serverHandlers)
		}
		serverHandlers[propertyKey] = originalMethod

		// target.serverHandlers ||= new Map<string, Function>()
		// if (target.serverHandlers.has(propertyKey)) {
		// 	// debugger
		// }
		// target.serverHandlers.set(propertyKey, originalMethod)
		// console.log("register server handler", propertyKey, target.constructor.name)

		descriptor.value = function (this: Schema, ...args: any[]) {
			if (this instanceof Schema) {
				if (this.world.isServerOnly() && sync) {
					// If current world is in server side, send rpc method to client
					// if (isPrivate) {
					// 	//TODO: make this If the method is private, only send to the entity's client (who control the entity)
					// 	if (this instanceof Entity && this.controller?.clientOnServer) {
					// 		this.world.room.send(this.controller.clientOnServer, "rpc", {
					// 			id: this.id,
					// 			method: propertyKey,
					// 			args,
					// 		})
					// 	}
					// } else {
					const packet: RPCPacket = [
						this.id,
						propertyKey,
						args.length ? args : undefined,
					]
					this.world.room.broadcast("rpc", packet)
					// }
				}
			}

			if (this.isServer) {
				// console.log(propertyKey, args, this)
				return originalMethod.bind(this)(...args)
			}
		}

		return descriptor
	}
}

export function Client() {
	return function (
		target: any,
		propertyKey: any,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const originalMethod = descriptor.value
		checkFunction(originalMethod)

		// target.clientHandlers ||= new Map<string, Function>()
		// target.clientHandlers.set(propertyKey, originalMethod)

		const clientHandlers = _clientHandlersMap.get(target.constructor) || {}
		if (!_clientHandlersMap.has(target.constructor)) {
			_clientHandlersMap.set(target.constructor, clientHandlers)
		}
		clientHandlers[propertyKey] = originalMethod

		// @ts-ignore
		// const errorProxy = new Proxy(
		// 	{},
		// 	{
		// 		get(target, key: string) {
		// 			if (key === "then") {
		// 				return Promise.resolve(errorProxy)
		// 			}
		// 			throw new Error(
		// 				`Method "${propertyKey}" is client only! Are you trying to use its return value on server side?`
		// 			)
		// 		},
		// 	}
		// )

		descriptor.value = function (this: Schema, ...args: any[]) {
			if (this.isClient) {
				return originalMethod.bind(this)(...args)
			}
		}

		return descriptor
	}
}

export function Controller({ serverOnly = false } = {}) {
	return function (
		target: any,
		propertyKey: any,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const originalMethod = descriptor.value
		checkFunction(originalMethod)

		// target.controllerHandlers ||= new Map<string, Function>()
		// target.controllerHandlers.set(propertyKey, originalMethod)

		const controllerHandlers =
			_controllerHandlersMap.get(target.constructor) || {}
		if (!_controllerHandlersMap.has(target.constructor)) {
			_controllerHandlersMap.set(target.constructor, controllerHandlers)
		}
		controllerHandlers[propertyKey] = originalMethod

		descriptor.value = function (this: ServerController, ...args: any[]) {
			if (this.target.world.isClientOnly()) {
				const packet: RPCPacket = [
					this.id,
					propertyKey,
					args.length ? args : undefined,
				]
				this.target.world.room.send("rpc-controller", packet)
			}

			if (!serverOnly || !this.isClient)
				return originalMethod.bind(this)(...args)
		}
	}
}

function checkFunction(func: any): asserts func is Function {
	if (!func || !(func instanceof Function)) {
		throw new Error("You must use this decorator on a method!")
	}
}
