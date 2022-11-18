import type { Methods } from "./types";

// support for any protocols to be used with the uri component
// currently only http and https are supported

// regex to get the protocol from the uri component, can match anything
export const PROTOCOL_REGEXP = /^([a-z0-9]+):\/\//i;
export const HOSTNAME_REGEXP = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?([^:\/\n]+)/i;
export const PORT_REGEXP = /:(\d{2,5})$/;

export const URL_REGEXP =
    /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

export const URI_TEMPLATE_REGEXP_LEFT = "[{][^{{]*\\b";
export const URI_TEMPLATE_REGEXP_RIGHT = "\\b[^{}]*[}]";

export const METHODS: Methods[] = ["PUT", "POST", "PATCH", "OPTIONS", "HEAD", "GET", "DELETE"];
