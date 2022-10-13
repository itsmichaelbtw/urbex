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

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isEmpty(value: any): boolean {
    if (isArray(value)) {
        return value.length === 0;
    } else if (isObject(value)) {
        return Object.keys(value).length === 0;
    } else {
        return !value;
    }
}

export function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function uppercase(value: string): string {
    return value.toUpperCase();
}

export function lowercase(value: string): string {
    return value.toLowerCase();
}

export function clone<T>(value: T): T {
    if (isArray(value)) {
        return value.slice() as T;
    } else if (isObject(value)) {
        return { ...value } as T;
    } else {
        return value;
    }
}

export function assignOptions<P, T>(defaultOptions: P, options: T): P & T {
    return Object.assign({}, defaultOptions, options);
}
