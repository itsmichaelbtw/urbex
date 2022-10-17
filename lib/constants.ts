import type { Methods } from "./types";

export const DOTENV_FILENAME = ".env";
export const DOTENV_LINE = new RegExp(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

export const PROTOCOL_REGEXP = new RegExp(/^(https|http)/i);
export const HOSTNAME_REGEXP = new RegExp(
    /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i
);

export const METHODS: Methods[] = [
    "PUT",
    "POST",
    "PATCH",
    "OPTIONS",
    "HEAD",
    "GET",
    "DELETE"
];
