import type { IObject } from "./types";
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
/**
 * Check the Object.prototype.toString.call() of a value. Strips the [object ] part.
 */
export declare function toStringCall(value: any): string;
export declare function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
export declare function isUndefined(value: unknown): value is undefined;
export declare function isNegative(value: number): boolean;
export declare function isPositive(value: number): boolean;
export declare function absolute(value: number): number;
export declare function round(value: number, precision: number): number;
export declare function isArray<T>(value: unknown): value is T[];
export declare function isObject(value: unknown): value is object;
export declare function isString(value: unknown): value is string;
export declare function isFunction(value: unknown): value is Function;
export declare function isEmpty(value: any): boolean;
export declare function capitalize(value: string): string;
export declare function uppercase<T extends string>(value: T): T;
export declare function lowercase(value: string): string;
export declare function clone<T>(value: T): T;
export declare function merge<P = any, T = any>(defaultOptions: P, options: T): P & T;
export declare function deepMerge<T extends IObject[]>(...objects: T): UnionToIntersection<T[any]>;
export declare function keys<T extends IObject>(obj: T): (keyof T)[];
export declare function values<T extends IObject>(obj: T): T[keyof T][];
export declare function forEach<T>(obj: T, fn: (key: keyof T, value: T[keyof T], obj: T) => void): void;
export declare function extractMatchFromRegExp(value: string | null, regexp: RegExp, group?: number, defaultValue?: any): string | null;
export declare function startsWithReplacer(value: string, search: string, replace: string): string;
export declare function stringReplacer(value: string, search: string | RegExp, replace: string): string;
export declare function ensureLeadingToken(token: string, value: string): string;
export declare function ensureTrailingToken(token: string, value: string): string;
export declare function argumentIsNotProvided(value: unknown): boolean;
export declare function combineStrings(delimiter?: string, ...strings: string[]): string;
export declare function replaceObjectProperty<T extends IObject, K extends keyof T>(obj: T, key: K, value: T[K]): void;
export declare function safeStringify(value: any): string;
export declare function createEmptyScheme<T>(keys: string[]): T;
export {};
