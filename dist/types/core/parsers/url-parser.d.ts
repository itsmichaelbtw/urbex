import type { CustomSearchParams, SerializeComponent, EnforceComponent, Port } from "../../types";
import { BaseURLParser } from "./base-url-parser";
/**
 * The internal URL parser that is responsible for parsing and serializing
 * URLs and their components.
 */
export declare class URLParser extends BaseURLParser {
    constructor(input?: string | SerializeComponent);
    /**
     * Parse the input and return a new instance of the `URLParser` class.
     */
    static parse(input: string): URLParser;
    /**
     * Serialize the input and return a new instance of the `URLParser` class.
     */
    static serialize(component: SerializeComponent): string;
    /**
     * Set a component object without enforcing the component to serialize
     * or parse. Merges the component with the existing component.
     *
     * This does not validate the component.
     */
    set(component: SerializeComponent): this;
    get href(): string;
    set href(value: string);
    get origin(): string;
    set origin(value: string);
    get protocol(): string;
    set protocol(value: string);
    get username(): string;
    set username(value: string);
    get password(): string;
    set password(value: string);
    get hostname(): string;
    set hostname(value: string);
    get port(): Port;
    set port(value: Port);
    get pathname(): string;
    set pathname(value: string);
    get search(): string;
    get searchParams(): URLSearchParams;
    get hash(): string;
    set hash(value: string);
    setSearchParams(value: CustomSearchParams | URLSearchParams, merge?: boolean): void;
    toString(): string;
    toJSON(): EnforceComponent;
}
