/// <reference types="node" />
import zlib from "zlib";
import type { InternalConfiguration } from "../../exportable-types";
import type { UrbexRequestApi, DispatchedAPIRequest } from "../../types";
export declare class NodeRequest implements UrbexRequestApi {
    private getAgentFromProtocol;
    private handleDataProtocolRequest;
    send(config: InternalConfiguration): DispatchedAPIRequest;
}
export declare const DECODERS: {
    br: typeof zlib.brotliDecompress.__promisify__;
    gzip: typeof zlib.gunzip.__promisify__;
    deflate: typeof zlib.inflate.__promisify__;
    compress: (arg1: zlib.ZlibOptions) => Promise<unknown>;
};
