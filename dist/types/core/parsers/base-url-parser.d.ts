import type { CustomSearchParams, SerializeComponent, EnforceComponent, Port } from "../../types";
interface ParamsConversionOutput {
    /**
     * Stringified output of the search parameters.
     */
    search: string;
    /**
     * As a URLSearchParams object.
     */
    searchParams: URLSearchParams;
}
export declare function mergeAuth(username: string, password: string): string;
export declare function buildProtocol(protocol: string, hasHostname: boolean): string;
export declare function extractScheme(input: string): string;
export declare function convertSearchParamsToString(search: CustomSearchParams): ParamsConversionOutput;
export declare class BaseURLParser {
    protected $component: EnforceComponent;
    constructor(input: string | SerializeComponent);
    protected sync(value: string, replace: string, syncType?: "all" | "href" | "origin"): void;
    protected syncAuth(origin: string, username: string, password: string): void;
    protected match(input: string): string[];
    protected parseProtocol(input: string): string;
    protected parseAuth(input: string): void;
    protected parseHostname(input: string): void;
    protected parsePort(port: Port): void;
    protected parseOrigin(origin: string): void;
    protected parsePathname(pathname: string): void;
    protected parseParams(params: CustomSearchParams): void;
    protected parseHash(hash: string): void;
    /**
     * Parses a URL string and returns a URL object.
     */
    parse(input: string, overwrite?: boolean): EnforceComponent;
    /**
     * Serializes a URL object into a URL string.
     */
    serialize(_component: SerializeComponent, overwrite?: boolean): string;
}
export {};
