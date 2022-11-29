import type { InternalConfiguration, UrbexErrorType, UrbexResponse } from "../exportable-types";
interface ErrorInstanceBinding {
    config: InternalConfiguration;
    request: any;
}
export declare class UrbexError extends Error implements UrbexErrorType {
    status: number;
    request: any;
    config: InternalConfiguration<any>;
    response: UrbexResponse<any>;
    static create<T extends typeof UrbexError>(this: T, config?: InternalConfiguration): InstanceType<T>;
    static createErrorInstance<T extends typeof UrbexError>(this: ErrorInstanceBinding, instance: T): InstanceType<T>;
    static isInstance<T extends typeof UrbexError>(error: any): error is InstanceType<T>;
}
export declare class TimeoutError extends UrbexError {
    constructor();
    set timeout(timeout: number);
}
export declare class NetworkError extends UrbexError {
    constructor();
}
export {};
