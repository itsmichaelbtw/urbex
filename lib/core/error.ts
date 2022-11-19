import type { InternalConfiguration, UrbexErrorType, UrbexResponse } from "../exportable-types";

export class UrbexError extends Error implements UrbexErrorType {
    status: number;
    request: any;
    config: InternalConfiguration<any>;
    response: UrbexResponse<any>;

    constructor(error: any) {
        if (!(error instanceof Error)) {
            error = new Error(error);
        }

        super(error.message);
        this.name = error.name;
        this.stack = error.stack;
    }

    static create(
        error: any,
        config: InternalConfiguration<any>,
        response: UrbexResponse<any>
    ): UrbexError {
        const urbexError = new UrbexError(error);

        urbexError.config = config;
        urbexError.response = response;
        urbexError.status = response.status;
        urbexError.request = config;

        return urbexError;
    }
}

export class TimeoutError extends UrbexError {
    constructor(timeout: number) {
        const error = new Error(`Request timed out after ${timeout}ms.`);

        super(error);
    }
}
