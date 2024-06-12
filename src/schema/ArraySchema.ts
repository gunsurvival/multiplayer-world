import { ArraySchema as ColyArraySchema } from "@colyseus/schema"

import type { World } from "../world/World"
import { Schema } from "./Schema"
import { addWorldRecursive } from "@/utils/addWorldRecursive"

export class ArraySchema<T = any> extends ColyArraySchema<T> {
	___: {
		world: World
	} = {} as any

	push(...values: T[]): number {
		values.forEach((value) => {
			if (value instanceof Schema) {
				addWorldRecursive(value, this.___.world)
			}
		})
		return super.push(...values)
	}
}
