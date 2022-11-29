import type { URIComponent } from "../../exportable-types";
import { SearchParams } from "../../types";
export declare class URIParser implements URIComponent {
    href: string;
    origin: string;
    protocol: string;
    hostname: string;
    urlMount: string;
    endpoint: string;
    port: string | number;
    params: SearchParams;
    private url;
}
