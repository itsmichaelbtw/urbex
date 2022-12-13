import type { InternalConfiguration } from "../../exportable-types";
import type { ResolvableEntity } from "../../types";

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
    entity: ResolvableEntity
): void {
    const status = environment.isNode ? entity.response.statusCode : entity.response.status;
    const errorInstance: UrbexError = UrbexError.createErrorInstance.call(this, UrbexError);

    errorInstance.status = status;
    errorInstance.response = entity.response;
    errorInstance.request = this.request;

    try {
        const canResolve = this.config.resolveStatus(this.config, status);

        if (canResolve) {
            return resolve(entity);
        }

        if (environment.isNode) {
            errorInstance.message = entity.response.statusMessage;
        } else {
            errorInstance.message = entity.response.statusText;
        }

        if (!errorInstance.message) {
            errorInstance.message = `Request failed with status code ${status}`;
        }

        return reject(errorInstance);
    } catch (error) {
        errorInstance.message = error.message;
        return reject(errorInstance);
    }
}
