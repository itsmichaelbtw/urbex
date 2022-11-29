# urbex

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/orison-networks/urbex/Unit%20Tests?label=unit%20tests&style=flat-square)
![Github version](https://img.shields.io/github/package-json/v/orison-networks/urbex?style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Typescript](https://img.shields.io/github/languages/top/orison-networks/urbex?style=flat-square)
![GitHub](https://img.shields.io/github/license/orison-networks/urbex?style=flat-square)

> An efficient and lightweight functional HTTP client for Node.js and the browser with built in cache support, customizable pipelines, isolated clients, and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [API Design](#api-design)
- [Configuring the client](#configuring-the-client)
  - [Environment Defaults](#environment-defaults)
- [Isolated Clients](#isolated-clients)
- [Pipeline Transformers](#pipeline-transformers)
  - [Injecting Pipelines](#injecting-pipelines)
  - [Ejecting Pipelines](#ejecting-pipelines)
- [Internal Cache Module](#internal-cache-module) 
- [Error Handling](#error-handling)
  - [Resolve Status Codes](#resolve-status-codes)
- [Caveats](#caveats)
- [TypeScript](#typescript)
- [Change Log](#change-log)
- [License](#license)

## Features

- Built for Node.js (http module) and the browser (xhr)
- Global configurations
- Isolated clients
- Built in client-side cache support
- Customizable pipelines for request and response transformations
- Custom status validation
- Ease of use API design
- Extended configuration when defining urls
- Subscribable requests for realtime updates (coming soon)
## Installation

### npm
```bash
$ npm install urbex
```
### yarn
```bash
$ yarn add urbex
```
### unpkg
```html
<script src="https://unpkg.com/urbex"></script>
```

### jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/urbex"></script>
```
## Usage

### ES6

```typescript
import urbex from "urbex";
```

### CommonJS

```typescript
const urbex = require("urbex").default;

urbex.configure({});
```

### Browser

For browser builds that are required to be loaded via a script tag, the `urbex` global is exposed and is also available on the `window` object.

```html
<script src="https://unpkg.com/urbex"></script>

<script>
  urbex.configure({});

  // or

  window.urbex.configure({});
</script>
```

The API is the same as module builds, with the exception of named exports. These are instead attached to the `urbex` object.
## Examples
### Basic
```typescript
import urbex from "urbex";

// configure the client to your liking
urbex.configure({})

// make a request
try {
  const response = await urbex.get("https://jsonplaceholder.typicode.com/todos/1");
} catch (error) {
  console.log(error)
}
```

All method aliases are supported for common HTTP verbs:
  - GET
  - POST
  - PUT
  - PATCH
  - DELETE
  - HEAD
  - OPTIONS

If you find yourself needing to use another method that doesn't have an alias, you can use the `send` method instead.

```typescript
const response = await urbex.send({
  method: "PROPFIND",
  url: "https://jsonplaceholder.typicode.com/todos/1"
});
```

### Global Configuration

The API provides a global configuration that can be used to set the default options for all requests that are made. You are also granted the ability to **override** these options on a per-request basis.

```typescript
urbex.configure({
  url: "https://jsonplaceholder.typicode.com",
  headers: {
    "My-Custom-Header": "foo"
  }
})
```

```typescript
const response = await urbex.get("/todos/1", {
  headers: {
    "My-Custom-Header": "bar"
  }
});
```

At any time you can check the current configuration with `urbex.config`. This will return the current global configuration.

See [Configuring the client](#configuring-the-client) for more information.
## API Design

The API is designed to be as simple as possible. The goal is to provide a simple and easy to use API that is also flexible enough to be used in a variety of different scenarios.

#### `urbex.send([, config])` 

Is the base method that all other methods are built on top of. This method accepts a configuration object that is used to make the request. The configuration object is then passed through a pipeline of transformers that are used to transform the request, make the request, and transform the response. By default, if no configuration is passed, the global configuration is used. Likewise, if a configuration is passed, it is merged with the global configuration.

**Note**: On each request, the global configuration is cloned and merged with the request configuration. This ensures that the global configuration is not mutated.

### Verb Aliases

- `urbex.get(url[, config])`
- `urbex.post(url[, data[, config]])`
- `urbex.put(url[, data[, config]])`
- `urbex.patch(url[, data[, config]])`
- `urbex.delete(url[, config])`
- `urbex.head(url[, config])`
- `urbex.options(url[, config])`

It is recommended if you find yourself only requesting data from the same URL with the same method, to use `urbex.send` instead. 

## Configuring the client

The client can be configured globally or on a per-request basis. The global configuration is the default configuration that is used for all requests. The per-request configuration is used to override the global configuration for a specific request. You are freely able to use both the global and per-request configuration at the same time, along with calling `.configure()` multiple times. All configurations are merged together in the order they are called.

The core detects what environment it is running in and will automatically set the default configuration for that environment.

| Property         | Type                     | Default              | Environment | Description                                                                            |
|------------------|--------------------------|----------------------|:-----------:|----------------------------------------------------------------------------------------|
| url              | UrbexURL                 | Based on environment | *           | The url to use for the request. Can be either a string or an object.                   |
| headers          | Object                   | Based on environment | *           | Custom headers to be sent with the request.                                            |
| method           | Methods                  | "GET"                | *           | The method of the request.                                                             |
| data             | any                      | null                 | *           | Data to use when a request accepts a request body.                                     |
| timeout          | number                   | 0                    | *           | Set the default timeout to use for all requests.                                       |
| cache            | ClockOptions             | {}                   | *           | Control the internal ttl cache module.                                                 |
| pipelines        | PipelineExecutorsManager | Based on environment | *           | Custom pipeline transformers to use when making requests.                              |
| maxContentLength | number                   | Infinity             | NodeJS      | The max content length of a response.                                                  |
| responseType     | ResponseTypes            | "JSON"               | *           | The response type of the request.                                                      |
| responseEncoding | BufferEncoding           | "utf8"               | NodeJS      | The encoding to use when converting from a buffer to a string.                         |
| resolveStatus    | ResolveStatus            | >= 200 and < 300     | *           | A function that determines whether the request should be considered successful or not. |

For clarification on `Type`, check out the [TypeScript Definitions](#typescript).

### Environment Defaults

Defaults are applied to the request configuration depending on what environment the client is running in. It is detected as either **browser** or **node**.

#### Browser

```typescript
{
  url: {
    href: window.location.href,
    origin: window.location.origin,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    urlMount: "/api",
    endpoint: "",
    port: window.location.port,
    params: ""
  },
  headers: {
    "Content-Type": "application/json"
  },
  pipelines: {
    request: [transformRequestData],
    response: [transformResponseData]
  }
}
```

#### Node

```typescript
{
  url: {
    href: "http://localhost:3000/api",
    origin: "http://localhost:3000",
    protocol: "http",
    hostname: "localhost",
    urlMount: "/api",
    endpoint: "",
    port: 3000,
    params: ""
  },
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "UrbexClient (Node.js v16.13.1; win32)"
  },
  pipelines: {
    request: [transformRequestData],
    response: [decodeResponseData, transformResponseData]
  }
}
```

See [transformers](lib/core/transformers.ts) for more information on the default pipelines.

## Isolated Clients

The client can be used in a variety of different ways. The most common way is to use the default client that is exported from the package. However, you are also able to create isolated clients that are completely independent of each other. This is useful if you want to have multiple clients that are configured differently.

```typescript
import urbex from "urbex";

const client = urbex.isolateClient(config);

// or

const client = new urbex.Client(config);

// or

const client = urbex.isolateClient();

client.configure(config)
```

You are still given full functionality of the client and all vital methods are available, except the following:

- `isolateClient()`
- `isUrbexClient()`
- `Client`
- `environment`

If you wish to still use these methods, they are accessible through the `urbex` object.

**Note**: For every isolated client that is instantiated, a new instance of the `CacheClock` class is created. This is to ensure that each client has its own internal cache. If you enable the cache, remember to stop/disable the clock when you are done with the client.

## Pipeline Transformers

Pipeline transformers allow you to take control over how the configuration is managed throughout the life-cycle of a request. Both request and response pipelines are supported. The request pipeline is used to transform the request configuration before the request is made. The response pipeline is used to transform the response data before it is returned to the user.

There are mandatory pipelines that are evaluated at runtime. These are vital to the core functionality of the client, such as setting appropriate headers, decoding response data, and automatic JSON parsing. See [transformers](lib/core/transformers.ts) for more information on the default pipelines.

You can create your own pipelines to use with the client. These can either be registered with the global configuration, or on a per-request basis. The pipelines are executed in the order they are registered. Each pipeline is asynchronous and must return a promise. The promise must resolve with the configuration object that was passed. Additionally, you are free to throw errors within the pipeline. These are handled automatically and will be rejected with the error.

Each pipeline is passed the configuration object after it has been transformed by the previous pipeline.

```typescript
import urbex, { PipelineExecutor, RequestExecutor, ResponseExecutor } from "urbex";

const requestPipeline = new PipelineExecutor<RequestExecutor>((config) => {
  // Do something with the request configuration
  return Promise.resolve(config)
})

const responsePipeline = new PipelineExecutor<ResponseExecutor>((config) => {
  // Do something with the response configuration
  return Promise.resolve(config)
})

// both pipelines are executed AFTER the default pipelines

urbex.configure({
  pipelines: {
    request: [requestPipeline],
    response: [responsePipeline]
  }
})

// or

urbex.get("/users", {
  pipelines: {
    request: [requestPipeline],
    response: [responsePipeline]
  }
})
```

### Injecting Pipelines

**Coming Soon**

An alternative method is to use `injectPipeline(pipeline[, index])` to inject a pipeline into the existing pipeline chain. This is useful to control which position your pipeline is executed in. The index is optional and defaults to the end of the pipeline chain. 

This gives you control to inject pipelines that are executed before the default pipelines, but we do not recommend this as it may cause unexpected behaviour.

### Ejecting Pipelines

**Coming Soon**

You can also eject a pipeline from the pipeline chain using `ejectPipeline(pipeline)`. This will remove the pipeline from the chain and return the pipeline that was removed.

## Internal Cache Module

All requests, if configured, are cached internally. This is done to reduce the number of requests that are made to the server. The cache is based on the request configuration and the response data. The cache is cleared when the client is stopped. Before a request is made, the cache is checked to see if the request has been made before. If it has, the cached response is returned. If it has not, the request is made and the response is cached. The href of the request is used as the key for the cache.

All pipelines are executed even if the request is cached. You may control this behaviour by using the `cache` option in the request configuration.

```typescript
urbex.configure({
  cache: {
    enabled: true,
    ttl: 10000,
    onExpire(entry) {
      console.log(`${entry.k} has expired`);
    }
  }
})

const response = await urbex.get("https://jsonplaceholder.typicode.com/users");

console.log(response.cache) // { key: "", hit: true, pulled: false, stored: true };

const response2 = await urbex.get("https://jsonplaceholder.typicode.com/users");

console.log(response2.cache) // { key: "", hit: true, pulled: true, stored: false };
```

The urbex client also provides an accessor to the cache. This is useful if you want programmatic access to the cache. You are still able to use the cache directly without making requests.

```typescript
console.log(urbex.cache) // CacheClock { ... }

// set a value in the cache
urbex.cache.set("https://jsonplaceholder.typicode.com/users", { data: "test" }, { ttl: 10000, overwrite: false });

// start the clock

urbex.cache.start();

// stop the clock

urbex.cache.stop();
```

Check out the [Cache Clock](https://github.com/itsmichaelbtw/cache-clock) module for more information on the cache.

## Error Handling

Errors are handled automatically by the client. After each request has finished, the response status is checked to see if it is allowed to resolve. By default, all status codes that fall between **200** and **299** are allowed to resolve. If the status code is not allowed, the response is rejected with an error. The error object contains the response object and the status code.

```typescript
/**
 * The base error class that gets thrown when a request fails.
 */
export interface UrbexErrorType {
    /**
     * The status of the error.
     */
    status: number;
    /**
     * The config object that was used to make the request.
     */
    config: InternalConfiguration;
    /**
     * The request object that was used to make the request.
     */
    request: any;
    /**
     * The response object that was returned from the request.
     */
    response: UrbexResponse;
    /**
     * The error message.
     */
    message: string;
}
```

### Resolve Status Codes

To control if a request is allowed to resolve, you can use the `resolveStatus` option in the configuration. Both the current configuration and the response status code are passed to the function. The function must return a boolean value. 

```typescript
urbex.get("https://jsonplaceholder.typicode.com/users", {
  resolveStatus: (config, status) => {
    // the internal config is also passed in case you wish to use it
    return status === 200;
  }
})
```

## Caveats

#### Headers

There is one exception when setting the `Content-Type` property on the `headers` object. The built in `transformRequestData` pipeline automatically ensures that `POST`, `PUT` and `PATCH` requests have a `Content-Type` header set to `application/x-www-form-urlencoded`, and validates the request body if one is provided and sets the appropriate `Content-Type` header.

To solve this, you will need to create a request pipeline that changes this header to whatever you require it to be.

```typescript
import urbex, { PipelineExecutor } from "urbex";

urbex.configure({
  headers: {
    "Content-Type": "multipart/form-data" // will get overwritten
  }
})

console.log(urbex.config.headers["Content-Type"]); // application/x-www-form-urlencoded

// solution

urbex.configure({
  pipelines: {
    request: [
      new PipelineExecutor((config) => {
        config.headers.set({
          "Content-Type": "multipart/form-data"
        })

        return Promise.resolve(config)
      })
    ]
  }
})

// now on each request, the header will be set to multipart/form-data

const response = await urbex.send();

response.config.headers["Content-Type"]; // multipart/form-data
```

This only applies to the `Content-Type` header.

## TypeScript

Urbex is written in TypeScript and includes type definitions, along with type guards. Below are details on the types that are exported.

```typescript
import urbex from "urbex";

const client = urbex.isolateClient(config);

if (urbex.isUrbexClient(client)) {
    // client is a UrbexClient
}
```

### Interfaces and Types

```typescript
import {
    ExtendedUrbexClient,
    InternalConfiguration,
    PipelineExecutor,
    RequestExecutor,
    ResponseExecutor,
    URIComponent,
    UrbexConfig,
    UrbexErrorType,
    UrbexResponse,
    UrbexURL
} from "urbex";
```

#### ExtendedUrbexClient

An extended version of the Urbex client. This is the client that is exported by default. 

<details>
  <summary>Interface</summary>

  ```typescript
  export interface ExtendedUrbexClient extends UrbexClient {
      /**
       * Create a new isolated instance of the Urbex client
       *
       * Any existing configuration will be copied to the new
       * instance. Furthermore, changes made to the new instance
       * will not affect the original instance
       */
      isolateClient(config?: UrbexConfig): UrbexClient;
      /**
       *
       * TypeScript safe guard to check if an object is an instance of UrbexClient
       */
      isUrbexClient(client: unknown): client is UrbexClient;
      /**
       * The underlying UrbexClient class which can be used to create new instances
       *
       * Recommended to use `isolateClient` instead
       */
      Client: typeof UrbexClient;
      /**
       * The current environment of the project
       */
      environment: Environment;
  }
  ```
</details>

#### InternalConfiguration

The internal configuration object that is used to make requests. This object is passed to the request pipeline and is used to make the request. When you attempt to configure the client, this is the object that is returned after internal parsing and validation.

<details>
  <summary>Base Configuration</summary>

  ```typescript
  /**
   * The base configuration object.
   */
  export interface BaseConfiguration<D = any> {
      /**
       * Set the default request method to use. This is useful if you find
       * yourself using the same method for all requests.
       *
       * It is recommended when setting this option, to instead use
       * `urbex.send()`. This will use the method specified in the
       * request options.
       *
       * Defaults to "GET".
       */
      method: Methods;
      /**
       * Set the default data to use.
       *
       * Any additional data passed to the request will not be merged
       * with the default data.
       *
       * Defaults to `null`.
       */
      data: D;
      /**
       * Set the default timeout to use for all requests.
       *
       * Defaults to `0` (no timeout).
       */
      timeout: number;
      /**
       * Control the internal ttl cache module. Provide a `ttl` value to enable the cache.
       *
       * See the [cache-clock](https://github.com/itsmichaelbtw/cache-clock)
       * documentation for more information.
       *
       * Defaults to `{}`.
       */
      cache: ClockOptions & {
          /**
           * Whether or not to enable the cache.
           */
          enabled?: boolean;
      };
      /**
       * Custom pipeline transformers to use. These are executed in the order
       * they are provided and on each request.
       */
      pipelines: PipelineExecutorsManager;
      /**
       * The max content length to allow for the response.
       *
       * Defaults to `Infinity`.
       */
      maxContentLength: number;
      /**
       * The response type to use for the request.
       *
       * Defaults to `json`.
       */
      responseType: ResponseTypes;
      /**
       * The encoding to use when converting the response to a string.
       *
       * Defaults to `utf8`.
       */
      responseEncoding: BufferEncoding;
      /**
       * A function that determines whether the request should be considered
       * successful or not.
       *
       * Provides the `InternalConfiguration` object and `status` code.
       */
      resolveStatus: ResolveStatus;
  }
  ```
</details>

<details>
  <summary>Interface</summary>

  ```typescript
  /**
   * The return type when configuring the `urbex` client.
   */
  export type InternalConfiguration<D = any> = BaseConfiguration<D> & {
      /**
       * The url that was provided has been parsed and is ready to be used.
       */
      url: URIComponent;
      /**
       * The headers object representing the headers that will be sent with the request.
       *
       * This uses the internal `UrbexHeaders` class. You are free to use the provided methods.
       */
      headers: UrbexHeaders;
  };
  ```
</details>

#### PipelineExecutor

A class that is used to create a new pipeline executor.

#### RequestExecutor

A generic type that is used when instantiating a new `PipelineExecutor` for the request pipeline.

<details>
  <summary>Type</summary>

  ```typescript
  /**
   * The callback to provide when creating a new pipeline executor for a request.
   */
  export type RequestExecutor = (config: InternalConfiguration) => Promise<InternalConfiguration>;
  ```
</details>

#### ResponseExecutor

A generic type that is used when instantiating a new `PipelineExecutor` for the response pipeline.

<details>
  <summary>Type</summary>

  ```typescript
  /**
   * The callback to provide when creating a new pipeline executor for a response.
   */
  export type ResponseExecutor = (config: UrbexResponse) => Promise<UrbexResponse>;
  ```
</details>

#### URIComponent

When a url is parsed, it is converted to a custom `URIComponent` object. This object is used to make the request.

<details>
  <summary>Interface</summary>
  
  ```typescript
  export interface URIComponent {
    /**
     * The full url of the request that was passed to the client.
     */
    href: string;
    /**
     * The origin of the url.
     */
    origin: string;
    /**
     * The transport protocol to use.
     *
     * Defaults to `https://`.
     */
    protocol: string;
    /**
     * The hostname name to use. If the hostname is not specified, the current domain
     * will be used. If `environment.isNode` is `true`, then localhost is used.
     *
     * The subdomain, domain and tld will be extracted from the hostname.
     *
     * E.g. if
     * the hostname is `https://api.example.com/api/v1`, then the hostname will be `api.example.com`.
     */
    hostname: string;
    /**
     * If you are making a request that has an api mounted at a different url path, you
     * can set it here. This is designed to remove the cumbersome task of specifying the full
     * url path for each request.
     *
     * E.g. if you are making a request to `https://example.com/api/v1`, you can set the urlMount to
     * `/api/v1` and all requests will be made to that url.
     *
     * If you do not require this functionality, default it to `null` or `undefined` within the global
     * configuration.
     *
     * Defaults to `/api`.
     */
    urlMount: string | null;
    /**
     *
     * The endpoint to use. This is the path that will be appended to the hostname, and after the
     * urlMount, if one is present.
     */
    endpoint: string;
    /**
     * The port to use.
     *
     * If you do not require this functionality, default it to `null` or `undefined` within the global
     * configuration.
     */
    port: number | string | null;
    /**
     * The query string to use in the request.
     */
    params: SearchParams;
  }
  ```
</details>


#### UrbexConfig

A configuration object that is available to the user when making requests with `urbex`. Either through the `send()` method or a supported HTTP verb.

<details>
  <summary>Base Configuration</summary>

  ```typescript
  /**
   * The base configuration object.
   */
  export interface BaseConfiguration<D = any> {
      /**
       * Set the default request method to use. This is useful if you find
       * yourself using the same method for all requests.
       *
       * It is recommended when setting this option, to instead use
       * `urbex.send()`. This will use the method specified in the
       * request options.
       *
       * Defaults to "GET".
       */
      method: Methods;
      /**
       * Set the default data to use.
       *
       * Any additional data passed to the request will not be merged
       * with the default data.
       *
       * Defaults to `null`.
       */
      data: D;
      /**
       * Set the default timeout to use for all requests.
       *
       * Defaults to `0` (no timeout).
       */
      timeout: number;
      /**
       * Control the internal ttl cache module. Provide a `ttl` value to enable the cache.
       *
       * See the [cache-clock](https://github.com/itsmichaelbtw/cache-clock)
       * documentation for more information.
       *
       * Defaults to `{}`.
       */
      cache: ClockOptions & {
          /**
           * Whether or not to enable the cache.
           */
          enabled?: boolean;
      };
      /**
       * Custom pipeline transformers to use. These are executed in the order
       * they are provided and on each request.
       */
      pipelines: PipelineExecutorsManager;
      /**
       * The max content length to allow for the response.
       *
       * Defaults to `Infinity`.
       */
      maxContentLength: number;
      /**
       * The response type to use for the request.
       *
       * Defaults to `json`.
       */
      responseType: ResponseTypes;
      /**
       * The encoding to use when converting the response to a string.
       *
       * Defaults to `utf8`.
       */
      responseEncoding: BufferEncoding;
      /**
       * A function that determines whether the request should be considered
       * successful or not.
       *
       * Provides the `InternalConfiguration` object and `status` code.
       */
      resolveStatus: ResolveStatus;
  }
  ```
</details>

<details>
  <summary>Interface</summary>

  ```typescript
  /**
   * A configuration object for the `urbex` client used to make requests.
   */
  export type UrbexConfig<D = any> = Partial<BaseConfiguration<D>> & {
      /**
       * Configure the base url for the client.
       *
       * Note: When passing a URI object, the object will be merged with the default URI options.
       * If you wish to remove the default options, pass `null` as the value for the property.
       */
      url?: UrbexURL;
      /**
       * Custom headers to be sent with the request. These headers will be merged with the default headers.
       */
      headers?: Headers;
  };
  ```
</details>

#### UrbexErrorType

When a request fails, an error is thrown. This is the error interface you will recieve. Internally, this extends the native `Error` object.

<details>
  <summary>Interface</summary>

  ```typescript
  /**
   * The base error class that gets thrown when a request fails.
   */
  export interface UrbexErrorType {
      /**
       * The status of the error.
       */
      status: number;
      /**
       * The config object that was used to make the request.
       */
      config: InternalConfiguration;
      /**
       * The request object that was used to make the request.
       */
      request: any;
      /**
       * The response object that was returned from the request.
       */
      response: UrbexResponse;
      /**
       * The error message.
       */
      message: string;
  }
  ```
</details>

#### UrbexResponse

The response object that is returned from a successful request.

<details>
  <summary>Interface</summary>

  ```typescript
  /**
   * The response object returned by the `urbex` client when a request is successful.
   */
  export interface UrbexResponse<D = any> {
      /**
       * The status code of the response.
       */
      status: number;
      /**
       * The status text of the response.
       */
      statusText: string;
      /**
       * The headers of the response.
       */
      headers: any;
      /**
       * The data of the response.
       */
      data: D;
      /**
       * The request configuration that was used to make the request.
       */
      config: InternalConfiguration;
      /**
       * The request that was made.
       */
      request: any;
      /**
       * The response that was received.
       */
      response: any;
      /**
       * The time it took to make the request in `ms`. This includes
       * any pipelines that were also executed.
       *
       * Uses `Date.now()` to calculate the time.
       */
      duration: number;
      /**
       * The time the request was made as an ISO string.
       */
      timestamp: string;
      /**
       * An object indicating its interaction with the cache.
       */
      cache: ResponseCachable;
      /**
       * The response type that was used to make the request.
       */
      responseType: ResponseTypes;
  }
```
</details>

#### UrbexURL

When configuring the client or a request, a url can be provided as either a string or an object. If an object is provided, it will be merged with the default url options.

<details>
  <summary>Type</summary>

  ```typescript
  /**
   * A customizable url object.
   */
  export type UrbexURL = Partial<URIComponent> | string;
  ```
</details>

## Change Log

See [CHANGELOG.md](CHANGELOG.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
