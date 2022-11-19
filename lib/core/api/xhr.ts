import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi, DispatchedAPIRequest } from "../../types";

export class BrowserRequest implements UrbexRequestApi {
    public send(config: InternalConfiguration): DispatchedAPIRequest {
        return new Promise(() => {});
    }
}
