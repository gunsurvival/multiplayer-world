import { reservedKeys } from "@/shared/reservedKeys"
import { ArraySchema, MapSchema, Schema } from "../schema"
import { SchemaType } from "@/types/SchemaType"

export function findSchemaRecursive(
	schema: SchemaType,
	result: SchemaType[] = [],
	skipRoot = false
): SchemaType[] {
	if (!skipRoot) {
		if (
			schema instanceof Schema ||
			schema instanceof MapSchema ||
			schema instanceof ArraySchema
		) {
			result.push(schema)
		}
	}

	if (schema instanceof Schema) {
		// @ts-ignore
		Object.keys(schema.constructor._definition.schema)
			.filter((key) => !reservedKeys.includes(key))
			.forEach((childField) => {
				// @ts-ignore
				findSchemaRecursive(schema[childField], result)
			})
	}

	if (schema instanceof MapSchema) {
		;(schema as MapSchema<Schema>).forEach((mapItem) => {
			findSchemaRecursive(mapItem, result)
		})
	}

	if (schema instanceof ArraySchema) {
		;(schema as ArraySchema<any>).forEach((arrayItem) => {
			findSchemaRecursive(arrayItem, result)
		})
	}

	return result
}
