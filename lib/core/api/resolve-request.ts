import type { InternalConfiguration } from "../../exportable-types";

import { environment } from "../../environment";
import { UrbexError } from "../error";

type Resolve = (value: any) => void;
type Reject = (reason?: any) => void;

interface ResolvableBindings {
    config: InternalConfiguration;
    request: any;
}

export function resolveRequest(
    this: ResolvableBindings,
    resolve: Resolve,
    reject: Reject,
    entity: any
): void {
    const status = environment.isNode ? entity.response.statusCode : entity.response.status;
    const canResolve = this.config.resolveStatus(this.config, status);

    if (canResolve) {
        return resolve(entity);
    }

    const error: UrbexError = UrbexError.createErrorInstance.call(this, UrbexError);
    const errorMessage = `Request failed with status code ${status}`;

    error.message = environment.isNode
        ? entity.response.statusMessage
        : entity.response.statusText ?? errorMessage;
    error.request = this.request;
    error.status = status;
    error.response = entity.response;

    return reject(error);
}
