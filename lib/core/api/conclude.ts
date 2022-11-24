import type { InternalConfiguration, UrbexResponse } from "../../exportable-types";
import type { DispatchedResponse, RequestAPIResponse } from "../../types";

import { deepMerge, clone, isEmpty } from "../../utils";
import { DEFAULT_URBEX_RESPONSE } from "../constants";
import { environment } from "../../environment";
import { UrbexHeaders } from "../../core/headers";

type ConcludeRequest = (config: RequestAPIResponse) => Promise<DispatchedResponse>;

export async function startRequest(config: InternalConfiguration): Promise<ConcludeRequest> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const clonedResponse = clone(DEFAULT_URBEX_RESPONSE);

    if (!isEmpty(config.pipelines.request)) {
        // loop over the request pipelines
        // each pipeline is a Promise that returns a new config
        // each new config is passed to the next pipeline
        // the very last config will mutate the `config` parameter

        for (const pipeline of config.pipelines.request) {
            config = await pipeline.execute(config);

            if (config === null) {
                throw new Error(
                    "Urbex expected a valid configuration to be returned from a request pipeline, but got null."
                );
            }
        }
    }

    return async function concludeRequest(result): Promise<DispatchedResponse> {
        const incomingResult = result;

        let response = deepMerge(clonedResponse, {
            data: incomingResult.data,
            config: config,
            request: incomingResult.request,
            response: incomingResult.response,
            timestamp: timestamp,
            responseType: config.responseType
        });

        if (incomingResult.response) {
            response.headers = incomingResult.response.headers;

            if (environment.isNode) {
                response.status = incomingResult.response.statusCode;
                response.statusText = incomingResult.response.statusMessage;
            } else {
                const parsedHeaders = UrbexHeaders.parse(response.headers);

                response.headers = parsedHeaders;

                response.status = incomingResult.response.status;
                response.statusText = incomingResult.response.statusText;
            }
        }

        if (!isEmpty(config.pipelines.response)) {
            for (const pipeline of config.pipelines.response) {
                response = await pipeline.execute(response);
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        response.duration = duration;
        return Promise.resolve(response);
    };
}
