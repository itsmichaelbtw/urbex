import type { Stream } from "stream";

import { asString } from "./index";

export function isArray<T = any>(value: any): value is T[] {
    return asString(value) === "[object Array]";
}

export function isObject(value: any): value is object {
    return asString(value) === "[object Object]";
}

export function isObjectLike(value: any): value is object {
    return typeof value === "object" && value !== null;
}

export function isFunction(value: any): value is Function {
    return asString(value) === "[object Function]";
}

export function isString(value: any): value is string {
    return asString(value) === "[object String]";
}

export function isNumber(value: any): value is number {
    return asString(value) === "[object Number]";
}

export function isBoolean(value: any): value is boolean {
    return asString(value) === "[object Boolean]";
}

export function isDate(value: any): value is Date {
    return asString(value) === "[object Date]";
}

export function isUndefined(value: any): value is undefined {
    return value === undefined;
}

export function isNull(value: any): value is null {
    return value === null;
}

export function isNil(value: any): value is null | undefined {
    return isNull(value) || isUndefined(value);
}

export function isBuffer(value: any): value is Buffer {
    return (
        !isNil(value) &&
        value.constructor &&
        isFunction(value.constructor.isBuffer) &&
        value.constructor.isBuffer(value)
    );
}

export function isArrayBuffer(value: any): value is ArrayBuffer {
    return asString(value) === "[object ArrayBuffer]";
}

export function isArrayBufferView(value: any): value is ArrayBufferView {
    return !isNil(value) && isFunction(ArrayBuffer.isView) && ArrayBuffer.isView(value);
}

export function isFormData(value: any): value is FormData {
    return typeof FormData !== "undefined" && value instanceof FormData;
}

export function isFile(value: any): value is File {
    return asString(value) === "[object File]";
}

export function isFileList(value: any): value is FileList {
    return asString(value) === "[object FileList]";
}

export function isBlob(value: any): value is Blob {
    return asString(value) === "[object Blob]";
}

export function isStream(value: any): value is Stream {
    return value && isFunction(value.pipe);
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
