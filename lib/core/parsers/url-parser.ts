import type { CustomSearchParams, SerializeComponent, EnforceComponent, Port } from "../../types";
import { combineStrings, ensureLeadingToken } from "../../utils";

import {
    BaseURLParser,
    mergeAuth,
    extractScheme,
    buildProtocol,
    convertSearchParamsToString
} from "./base-url-parser";
import { merge } from "../../utils";

// build this as a seperate package

/**
 * The internal URL parser that is responsible for parsing and serializing
 * URLs and their components.
 */
export class URLParser extends BaseURLParser {
    constructor(input?: string | SerializeComponent) {
        super(input);
    }

    /**
     * Parse the input and return a new instance of the `URLParser` class.
     */
    static parse(input: string): URLParser {
        return new this(input);
    }

    /**
     * Serialize the input and return a new instance of the `URLParser` class.
     */
    static serialize(component: SerializeComponent): string {
        return new this().serialize(component);
    }

    /**
     * Set a component object without enforcing the component to serialize
     * or parse. Merges the component with the existing component.
     */
    public set(component: SerializeComponent): this {
        this.$component = merge(this.$component, component);

        if (component.searchParams) {
            this.setSearchParams(component.searchParams);
        }

        return this;
    }

    public get href(): string {
        return this.$component.href;
    }

    public set href(value: string) {
        this.parse(value);
    }

    public get origin(): string {
        return this.$component.origin;
    }

    public set origin(value: string) {
        const [href, protocol, origin, auth, hostname, port] = this.match(value);

        this.parseAuth(auth);

        const component = merge<EnforceComponent, SerializeComponent>(this.$component, {
            href: "",
            origin: combineStrings("", buildProtocol(protocol, !!hostname), origin)
        });

        this.serialize(component);
    }

    public get protocol(): string {
        return this.$component.protocol;
    }

    public set protocol(value: string) {
        if (value === this.protocol) {
            return;
        }

        const existing = buildProtocol(this.protocol, !!this.hostname);
        const incoming = buildProtocol(extractScheme(value), !value.includes("data"));

        this.parseProtocol(value);

        this.sync(existing, incoming);
    }

    public get username(): string {
        return this.$component.username;
    }

    public set username(value: string) {
        const existing = this.username;

        if (value === this.username) {
            return;
        }

        const auth = mergeAuth(value, this.password);

        this.parseAuth(auth);

        if (existing) {
            this.sync(existing, value);
        } else if (this.origin) {
            this.syncAuth(this.origin, this.username, this.password);
        }
    }

    public get password(): string {
        return this.$component.password;
    }

    public set password(value: string) {
        const existing = this.password;

        if (value === existing) {
            return;
        }

        const auth = mergeAuth(this.username, value);

        this.parseAuth(auth);

        if (existing) {
            this.sync(existing, value);
        } else if (this.origin) {
            this.syncAuth(this.origin, this.username, this.password);
        }
    }

    public get hostname(): string {
        return this.$component.hostname;
    }

    public set hostname(value: string) {
        const existing = this.hostname;

        if (value === existing) {
            return;
        }

        this.parseHostname(value);
        this.sync(existing, this.hostname);
    }

    public get port(): Port {
        return this.$component.port;
    }

    public set port(value: Port) {
        const existing = this.port.toString();

        if (value.toString() === existing) {
            return;
        }

        this.parsePort(value);

        if (existing) {
            this.sync(existing, this.port.toString());
        } else if (this.origin) {
            const origin = this.origin;
            const originWithPort = combineStrings(":", origin, this.port.toString());

            this.sync(origin, originWithPort);
        }
    }

    public get pathname(): string {
        return this.$component.pathname;
    }

    public set pathname(value: string) {
        const existing = this.pathname;

        if (value === existing) {
            return;
        }

        this.parsePathname(value);

        if (existing) {
            this.sync(existing, this.pathname);
        } else if (this.origin) {
            const origin = this.origin;
            const pathname = ensureLeadingToken("/", this.pathname);
            const originwithPathname = combineStrings("", origin, pathname);

            this.sync(origin, originwithPathname, "href");
        }
    }

    public get search(): string {
        return convertSearchParamsToString(this.$component.search).search;
    }

    public get searchParams(): URLSearchParams {
        return this.$component.searchParams;
    }

    public get hash(): string {
        return this.$component.hash;
    }

    public set hash(value: string) {
        const existing = this.hash;

        if (value === existing) {
            return;
        }

        this.parseHash(value);

        if (existing) {
            this.sync(existing, this.hash, "href");
        } else if (this.origin) {
            const origin = this.origin;
            const hash = ensureLeadingToken("#", this.hash);
            const originwithHash = combineStrings("", origin, hash);

            this.sync(origin, originwithHash, "href");
        }
    }

    public setSearchParams(value: CustomSearchParams | URLSearchParams, merge: boolean = false) {
        const existing = this.search;

        if (value === existing) {
            return;
        }

        if (value instanceof URLSearchParams) {
            value = value.toString();
        }

        this.parseParams(value);

        if (existing) {
            this.sync(existing, this.search, "href");
        } else if (this.origin) {
            const origin = this.origin;
            const search = ensureLeadingToken("?", this.search);
            const originwithSearch = combineStrings("", origin, search);

            this.sync(origin, originwithSearch, "href");
        }
    }

    public toString(): string {
        return this.$component.href;
    }

    public toJSON(): EnforceComponent {
        return this.$component;
    }
}
