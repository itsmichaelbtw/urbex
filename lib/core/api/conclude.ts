import type { InternalConfiguration, UrbexResponse } from "../../exportable-types";
import type { DispatchedResponse, RequestAPIResponse } from "../../types";

import { deepMerge, clone, isEmpty } from "../../utils";
import { DEFAULT_URBEX_RESPONSE } from "../constants";

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

    // all of the request pipelines are executed here

    return async function concludeRequest(result): Promise<DispatchedResponse> {
        const incomingResult = result;

        // all of the response pipelines are executed here

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
            response.status = incomingResult.response.statusCode;
            response.statusText = incomingResult.response.statusMessage;
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
