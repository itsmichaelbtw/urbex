import type { InternalConfiguration } from "../../exportable-types";
import type { UrbexRequestApi, DispatchedAPIRequest } from "../../types";
export declare class BrowserRequest implements UrbexRequestApi {
    send(config: InternalConfiguration): DispatchedAPIRequest;
}
export declare const DECODERS: unknown;
