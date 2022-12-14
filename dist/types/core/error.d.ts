import type { InternalConfiguration, UrbexErrorType, UrbexResponse } from "../exportable-types";
interface ErrorInstanceBinding {
    config: InternalConfiguration;
    request: any;
}
/**
 * Base error class for Urbex that extends the native Error class.
 */
export declare class UrbexError extends Error implements UrbexErrorType {
    status: number;
    request: any;
    config: InternalConfiguration<any>;
    response: UrbexResponse<any>;
    message: string;
    static create<T extends typeof UrbexError>(this: T, config?: InternalConfiguration): InstanceType<T>;
    static createErrorInstance<T extends typeof UrbexError>(this: ErrorInstanceBinding, instance: T): InstanceType<T>;
    static createFromError<T extends typeof UrbexError>(this: T, error: Error): InstanceType<T>;
    static isInstance<T extends typeof UrbexError>(error: any): error is InstanceType<T>;
}
/**
 * A TimeoutError is thrown when the request takes longer than the specified timeout.
 */
export declare class TimeoutError extends UrbexError {
    constructor(message?: string);
}
/**
 * A NetworkError is thrown when the request fails to reach the server.
 */
export declare class NetworkError extends UrbexError {
    constructor(message?: string);
}
/**
 * A PipelineError is thrown when executing a pipeline fails.
 */
export declare class PipelineError extends UrbexError {
    constructor(message?: string);
}
export {};
