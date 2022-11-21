import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi, DispatchedAPIRequest } from "../../types";

import { createEmptyScheme } from "../../utils";

export class BrowserRequest implements UrbexRequestApi {
    public send(config: InternalConfiguration): DispatchedAPIRequest {
        return new Promise(() => {});
    }
}

export const DECODERS = createEmptyScheme(["br", "gzip", "deflate", "compress"]);
