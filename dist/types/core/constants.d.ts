import type { InternalConfiguration, URIComponent, UrbexResponse } from "../exportable-types";
import type { PipelineExecutorsManager } from "../types";
export declare const DEFAULT_BROWSER_HEADERS: {
    "Content-Type": string;
};
export declare const DEFAULT_NODE_HEADERS: {
    "Content-Type": string;
} & {
    "User-Agent": string;
};
export declare const DEFAULT_URI_COMPONENT: URIComponent;
export declare const DEFAULT_PIPELINE_EXECUTORS: PipelineExecutorsManager;
export declare const DEFAULT_CLIENT_OPTIONS: InternalConfiguration;
export declare const DEFAULT_URBEX_RESPONSE: UrbexResponse<any>;
