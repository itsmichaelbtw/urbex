import type { IObject } from "../types";
import type { UrbexHeaders } from "../core/headers";

import {
    isNil,
    isUndefined,
    isNull,
    isArray,
    isObject,
    isEmpty,
    isObjectLike,
    isDate,
    isFunction,
    isArrayBuffer,
    isBuffer
} from "./is-x";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

export function asString(value: any): string {
    return Object.prototype.toString.call(value);
}

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty.call(obj, prop);
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

export function stringReplacer(value: string, search: string | RegExp, replace: string): string {
    return value.replace(search, replace);
}

export function ensureLeadingToken(token: string, value: string): string {
    if (isNil(value)) {
        return "";
    }

    if (value.startsWith(token)) {
        return value;
    }

    return `${token}${value}`;
}

export function ensureTrailingToken(token: string, value: string): string {
    if (isNil(value)) {
        return "";
    }

    if (value.endsWith(token)) {
        return value;
    }

    return `${value}${token}`;
}

export function combineStrings(delimiter = "", ...strings: string[]): string {
    return strings.filter((string) => !isEmpty(string)).join(delimiter);
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

export function convertToEncodedForm(data: any) {
    const searchParams = new URLSearchParams();

    function convert(value: any) {
        if (isNil(value)) {
            return "";
        } else if (isDate(value)) {
            return value.toISOString();
        } else {
            return value;
        }
    }

    function serialize(key: string, value: any) {
        if (value === null) {
            return;
        }

        const shouldStringify = key.endsWith("{}");

        if (shouldStringify) {
            key = key.replace("{}", "");
            value = safeStringify(value);
        } else {
            if (isArray(value)) {
                return forEach(value, (k, v) => {
                    serialize(`${key}[${k.toString()}]`, v);
                });
            } else if (isObject(value)) {
                return forEach(value, (k, v) => {
                    serialize(`${key}[${k}]`, v);
                });
            }
        }

        searchParams.append(key, convert(value));
    }

    forEach(data, (key, value) => {
        serialize(key as string, value);
    });

    console.log(searchParams);

    return searchParams.toString();
}

export function ensureContentLength(this: UrbexHeaders, byteLength: number) {
    if (byteLength > 0 && !this.has("Content-Length")) {
        this.set({
            "Content-Length": byteLength
        });
    }
}

export * from "./is-x";
