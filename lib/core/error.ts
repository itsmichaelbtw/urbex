import type { InternalConfiguration, UrbexErrorType, UrbexResponse } from "../exportable-types";

interface ErrorInstanceBinding {
    config: InternalConfiguration;
    request: any;
}
export class UrbexError extends Error implements UrbexErrorType {
    status: number;
    request: any;
    config: InternalConfiguration<any>;
    response: UrbexResponse<any>;

    static create<T extends typeof UrbexError>(
        this: T,
        config?: InternalConfiguration
    ): InstanceType<T> {
        const error = new this();
        error.config = config;

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

    static isInstance<T extends typeof UrbexError>(error: any): error is InstanceType<T> {
        return error instanceof UrbexError;
    }
}

export class TimeoutError extends UrbexError {
    constructor() {
        super();

        this.name = "TimeoutError";
        this.message = "The request timed out.";
    }

    public set timeout(timeout: number) {
        this.message = `Timeout of ${timeout}ms exceeded`;
    }
}

export class NetworkError extends UrbexError {
    constructor() {
        super();

        this.name = "NetworkError";
        this.message = "Failed to request the resource.";
    }
}
