export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty.call(obj, prop);
}

export function isUndefined(value: unknown): value is undefined {
    return typeof value === "undefined";
}

export function isNegative(value: number): boolean {
    return value < 0;
}

export function isPositive(value: number): boolean {
    return value > 0;
}

export function absolute(value: number): number {
    return Math.abs(value);
}

export function round(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
}
