import type { InternalConfiguration, UrbexErrorType, UrbexResponse } from "../exportable-types";
export declare class UrbexError extends Error implements UrbexErrorType {
    status: number;
    request: any;
    config: InternalConfiguration<any>;
    response: UrbexResponse<any>;
    constructor(error: any);
    static create(error: any, config: InternalConfiguration<any>, response: UrbexResponse<any>): UrbexError;
}
export declare class TimeoutError extends UrbexError {
    constructor(timeout: number);
}
