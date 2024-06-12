// unbuild handlers
export const _serverHandlersMap = new Map<any, Record<string, Function>>()
export const _clientHandlersMap = new Map<any, Record<string, Function>>()
export const _controllerHandlersMap = new Map<any, Record<string, Function>>()

// built handlers
export const serverHandlersMap = new Map<any, Map<string, Function>>()
export const clientHandlersMap = new Map<any, Map<string, Function>>()
export const controllerHandlersMap = new Map<any, Map<string, Function>>()
