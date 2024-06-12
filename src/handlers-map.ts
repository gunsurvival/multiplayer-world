import {
	_clientHandlersMap,
	_controllerHandlersMap,
	_serverHandlersMap,
	clientHandlersMap,
	controllerHandlersMap,
	serverHandlersMap,
} from "@/shared/handlersMap"

function getHandlersMapByType<
	Temp extends boolean,
	Return extends Temp extends true
		? Map<any, Record<string, Function>>
		: Map<any, Map<string, Function>>
>(type: "server" | "client" | "controller", isTemp: Temp): Return {
	return (() => {
		switch (type) {
			case "server":
				return isTemp ? _serverHandlersMap : serverHandlersMap
			case "client":
				return isTemp ? _clientHandlersMap : clientHandlersMap
			case "controller":
				return isTemp ? _controllerHandlersMap : controllerHandlersMap
		}
	})() as Return
}

function getRecordHandlers(
	constructor: any,
	type: "server" | "client" | "controller"
): Record<string, Function> {
	const _handlersMap = getHandlersMapByType(type, true)
	const handlersMap = getHandlersMapByType(type, false)
	if (!constructor) {
		return {}
	}
	const result = {
		...getRecordHandlers(Object.getPrototypeOf(constructor), type),
		..._handlersMap.get(constructor)!,
	}
	handlersMap.set(constructor, createMapFromRecord(result))
	return result
}

export function getHandlers(
	constructor: any,
	type: "server" | "client" | "controller"
): Map<string, Function> {
	const handlersMap = getHandlersMapByType(type, false)
	if (handlersMap.has(constructor)) {
		return handlersMap.get(constructor)!
	}
	const record = getRecordHandlers(constructor, type)
	const map = createMapFromRecord(record)
	handlersMap.set(constructor, map)
	return map
}

function createMapFromRecord<K extends string, V>(
	record: Record<K, V>
): Map<K, V> {
	const map = new Map<K, V>()

	// Iterate over each entry in the record
	Object.entries(record).forEach(([key, value]) => {
		map.set(key as K, value as V) // Set each entry in the map
	})

	return map
}
