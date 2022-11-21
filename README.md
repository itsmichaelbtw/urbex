## :construction: Currently under rapid development - v1.0.0 only supports NodeJS requests with responseType as text.

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
- [TypeScript](#typescript)
- [Resources](#resources)
- [License](#license)

## Features

- Built for Node.js and the browser
- Global configurations
- Isolated clients
- Built in client-side cache support
- Customizable pipelines for request and response transformations
- Custom status validation
- Ease of use API design
- Extended configuration when defining urls

## Installation

```bash
$ npm install urbex
```

## Usage

```js
import urbex from "urbex";

urbex.configure({});

// using then/catch

urbex.get("https://jsonplaceholder.typicode.com/todos/1").then((response) => {
  console.log(response);
});

// or async/await

try {
  const response = await urbex.get("https://jsonplaceholder.com/todos/1");
  console.log(response);
} catch (error) {
  console.log(error);
}
```

## TypeScript

Urbex is written in TypeScript and includes type definitions, along with type guards.

```js
import urbex from "urbex";

const client = urbex.isolateClient(config);

if (urbex.isUrbexClient(client)) {
    // client is a UrbexClient
}

```

## Resources

- Documentation
- Examples
- [Changelog](CHANGELOG.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
