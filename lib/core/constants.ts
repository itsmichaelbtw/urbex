import type { InternalConfiguration, URIComponent } from "../exportable-types";
import type { PipelineExecutorsManager } from "../types";

import { merge } from "../utils";

export const DEFAULT_HEADERS = {
    "Content-Type": "application/json"
};

export const DEFAULT_URI_COMPONENT: URIComponent = {
    endpoint: null,
    hostname: null,
    href: null,
    origin: null,
    params: null,
    port: null,
    protocol: null,
    urlMount: null
};

export const DEFAULT_PIPELINE_EXECUTORS: PipelineExecutorsManager = {
    request: [],
    response: []
};

export const DEFAULT_CLIENT_OPTIONS: InternalConfiguration = {
    url: merge(DEFAULT_URI_COMPONENT, {
        protocol: "http",
        urlMount: "/api"
    }),
    timeout: 0,
    method: "GET",
    headers: null,
    data: null,
    cache: {},
    pipelines: DEFAULT_PIPELINE_EXECUTORS
};
