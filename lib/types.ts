type MethodsUpper =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "HEAD"
    | "OPTIONS";
type MethodsLower =
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch"
    | "head"
    | "options";

export type Methods = MethodsUpper | MethodsLower;
export type RequestUrlPath = string;
