import { reservedKeys } from "@/shared/reservedKeys"
import { ArraySchema } from "../schema/ArraySchema"
import { MapSchema } from "../schema/MapSchema"
import { Schema } from "../schema/Schema"
import { findSchemaRecursive } from "./findSchemaRecursive"
import { SchemaType } from "@/types/SchemaType"
import { World } from "../world/World"

export function findStateRecursive(
	state: any,
	result: any[] = [],
	skipRoot = false
) {
	if (!skipRoot) {
		if (state instanceof Schema) {
			result.push(state)
		}
	}

	if (state instanceof MapSchema || state instanceof ArraySchema) {
		state.forEach((value, key) => {
			findStateRecursive(value, result)
		})
	} else if (typeof state === "object") {
		Object.keys(state).forEach((key) => {
			if (reservedKeys.includes(key)) {
				return
			}

			findStateRecursive(state[key], result)
		})
	}

	return result
}

export function addWorldRecursive(schema: SchemaType, world: World) {
	const schemas = findSchemaRecursive(schema, [])

	schemas.forEach((schema) => {
		schema.___.world = world
		if (schema instanceof Schema) {
			world.__schemaMap.set(schema.id, schema)
		}
	})
	return schemas
}
