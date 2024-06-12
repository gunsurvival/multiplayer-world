import { Entity } from "@/entity"
import { World } from "@/world"
import { Room, Server as ColyServer } from "@colyseus/core"
import { Client as ColyClient } from "colyseus.js"
import { WebSocketTransport } from "@colyseus/ws-transport"
import { createWorld } from "@/utils/createWorld"

class MyWorld extends World {
	async prepare(options: Parameters<this["init"]>[0]): Promise<void> {}
}

class MyEntity extends Entity<World> {
	async prepare(options: Parameters<this["init"]>[0]): Promise<void> {}
}

class PlaygroundColy extends Room<MyWorld> {
	onCreate() {
		const world = createWorld(MyWorld, {
			mode: "server",
			room: this,
		})
		world.registerEntityClass(MyEntity)

		this.setState(world)
		console.log("Playground room created!")

		this.onMessage("get-snapshot", async (client, message) => {
			client.send("snapshot", this.state.getSnapshot())
		})

		this.onMessage("ping", async (client, message) => {
			client.send("pong", message)
		})

		this.onMessage("ready-to-join", async (client, message) => {
			// console.log("ready to join")
			// const entity = await this.state.addEntity("Gunner", {
			// 	pos: {
			// 		x: 100,
			// 		y: 100,
			// 	},
			// })
			// const ak47 = await this.state.addEntity("Ak47", {
			// 	holderId: entity.id,
			// })
			// setTimeout(() => {
			// 	;(entity as Entities.Gunner).backpack.add(ak47.id)
			// }, 2000)
			//! Nếu xài addController thì khúc "addControllerById" trong hàm đó nó sẽ broadcast rpc tới tất cả client
			//! Nên phải xài addControllerById để chỉ gửi rpc tới client đó
			// const controller = entity
			// 	.sync(client)
			// 	.addControllerById(safeGenId(), "GunnerController", {})
			// client.userData?.controllers.set(String(controller.id), controller)
		})
	}

	onJoin() {
		this.state.addEntity("MyEntity", 1)
		// this.state.entities.forEach((entity) => {
		// 	entity.moveTo(10, 10)
		// 	entity.backpack.addGold(100)
		// })
	}

	onLeave() {
		console.log("Player left!")
	}

	onDispose() {
		console.log("Room disposed!")
	}
}

const server = new ColyServer({
	transport: new WebSocketTransport(),
})

server.define("playground", PlaygroundColy)
server.listen(2567).then(() => {
	console.log("Server started! 2567")
})

setTimeout(() => {
	const client = new ColyClient("ws://localhost:2567")
	client.joinOrCreate<MyWorld>("playground").then(async (room) => {
		room.onMessage("*", (type, message) => {
			console.log(type, message)
		})
		const worldClient = createWorld(MyWorld, {
			mode: "client",
			room,
		})
		worldClient.registerEntityClass(MyEntity)
	})
}, 1000)
