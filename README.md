# urbex

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/orison-networks/urbex/unit-tests.yml?label=unit%20tests&branch=main&style=flat-square)
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
  - [Verb Aliases](#verb-aliases)
  - [Request Lifecycle](#request-lifecycle)
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

Note: On each request, the global configuration is cloned and merged with the request configuration. This ensures that the global configuration is not mutated.

### Verb Aliases

- `urbex.get(url[, config])`
- `urbex.post(url[, data[, config]])`
- `urbex.put(url[, data[, config]])`
- `urbex.patch(url[, data[, config]])`
- `urbex.delete(url[, config])`
- `urbex.head(url[, config])`
- `urbex.options(url[, config])`

It is recommended if you find yourself only requesting data from the same URL with the same method, to use `urbex.send` instead. 

### Request Lifecycle

A lifecycle of a request is merely broken down into 5 stages:

1. **Request Initiation**
This is where the request is initiated and the current time is captured for a point of reference. All `request` pipelines are executed here in order and modifications are made to the request configuration.
2. **Cache Lookup**
If you have enabled the cache module, the cache is checked to see if the request has been made before. If it has, conclude the request early (stage 4), else continue to stage 3.
3. **Perform Request**
The request is made and the response is captured. This is where the `resolveStatus` function is called to determine if the request was successful or not. Any errors caught here are automatically thrown and caught by the `catch` block.
4. **Conclude Request**
Once the request has been resolved, a response is created and returned. All `response` pipelines are executed here in order and modifications are made to the response. Finally, the duration of the request is calculated and the response is returned.
5. **Cache Response**
If you have the enabled the cache module, the response is cached for future use. The value cached is *after* executing the `response` pipelines.

## Configuring the client

The client can be configured globally or on a per-request basis. The global configuration is the default configuration that is used for all requests. The per-request configuration is used to override the global configuration for a specific request. You are freely able to use both the global and per-request configuration at the same time, along with calling `.configure()` multiple times. All configurations are merged together in the order they are called.

The **core** detects what environment it is running in and will automatically set the default configuration for that environment.

| Property             | Default              | Description                                                                            |
|----------------------|----------------------|----------------------------------------------------------------------------------------|
| **url**              | Based on environment | The url to use for the request. Can be either a string or an object.                   |
| **headers**          | Based on environment | Custom headers to be sent with the request.                                            |
| **method**           | `GET`                | The method of the request.                                                             |
| **data**             | `null`               | Data to use when a request accepts a request body.                                     |
| **timeout**          | `0`                  | Set the default timeout to use for all requests.                                       |
| **cache**            | `{}`                 | Control the internal ttl cache module.                                                 |
| **pipelines**        | Based on environment | Custom pipeline transformers to use when making requests.                              |
| **maxContentLength** | `Infinity`           | The max content length of a response.                                                  |
| **responseType**     | `JSON`               | The response type of the request.                                                      |
| **responseEncoding** | `utf8`               | The encoding to use when converting from a buffer to a string.                         |
| **resolveStatus**    | >= 200 && < 300      | A function that determines whether the request should be considered successful or not. |

For clarification on the properties, check out the [TypeScript Definitions](#typescript).

### Environment Defaults

Defaults are applied to the request configuration depending on what environment the client is running in. It is detected as either **browser** or **node**.

#### Browser

```typescript
{
  url: {
    href: window.location.href,
    origin: window.location.origin,
    protocol: window.location.protocol,
    username: "",
    password: "",
    hostname: window.location.hostname,
    port: window.location.port,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
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
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http",
    username: "",
    password: "",
    hostname: "localhost",
    port: 3000,
    pathname: "",
    search: "",
    hash: ""
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

Note: For every isolated client that is instantiated, a new instance of the `CacheClock` class is created. This is to ensure that each client has its own internal cache. If you enable the cache, remember to stop/disable the clock when you are done with the client.

## Pipeline Transformers

Pipeline transformers allow you to take control over how the configuration is managed throughout the lifecycle of a request. Both request and response pipelines are supported. The request pipeline is used to transform the request configuration before the request is made. The response pipeline is used to transform the response data before it is returned to the user. Read more about the [request lifecycle](#request-lifecycle).

There are mandatory pipelines that are evaluated at runtime. These are vital to the core functionality of the client, such as setting appropriate headers, decoding response data, and automatic JSON parsing. See [transformers](lib/core/transformers.ts) for more information on the default pipelines.

You can create your own pipelines to use with the client. These can either be registered with the global configuration, or on a per-request basis. The pipelines are executed in the order they are registered. Each pipeline is asynchronous and must return a promise. The promise must resolve with the configuration object that was passed. Additionally, you are free to throw errors within the pipeline. These are handled automatically and will be rejected with the error.

Each pipeline is passed the configuration object after it has been transformed by the previous pipeline.

```typescript
import urbex, { PipelineExecutor, RequestExecutor, ResponseExecutor } from "urbex";

const requestPipeline = new PipelineExecutor<RequestExecutor>((config) => {
  // Do something with the request configuration
  return Promise.resolve(config)

  // return Promise.reject(new Error("Something went wrong in the request pipeline"))
})

const responsePipeline = new PipelineExecutor<ResponseExecutor>((config) => {
  // Do something with the response configuration
  return Promise.resolve(config)

  // return Promise.reject(new Error("Something went wrong in the resposne pipeline"))
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

Pipeline transformers can be globally registered, or on a per-request basis. Responses that are pulled from the internal cache module still go through the response pipeline. This is to ensure that the response is transformed correctly. Each `PipelineExecutor` instance only registers one pipeline. If you wish to register multiple pipelines, you must create multiple instances of the `PipelineExecutor` class. There is no limit to the number of pipelines that can be registered.

```typescript
const requestPipelines = [
  new PipelineExecutor<RequestExecutor>((config) => {
    // Do something with the request configuration
    return Promise.resolve(config)
  }),
  new PipelineExecutor<RequestExecutor>((config) => {
    // Do something with the request configuration
    // this will have access to the configuration after the previous pipeline has been executed
    return Promise.resolve(config)
  })
];

const responsePipelines = [
  new PipelineExecutor<ResponseExecutor>((config) => {
    // Do something with the response configuration
    return Promise.resolve(config)
  }),
  new PipelineExecutor<ResponseExecutor>((config) => {
    // Do something with the response configuration
    // this will have access to the configuration after the previous pipeline has been executed
    return Promise.resolve(config)
  })
];

urbex.configure({
  pipelines: {
    request: requestPipelines,
    response: responsePipelines
  }
})

// or

urbex.get("/users", {
  pipelines: {
    request: requestPipelines,
    response: responsePipelines
  }
})
```

Whilst a simple integration, this is a powerful feature that allows you to perform any logic/operation before and after a request has been made. 

Examples of pipelines that you can create:

- Automatically log requests
- Append a token to the request headers
- Modify the request URL based on a value
- Edit or set request body data
- Make a request to a different URL based on a condition

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
     * The name of the error.
     */
    name: string;
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

Additional errors such as `NetworkError`, `TimeoutError` and `PipelineError` are thrown when the request fails depending on the error type. These classes along with the `UrbexError` base class are available as a named export.

See the [Urbex Error](lib/core//error.ts) class for more information.

### Resolve Status Codes

To control if a request is allowed to resolve, you can use the `resolveStatus` option in the configuration. Both the current configuration and the response status code are passed to the function. The function must return a boolean value. Errors are caught automatically if this function were to throw an error.

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
    "Content-Type": "multipart/form-data" // will get overwritten for POST, PUT and PATCH requests
  }
})

const response = await urbex.post("https://jsonplaceholder.typicode.com/users");

response.config.headers["Content-Type"] // application/x-www-form-urlencoded

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

For more information on the types, see the [Urbex Types](lib/exportable-types.ts) file.

## Change Log

See [CHANGELOG.md](CHANGELOG.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
