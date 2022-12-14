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

    try {
        const canResolve = this.config.resolveStatus(this.config, status);

        if (canResolve) {
            return resolve(entity);
        }

        const errorInstance: UrbexError = UrbexError.createErrorInstance.call(this, UrbexError);

        errorInstance.status = status;
        errorInstance.response = entity.response;
        errorInstance.request = this.request;

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
        const errorInstance: UrbexError = UrbexError.createFromError.call(UrbexError, error);

        errorInstance.message = error.message;
        errorInstance.config = this.config;
        errorInstance.request = this.request;
        errorInstance.response = entity.response;
        errorInstance.status = status;

        return reject(errorInstance);
    }
}
