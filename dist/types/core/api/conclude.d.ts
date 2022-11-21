import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, RequestAPIResponse } from "../../types";
type ConcludeRequest = (config: RequestAPIResponse) => Promise<DispatchedResponse>;
export declare function startRequest(config: InternalConfiguration): Promise<ConcludeRequest>;
export {};
