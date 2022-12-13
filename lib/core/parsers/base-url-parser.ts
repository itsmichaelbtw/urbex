import type { CustomSearchParams, SerializeComponent, EnforceComponent, Port } from "../../types";

import {
    merge,
    isString,
    isNumber,
    isEmpty,
    isArray,
    isObject,
    createEmptyScheme,
    lowercase,
    combineStrings,
    ensureTrailingToken,
    ensureLeadingToken,
    forEach
} from "../../utils";
import { URL_COMPONENT_KEYS } from "../constants";

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

const DEFAULT_PROTOCOL = "http";

const PARSE_URL =
    /^(?:([^:\/?#]+):)?(?:[\/\/]+((?:([^@\/\n]+)@)?((?:[0-9]{1,3}\.){3}[0-9]{1,3}|\[[0-9a-f:]+\]|[^#:\/?\n]+)(?::(\d*))?))?(?:[\/]*([^?#]*))(?:[\?]*([^#]*))?(?:[\#]*(.*))?/i;

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_REGEX = /^(\[[0-9a-f:]+\])$/i;
const AUTH_REGEX = /^([^:]+)(?:\:([^:].+))?/;
const PORT_LOWER_LIMIT = 0;
const PORT_UPPER_LIMIT = 65535;

function removeEncodedWhitespace(input: string): string {
    return input.replace(/%20/g, "");
}

function normalizeIPv4(input: string): string {
    const matches = IPV4_REGEX.exec(input);

    if (matches) {
        const numbers = matches.slice(1).map((num) => parseInt(num, 10));

        if (numbers.every((num) => num <= 255)) {
            return numbers.join(".");
        }
    }

    throw new Error("Invalid IPv4 address.");
}

function normalizeIPv6(input: string): string {
    const matches = IPV6_REGEX.exec(input);

    if (matches) {
        return matches[1];
    }

    throw new Error("Invalid IPv6 address.");
}

function formatPort(port: Port): string {
    if (!port) {
        return "";
    }

    if (isNumber(port) || !port.startsWith(":")) {
        return `:${port}`;
    } else {
        return port;
    }
}

export function mergeAuth(username: string, password: string): string {
    if (!username && password) {
        throw new Error("Cannot set password without username.");
    }

    if (!username) {
        return "";
    }

    if (!password) {
        return username;
    }

    return combineStrings(":", username, password);
}

export function buildProtocol(protocol: string, hasHostname: boolean): string {
    if (hasHostname || protocol === "http" || protocol === "https") {
        return ensureTrailingToken("://", protocol);
    }

    return ensureTrailingToken(":", protocol);
}

export function extractScheme(input: string): string {
    return input.replace(/:\/\/$/, "").replace(/:$/, "");
}

export function convertSearchParamsToString(search: CustomSearchParams): ParamsConversionOutput {
    if (!search || (!isString(search) && !isObject(search) && !isArray(search))) {
        return {
            search: "",
            searchParams: null
        };
    }

    if (isString(search)) {
        return {
            search: ensureLeadingToken("?", removeEncodedWhitespace(search)),
            searchParams: new URLSearchParams(search)
        };
    }

    const searchParams = new URLSearchParams();

    forEach(search, (key, value) => {
        if (value) {
            if (isArray(value)) {
                const entry = value;
                searchParams.append(entry[0] as string, entry[1] as string);
            } else if (isObject(search)) {
                searchParams.append(key, value);
            }
        }
    });

    return {
        search: ensureLeadingToken("?", searchParams.toString()),
        searchParams: searchParams
    };
}

export class BaseURLParser {
    protected $component: EnforceComponent;

    constructor(input: string | SerializeComponent) {
        if (input && !isString(input) && !isObject(input)) {
            throw new TypeError("Invalid input. Must be a string or an object.");
        }

        this.$component = createEmptyScheme<EnforceComponent>(URL_COMPONENT_KEYS, "");

        if (isString(input) && input) {
            this.$component = this.parse(input);
            return;
        }

        if (isObject(input) && !isEmpty(input)) {
            if (input.href) {
                this.$component = this.parse(input.href);
            } else {
                this.serialize(input);
            }
            return;
        }
    }

    protected sync(
        value: string,
        replace: string,
        syncType: "all" | "href" | "origin" = "all"
    ): void {
        const href = this.$component.href;
        const origin = this.$component.origin;

        if (value) {
            if (syncType === "all" || syncType === "href") {
                this.$component.href = href.replace(value, replace);
            }

            if (syncType === "all" || syncType === "origin") {
                this.$component.origin = origin.replace(value, replace);
            }
        }
    }

    protected syncAuth(origin: string, username: string, password: string): void {
        if (!username) {
            throw new Error("Cannot set password without username.");
        }

        let [protocol, host] = origin.split("://");

        protocol = buildProtocol(protocol, !!host);

        const authString = combineStrings("", mergeAuth(username, password), "@");

        this.$component.href = combineStrings("", protocol, authString, host);
    }

    protected match(input: string): string[] {
        return PARSE_URL.exec(input);
    }

    protected parseProtocol(input: string): string {
        if (!input) {
            const protocol = this.$component.protocol;
            this.$component.protocol = protocol || DEFAULT_PROTOCOL;
            return;
        }

        input = extractScheme(input);

        const protocol = lowercase(removeEncodedWhitespace(input));
        this.$component.protocol = protocol;
    }

    protected parseAuth(input: string): void {
        if (!input) {
            return;
        }

        const auth = AUTH_REGEX.exec(input);

        if (auth && auth.length) {
            const username = auth[1];
            const password = auth[2];

            if (!username) {
                throw new Error("Expected username in auth.");
            }

            this.$component.username = username;
            this.$component.password = password || "";
        } else {
            throw new Error("Invalid auth format. Expected <username>:<password>");
        }
    }

    protected parseHostname(input: string): void {
        if (!input) {
            return;
        }

        const isIPv4 = IPV4_REGEX.test(input);

        if (isIPv4) {
            input = normalizeIPv4(input);
        } else {
            const isIPv6 = IPV6_REGEX.test(input);
            if (isIPv6) {
                input = normalizeIPv6(input);
            } else {
                input = lowercase(input);
            }
        }

        this.$component.hostname = removeEncodedWhitespace(input);
    }

    protected parsePort(port: Port): void {
        if (!port) {
            this.$component.port = "";
            return;
        }

        const parsePort = isNumber(port) ? port : parseInt(port, 10);

        if (isNaN(parsePort) || parsePort < PORT_LOWER_LIMIT || parsePort > PORT_UPPER_LIMIT) {
            throw new Error("Port must be between 0 and 65535.");
        }

        this.$component.port = parsePort;
    }

    protected parseOrigin(origin: string): void {
        const protocol = buildProtocol(this.$component.protocol, !!this.$component.hostname);

        if (!origin || !this.$component.hostname) {
            this.$component.origin = "null";
        } else {
            this.$component.origin = ensureLeadingToken(protocol, origin);
        }

        const authString = mergeAuth(this.$component.username, this.$component.password);

        if (authString && this.$component.origin.includes(authString)) {
            const replaceAuth = combineStrings("", authString, "@");
            this.$component.origin = this.$component.origin.replace(replaceAuth, "");
        }
    }

    protected parsePathname(pathname: string): void {
        if (!pathname) {
            return;
        }

        if (this.$component.hostname) {
            this.$component.pathname = ensureLeadingToken("/", pathname);
        } else {
            this.$component.pathname = pathname;
        }
    }

    protected parseParams(params: CustomSearchParams): void {
        if (!params) {
            return;
        }

        const search = convertSearchParamsToString(params);

        if (search) {
            this.$component.search = ensureLeadingToken("?", search.search);
            this.$component.searchParams = new URLSearchParams(search.searchParams);
        }
    }

    protected parseHash(hash: string): void {
        if (!hash) {
            return;
        }

        this.$component.hash = ensureLeadingToken("#", hash);
    }

    /**
     * Parses a URL string and returns a URL object.
     */
    public parse(input: string, overwrite: boolean = true): EnforceComponent {
        if (!isString(input) || isEmpty(input)) {
            throw new Error("Invalid URL.");
        }

        const component = createEmptyScheme<EnforceComponent>(URL_COMPONENT_KEYS, "");

        if (overwrite) {
            this.$component = component;
        } else {
            this.$component = merge(component, this.$component);
        }

        input = input.trim();
        input = input.replace(/\s/g, "%20");
        input = input.replace(/\\/g, "/");

        const matches = this.match(input);

        if (matches === null || matches.length === 0) {
            throw new Error("Invalid URL.");
        }

        const [href, protocol, origin, auth, hostname, port, pathname, query, hash] = matches;

        this.parseProtocol(protocol);
        this.parseAuth(auth);
        this.parseHostname(hostname);
        this.parsePort(port);
        this.parsePathname(pathname);
        this.parseParams(query);
        this.parseHash(hash);
        this.parseOrigin(origin);

        this.$component.href = href;

        return this.$component;
    }

    /**
     * Serializes a URL object into a URL string.
     */
    public serialize(_component: SerializeComponent, overwrite: boolean = true): string {
        const baseComponent = createEmptyScheme<EnforceComponent>(URL_COMPONENT_KEYS, "");
        const component = merge(baseComponent, _component);

        const tokens: string[] = [];

        const authString = mergeAuth(component.username, component.password);

        if (component.origin) {
            const [_, protocol, origin, auth, host, port] = this.match(component.origin);

            tokens.push(buildProtocol(protocol, !!host));

            if (authString && !component.origin.includes(authString)) {
                // this is a safe check to ensure the user didn't provide a username/password
                // in the origin string. If they did, we'll remove it and use the one provided
                // in the username/password properties.

                const newOrigin = origin.replace(`${auth}@`, "");

                tokens.push(authString);
                tokens.push("@");
                tokens.push(newOrigin);
            } else {
                if (auth) {
                    tokens.push(auth);
                    tokens.push("@");
                }

                tokens.push(host);

                if (port) {
                    tokens.push(formatPort(port));
                }
            }
        } else {
            if (!component.protocol) {
                throw new Error("Expected a protocol when serializing a URL.");
            }

            if (component.protocol === "http" || component.protocol === "https") {
                if (!component.hostname) {
                    throw new Error(
                        "Expected a hostname when serializing a URL with an HTTP protocol."
                    );
                }
            }

            tokens.push(buildProtocol(component.protocol, !!component.hostname));

            if (authString) {
                tokens.push(authString);
                tokens.push("@");
            }

            if (component.hostname) {
                tokens.push(component.hostname);
            }

            tokens.push(formatPort(component.port));
        }

        tokens.push(ensureLeadingToken("/", component.pathname));

        const searchParams = component.search || component.searchParams || "";

        if (searchParams) {
            if (searchParams instanceof URLSearchParams) {
                tokens.push(ensureLeadingToken("?", searchParams.toString()));
            } else {
                const { search } = convertSearchParamsToString(searchParams.toString());
                tokens.push(ensureLeadingToken("?", search));
            }
        }

        if (component.hash) {
            tokens.push(ensureLeadingToken("#", component.hash));
        }

        const url = tokens.filter((token) => token && token !== "/").join("");

        try {
            const parsed = this.parse(url, overwrite);
            return parsed.href;
        } catch (error) {
            throw new Error("Attempted to serialize an invalid URL.");
        }
    }
}
