import type { IObject } from "./types";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

/**
 * Check the Object.prototype.toString.call() of a value. Strips the [object ] part.
 */
export function toStringCall(value: any): string {
    const string = Object.prototype.toString.call(value);
    return lowercase(string.substring(8, string.length - 1));
}

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

export function isObject(value: unknown): value is object {
    return typeof value === "object" && value !== null && !isArray(value);
}

export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

export function isNumber(value: unknown): value is number {
    return typeof value === "number";
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
    value = String(value);

    if (value.length === 1) {
        return value.toUpperCase();
    } else {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

export function uppercase<T extends string>(value: T): T {
    return String(value).toUpperCase() as T;
}

export function lowercase(value: string): string {
    return String(value).toLowerCase();
}

export function clone<T>(value: T): T {
    if (isArray(value)) {
        return value.slice() as unknown as T;
    } else if (isObject(value)) {
        return Object.assign({}, value) as T;
    } else {
        return value;
    }
}

export function deepClone<T>(value: T): T {
    if (isArray(value)) {
        return value.map(deepClone) as unknown as T;
    } else if (isObject(value) && value.constructor === Object) {
        const clone = {} as T;

        for (const key in value) {
            if (hasOwnProperty(value, key)) {
                clone[key] = deepClone(value[key]);
            }
        }

        return clone;
    } else {
        return value;
    }
}

export function merge<P = any, T = any>(
    defaultOptions: P,
    options: T,
    strict: boolean = false
): P & T {
    if (strict) {
        const filteredOptions = keys(options).reduce((acc, key) => {
            if (options[key]) {
                acc[key] = options[key];
            }

            return acc;
        }, {} as T);

        return Object.assign({}, defaultOptions, filteredOptions);
    } else {
        return Object.assign({}, defaultOptions, options);
    }
}

export function deepMerge<T extends IObject[]>(...objects: T): UnionToIntersection<T[any]> {
    return objects.reduce((acc, obj) => {
        if (isArray(obj)) {
            return acc.concat(obj);
        }

        for (const key in obj) {
            if (isArray(acc[key]) && isArray(obj[key])) {
                acc[key] = acc[key].concat(obj[key]);
            } else if (isObject(acc[key]) && isObject(obj[key])) {
                acc[key] = deepMerge(acc[key], obj[key]);
            } else {
                acc[key] = obj[key];
            }
        }

        return acc;
    }, {});
}

export function keys<T extends IObject>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}

export function values<T extends IObject>(obj: T): T[keyof T][] {
    return keys(obj).map((key) => obj[key]);
}

export function forEach<T>(obj: T, fn: (key: keyof T, value: T[keyof T], obj: T) => void): void {
    if (isUndefined(obj)) {
        return;
    }

    if (isArray(obj)) {
        obj.forEach(function (value, index) {
            fn.call(null, index, value, obj);
        });
    } else {
        for (const key in obj) {
            fn.call(null, key, obj[key], obj);
        }
    }
}

export function extractMatchFromRegExp(
    value: string | null,
    regexp: RegExp,
    group = 0,
    defaultValue: any = null
): string | null {
    if (value) {
        const matches = regexp.exec(value);

        if (isArray(matches) && !isEmpty(matches)) {
            return matches[group];
        }
    }

    return defaultValue;
}

export function startsWithReplacer(value: string, search: string, replace: string): string {
    if (value.startsWith(search)) {
        return value.replace(search, replace);
    }

    return value;
}

export function stringReplacer(value: string, search: string | RegExp, replace: string): string {
    return value.replace(search, replace);
}

export function ensureLeadingToken(token: string, value: string): string {
    if (argumentIsNotProvided(value)) {
        return "";
    }

    if (value.startsWith(token)) {
        return value;
    }

    return `${token}${value}`;
}

export function ensureTrailingToken(token: string, value: string): string {
    if (argumentIsNotProvided(value)) {
        return "";
    }

    if (value.endsWith(token)) {
        return value;
    }

    return `${value}${token}`;
}

export function argumentIsNotProvided(value: unknown): boolean {
    return value === undefined || value === null;
}

export function combineStrings(delimiter = "", ...strings: string[]): string {
    return strings.filter((string) => !isEmpty(string)).join(delimiter);
}

export function replaceObjectProperty<T extends IObject, K extends keyof T>(
    obj: T,
    key: K,
    value: T[K]
): void {
    Object.assign(obj, { [key]: value });
}

export function safeStringify(value: any): string {
    try {
        return JSON.stringify(value);
    } catch (error) {
        return "";
    }
}

export function safeJSONParse(value: string, returnValueOnError = false): any {
    try {
        return JSON.parse(value);
    } catch (error) {
        if (returnValueOnError) {
            return value;
        }

        return null;
    }
}

export function createEmptyScheme<T>(keys: string[], value = null): T {
    return keys.reduce((acc, key) => {
        const keys = key.split(".");

        if (keys.length === 1) {
            acc[key] = value;
        } else {
            const [object, ...nestedKeys] = keys;

            if (!acc[object]) {
                acc[object] = {};
            }

            const nestedObject = createEmptyScheme(nestedKeys);
            acc[object] = merge(acc[object], nestedObject);
        }

        return acc;
    }, {} as T);
}

export function mutate<T>(value: T, mutator: (value: T) => void): T {
    mutator(value);
    return value;
}
