import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi } from "../../types";

import { createPromise } from "../../utils";

export class BrowserRequest implements UrbexRequestApi {
    public send(config: InternalConfiguration): DispatchedResponse {
        return createPromise(() => {});
    }
}
