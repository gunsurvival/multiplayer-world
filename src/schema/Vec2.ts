import { Schema } from "@/lib/multiplayer-world/schema/Schema"
import { type } from "@colyseus/schema"

export class Vec2 extends Schema {
	@type("int16") x: number = 0
	@type("int16") y: number = 0

	len() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}
}
