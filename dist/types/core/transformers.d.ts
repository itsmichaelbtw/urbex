import type { RequestExecutor, ResponseExecutor } from "../exportable-types";
import { PipelineExecutor } from "./pipelines";
export declare const transformRequestData: PipelineExecutor<RequestExecutor>;
export declare const decodeResponseData: PipelineExecutor<ResponseExecutor>;
export declare const transformResponseData: PipelineExecutor<ResponseExecutor>;
