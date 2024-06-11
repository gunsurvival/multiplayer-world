let lastId = 0

export function safeGenId(): number {
	// if (lastId === 156) throw new Error("Id limit reached")
	return ++lastId
}
