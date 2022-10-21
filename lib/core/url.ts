import type {
    URIOptions,
    URIComponent,
    URLProtocol,
    UrbexURL,
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

type URLStringBuilder = Pick<
    URIOptions,
    "protocol" | "hostname" | "port" | "urlMount" | "endpoint" | "params"
>;

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

export function convertStringToURIComponent(
    input: string,
    urlMount?: string
): URIComponent {
    const url = new URL(input);

    const protocol = stringReplacer(url.protocol, ":", "") as URLProtocol;
    const port = url.port ? parseInt(url.port) : null;
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
export function convertURIComponentToString(input: URLStringBuilder): string {
    let template =
        "{protocol+://}{hostname}{:+port}{urlMount}{endpoint}{?+params}";

    function createRegexString(word: string): RegExp {
        return new RegExp(
            `${URI_TEMPLATE_REGEXP_LEFT}${word}${URI_TEMPLATE_REGEXP_RIGHT}`,
            "gi"
        );
    }

    if (argumentIsNotProvided(input) || isEmpty(input) || !isObject(input)) {
        return "";
    }

    forEach(input, (key, value) => {
        const regex = createRegexString(key);

        if (argumentIsNotProvided(value)) {
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

export function uriParser(
    uri: UrbexURL,
    params: SearchParams = null,
    allowEndpoints: boolean = true
): URIComponent {
    const serializedParams = serializeParams(params);

    if (isString(uri)) {
        if (isValidURL(uri)) {
            return convertStringToURIComponent(
                combineStrings("?", uri, serializedParams)
            );
        } else if (allowEndpoints) {
            // fix: will need to change the url.href to update the endpoint provided
            // as it is out of sync
            // a temporary fix currently is in core/urbex.ts function send()
            // at a later date remodel the uri parser to fix this issue
            // https://github.com/orison-networks/urbex/issues/4
            return {
                endpoint: ensureLeadingSlash(uri),
                params: serializedParams
            };
        } else {
            throw new Error(
                "An invalid URL was provided. A valid URL string must be passed when using `urbex.configure()`."
            );
        }
    } else if (isObject(uri)) {
        // prettier-ignore
        const protocol = extractMatchFromRegExp(uri.protocol, PROTOCOL_REGEXP, 0, "http") as URLProtocol;
        // prettier-ignore
        const hostname = stringReplacer(uri.hostname, new RegExp(`^${protocol}://`, "gi"), "");

        const componentToBuild: URLStringBuilder = {
            protocol: protocol,
            hostname: hostname,
            port: uri.port,
            urlMount: uri.urlMount,
            endpoint: uri.endpoint,
            params: serializedParams
        };

        const uriToString = convertURIComponentToString(componentToBuild);
        return convertStringToURIComponent(uriToString, uri.urlMount);
    }

    throw new Error(
        "Unable to parse the provided URI. Must be either a string or an object."
    );
}

export function serializeParams(params: SearchParams): string {
    if (argumentIsNotProvided(params)) {
        return null;
    }

    if (params instanceof URLSearchParams) {
        return params.toString();
    }

    try {
        return new URLSearchParams(params).toString();
    } catch (error) {
        return null;
    }
}
