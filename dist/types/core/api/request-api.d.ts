import { CacheClock } from "cache-clock";
import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi } from "../../types";
export declare class RequestApi {
    /**
     * The internal api that is used to send requests.
     */
    protected $api: UrbexRequestApi;
    /**
     * An isolated cache module that is used to cache requests.
     */
    protected $cache: CacheClock;
    constructor();
    private register;
    protected dispatchRequest(config: InternalConfiguration): DispatchedResponse;
}
