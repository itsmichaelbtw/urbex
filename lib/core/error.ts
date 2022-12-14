import type { InternalConfiguration, UrbexErrorType, UrbexResponse } from "../exportable-types";

interface ErrorInstanceBinding {
    config: InternalConfiguration;
    request: any;
}

function replaceCallStackWithName(stack: string, name: string): string {
    return stack.replace(/^Error/, name);
}

/**
 * Base error class for Urbex that extends the native Error class.
 */
export class UrbexError extends Error implements UrbexErrorType {
    status: number;
    request: any;
    config: InternalConfiguration<any>;
    response: UrbexResponse<any>;
    message: string = "An error occurred while executing a request.";

    static create<T extends typeof UrbexError>(
        this: T,
        config?: InternalConfiguration
    ): InstanceType<T> {
        const error = new this();
        error.config = config;
        error.name = this.name;

        return error as InstanceType<T>;
    }

    static createErrorInstance<T extends typeof UrbexError>(
        this: ErrorInstanceBinding,
        instance: T
    ): InstanceType<T> {
        const error = instance.create.call(instance, this.config);
        error.request = this.request;
        return error as InstanceType<T>;
    }

    static createFromError<T extends typeof UrbexError>(this: T, error: Error): InstanceType<T> {
        if (!(error instanceof Error)) {
            error = new Error(error);
        }

        const instance = new this(error.message);

        if (error.stack) {
            instance.stack = replaceCallStackWithName(error.stack, this.name);
        }

        instance.name = this.name;

        if (UrbexError.isInstance(error)) {
            instance.name = error.name;
        }

        return instance as InstanceType<T>;
    }

    static isInstance<T extends typeof UrbexError>(error: any): error is InstanceType<T> {
        return error instanceof UrbexError;
    }
}

/**
 * A TimeoutError is thrown when the request takes longer than the specified timeout.
 */
export class TimeoutError extends UrbexError {
    constructor(message?: string) {
        super();

        this.name = "TimeoutError";
        this.message = message || "The request timed out.";
    }
}

/**
 * A NetworkError is thrown when the request fails to reach the server.
 */
export class NetworkError extends UrbexError {
    constructor(message?: string) {
        super();

        this.name = "NetworkError";
        this.message = message || "Failed to request the resource.";
    }
}

/**
 * A PipelineError is thrown when executing a pipeline fails.
 */
export class PipelineError extends UrbexError {
    constructor(message?: string) {
        super();

        this.name = "PipelineError";
        this.message = message || "An error occurred while executing a pipeline.";
    }
}
