import type {
    URIOptions,
    URIComponent,
    URLProtocol,
    ConfigurableClientUrl,
    SearchParams
} from "./types";

import {
    URL_REGEXP,
    HOSTNAME_REGEXP,
    PROTOCOL_REGEXP,
    URI_TEMPLATE_REGEXP_LEFT,
    URI_TEMPLATE_REGEXP_RIGHT
} from "../constants";
import {
    isObject,
    isString,
    extractMatchFromRegExp,
    ensureLeadingSlash,
    stringReplacer,
    argumentIsNotProvided,
    combineStrings,
    forEach,
    merge,
    isFunction,
    isEmpty
} from "../utils";
import { DEFAULT_URI_COMPONENT } from "./constants";

export type ParamSerializerType = "string" | "object" | "URLSearchParams";

export type URIParserModifier = (uri: URIComponent) => URIComponent;

/**
 * Test if a url string has a valid protocol.
 *
 * Most likely going to deprecate this function.
 */
export function isProtocolURL(url: string): boolean {
    return PROTOCOL_REGEXP.test(url);
}

/**
 * Test if a url string has a valid hostname.
 *
 * Most likely going to deprecate this function.
 */
export function isHostnameURL(url: string): boolean {
    return HOSTNAME_REGEXP.test(url);
}

/**
 * Test if a url is valid
 */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);

        return true;
    } catch (error) {
        return false;
    }
}

export function convertStringToURIComponent(input: string, urlMount: string = ""): URIComponent {
    const url = new URL(input);

    const protocol = stringReplacer(url.protocol, ":", "") as URLProtocol;
    const port = url.port ? parseInt(url.port) : "";
    const pathname = stringReplacer(url.pathname, urlMount, "");

    return {
        href: url.href,
        origin: url.origin,
        protocol: protocol,
        hostname: url.hostname,
        port: port,
        endpoint: pathname,
        params: url.search,
        urlMount: urlMount
    };
}

// turn this into its own package
export function convertURIComponentToString(input: Partial<URIComponent>): string {
    let template = "{protocol+://}{hostname}{:+port}{urlMount}{endpoint}{?+params}";

    function createRegexString(word: string): RegExp {
        return new RegExp(`${URI_TEMPLATE_REGEXP_LEFT}${word}${URI_TEMPLATE_REGEXP_RIGHT}`, "gi");
    }

    if (argumentIsNotProvided(input) || isEmpty(input) || !isObject(input)) {
        return "";
    }

    if (input.params) {
        input.params = serializeParams(input.params);
    }

    forEach(input, (key, value) => {
        const regex = createRegexString(key);

        if (argumentIsNotProvided(value) || isEmpty(value)) {
            template = stringReplacer(template, regex, "");
        } else {
            const match = extractMatchFromRegExp(template, regex, 0, "");
            const templateValue = stringReplacer(match, key, value.toString())
                .replace(/\+/g, "")
                .replace(/^\{/, "")
                .replace(/\}$/, "");

            template = stringReplacer(template, match, templateValue);
        }
    });

    return template;
}

export function parseURIIntoComponent(
    component: ConfigurableClientUrl,
    allowEndpoints: boolean = true
): Partial<URIComponent> {
    if (isString(component)) {
        if (isValidURL(component)) {
            return convertStringToURIComponent(component);
        } else if (allowEndpoints) {
            return {
                endpoint: ensureLeadingSlash(component)
            };
        } else {
            throw new Error(
                "An invalid URL was provided. A valid URL string in the format of <scheme>://<hostname> must be passed when using `urbex.configure()`."
            );
        }
    } else if (isObject(component)) {
        const protocol = extractMatchFromRegExp(component.protocol, PROTOCOL_REGEXP, 0, "http");
        const hostname = stringReplacer(
            component.hostname,
            new RegExp(`^${protocol}://`, "gi"),
            ""
        );

        const buildableComponent = {
            protocol: protocol,
            hostname: hostname,
            port: component.port,
            urlMount: component.urlMount,
            endpoint: component.endpoint,
            params: component.params
        };

        const componentAsString = convertURIComponentToString(buildableComponent);
        const newComponent = convertStringToURIComponent(componentAsString, component.urlMount);

        return newComponent;
    } else {
        throw new Error("Unable to parse the provided URI. Must be either a string or an object.");
    }
}

export function serializeParams(
    params: SearchParams,
    serializerType: ParamSerializerType = "string"
): Record<string, string> | string {
    if (argumentIsNotProvided(params)) {
        return null;
    }

    try {
        const searchParams = new URLSearchParams(params);

        if (serializerType === "object") {
            const params = {};

            searchParams.forEach((value, key) => {
                params[key] = value;
            });

            return params;
        }

        return searchParams.toString();
    } catch (error) {
        return null;
    }
}
