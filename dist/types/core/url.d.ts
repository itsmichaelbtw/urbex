import type { UrbexURL, URIComponent } from "../exportable-types";
import type { SearchParams } from "../types";
export type ParamSerializerType = "string" | "object" | "URLSearchParams";
/**
 * Test if a url string has a valid protocol.
 *
 * Most likely going to deprecate this function.
 */
export declare function isProtocolURL(url: string): boolean;
/**
 * Test if a url string has a valid hostname.
 *
 * Most likely going to deprecate this function.
 */
export declare function isHostnameURL(url: string): boolean;
/**
 * Test if a url is valid
 */
export declare function isValidURL(url: string): boolean;
export declare function convertStringToURIComponent(input: string, urlMount?: string): URIComponent;
export declare function convertURIComponentToString(input: Partial<URIComponent>): string;
export declare function parseURIIntoComponent(component: UrbexURL, allowEndpoints?: boolean): Partial<URIComponent>;
export declare function serializeParams(params: SearchParams, serializerType?: ParamSerializerType): Record<string, string> | string;
