import type { Methods } from "./types";

export const DOTENV_FILENAME = ".env";
export const DOTENV_LINE = new RegExp(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

export const PROTOCOL_REGEXP = new RegExp(/^(https|http)/i);
export const HOSTNAME_REGEXP = new RegExp(
    /^(?:https?:\/\/)?(?:[^@\/\n]+@)?([^:\/\n]+)/i
);
export const PORT_REGEXP = new RegExp(/:(\d{2,5})$/);

export const URL_REGEXP = new RegExp(
    /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
);

export const URI_TEMPLATE_REGEXP_LEFT = "[{][^{{]*\\b";
export const URI_TEMPLATE_REGEXP_RIGHT = "\\b[^{}]*[}]";

export const METHODS: Methods[] = [
    "PUT",
    "POST",
    "PATCH",
    "OPTIONS",
    "HEAD",
    "GET",
    "DELETE"
];
