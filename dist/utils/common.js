export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}
export function lerpAngle(start, end, amt) {
    start %= 2 * Math.PI;
    const alpha = start;
    const beta = end;
    const rotates = [
        {
            result: Math.abs(alpha - beta),
            beta,
        },
        {
            result: Math.abs(alpha - (beta + 2 * Math.PI)),
            beta: beta + 2 * Math.PI,
        },
        {
            result: Math.abs(alpha - (beta - 2 * Math.PI)),
            beta: beta - 2 * Math.PI,
        },
    ];
    rotates.sort((a, b) => a.result - b.result);
    return lerp(start, rotates[0].beta, amt);
}
//# sourceMappingURL=common.js.map