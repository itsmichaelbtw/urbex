import type { InternalConfiguration } from "../../exportable-types";
import type { ResolvableEntity } from "../../types";
type Resolve = (value: any) => void;
type Reject = (reason?: any) => void;
interface ResolvableBindings {
    config: InternalConfiguration;
    request: any;
}
export declare function resolveRequest(this: ResolvableBindings, resolve: Resolve, reject: Reject, entity: ResolvableEntity): void;
export {};
