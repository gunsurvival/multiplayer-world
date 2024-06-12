import { MapSchema as ColyMapSchema } from "@colyseus/schema"

import type { World } from "../world/World"
import { isSchemaType } from "../utils/common"
import { addWorldRecursive } from "@/utils/addWorldRecursive"

export class MapSchema<T = any> extends ColyMapSchema<T> {
	___: {
		world: World
	} = {} as any

	set(key: string | number, value: T): this {
		if (isSchemaType(value)) {
			addWorldRecursive(value, this.___.world)
		}

		return super.set(String(key), value)
	}

	get(key: string | number) {
		return super.get(String(key))
	}

	delete(key: string | number) {
		return super.delete(String(key))
	}
}
