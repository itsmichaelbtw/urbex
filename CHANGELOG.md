# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/orison-networks/urbex/compare/v1.0.0...v1.1.0) (2022-11-21)


### What's New

* internal request api now integrates with the `CacheClock` module ([57de0d8](https://github.com/orison-networks/urbex/commit/57de0d88823414eb1da34e08a884e9ede07ef1a2))
* **pipelines:** support for buildable pipline executors ([99adf7f](https://github.com/orison-networks/urbex/commit/99adf7f42f1026ccc8adb8bb31549330dd9f41d6))
* **request-config:** improved config parser for an increased result output ([a9fb982](https://github.com/orison-networks/urbex/commit/a9fb982708f36b7128e2e5b636e07724b23b25ca))
* support for `responseType` and `responseEncoding` options ([e7ce7ae](https://github.com/orison-networks/urbex/commit/e7ce7aebc478e8ac86cc01a33164a3c285c5a412))
* **types:** extended `UrbexResponse` with additional properties ([19c23b0](https://github.com/orison-networks/urbex/commit/19c23b0b31843b821eed956954e8cb911cdb1bea))
* **types:** improved typescript converage ([78ce34c](https://github.com/orison-networks/urbex/commit/78ce34c1d85075ba72ab7cdac6649c9bd83e7adc))
* **types:** only necessary types are exported ([9d2c67a](https://github.com/orison-networks/urbex/commit/9d2c67a169b0040635c3b06b20bc7493145a1b58))


### Fixed

* **headers:** incorrectly assigning default headers when using in a browser ([ca56b68](https://github.com/orison-networks/urbex/commit/ca56b6831dc925a5673790857705e3e50d4023e7))
* incorrectly checking if `endpoint` and `urlMount` start with a `/` ([761757d](https://github.com/orison-networks/urbex/commit/761757dd79a8ace1b7645a7e927e9a795da1e531))
* uri parsing handling partial urls incorrectly ([a2ba671](https://github.com/orison-networks/urbex/commit/a2ba6716ecc0d9a26070dd2c51df294eeb49f86f))
* **uriParser:** failing to correctly update the `url.href` [#4](https://github.com/orison-networks/urbex/issues/4) ([93228ce](https://github.com/orison-networks/urbex/commit/93228ce00e43cf7e79be938a9c765ae85cbe148d))

## 1.0.0 (2022-10-27)


### What's New

* **cache:** capture and control ttl's on cachable items ([7fe55ef](https://github.com/orison-networks/urbex/commit/7fe55ef7cebeab1c6ec8922df006ff50c73bb047))
* **cache:** find a suitable time provider based on env context ([80a758e](https://github.com/orison-networks/urbex/commit/80a758efc12667aef7271a53bd9ddc3342dcdab8))
* **cache:** generate consistent cache keys based on input ([f05714a](https://github.com/orison-networks/urbex/commit/f05714ac12160925506ff52f42d70923482a63d2))
* **cache:** new ttl-cache to store items with a ttl ([889ac1c](https://github.com/orison-networks/urbex/commit/889ac1c2c4c9f1de3007bfefa6997956b0c0e0ce))
* **cache:** stringify incoming data when adding to cache ([6ab6fba](https://github.com/orison-networks/urbex/commit/6ab6fbad59e4c94db1b3d1e3064bb13eceb13914))
* **config:** support for uri validation, parsing and config setting ([ef0c4b9](https://github.com/orison-networks/urbex/commit/ef0c4b9eff101abc4c24d030f7bcee46610944c5))
* **core:** the client now supports alias method calls ([fd7dce4](https://github.com/orison-networks/urbex/commit/fd7dce42dd0717a4d802dbd14aff2ace5b8b3258))
* **environment:** configure and parse a `.env` file if found ([4b1fc0b](https://github.com/orison-networks/urbex/commit/4b1fc0bada19f6d8afffe3dba31edfa4c009d854))
* **environment:** detect the current working environment of a project ([d074a10](https://github.com/orison-networks/urbex/commit/d074a109ba7a3b910b93e637168b446ecebe6985))
* **headers:** added default `User-Agent` headers to Node environments ([16d70bd](https://github.com/orison-networks/urbex/commit/16d70bd94fe7475754594d96345aa766f2f05c5a))
* **headers:** added method to normalize incoming header config ([ad2444a](https://github.com/orison-networks/urbex/commit/ad2444aeb6bbbd43910b1e9c8c5d9e5a2e8e3f46))
* **headers:** support static creation of a headers instance ([0628313](https://github.com/orison-networks/urbex/commit/0628313a85f6d7c016812d8c4c7ed8bc4c40f68e))
* **http:** perform basic http requests in node environments ([37d9da2](https://github.com/orison-networks/urbex/commit/37d9da2c593ffc874659f2b6b3ee742c2ef1840b))
* **serializeParams:** now supports optional return types ([a1b9099](https://github.com/orison-networks/urbex/commit/a1b909996a378c2318af1bf77d8abf110f08f75c))
* **types:** global project types ([46da3bc](https://github.com/orison-networks/urbex/commit/46da3bca2cfb3b1c820b59aab28ea9b03918c60f))
* **urbex:** added core urbex class for creating http clients ([ac5216e](https://github.com/orison-networks/urbex/commit/ac5216e8affe99e2f5ab3d999d33ad0ff084d557))
* **urbex:** added default export to the extended urbex client ([40288e0](https://github.com/orison-networks/urbex/commit/40288e0adb62963871f3ca04855c3136b286b2f7))
* **urbex:** added headers class to parse and manipulate config headers ([33ccf2a](https://github.com/orison-networks/urbex/commit/33ccf2a27ce129054a58dacaf69abd9e8b5e8d1a))
* **utils:** added deepMerge and forEach utility functions ([9809d75](https://github.com/orison-networks/urbex/commit/9809d7544b4ffb54addca794ecbaaae572d9c1f7))
* **utils:** effectively determine a values type ([3721d06](https://github.com/orison-networks/urbex/commit/3721d06d24d3beeaab6b801e99cd596401283142))
* **utils:** extra utility methods ([a9eeff8](https://github.com/orison-networks/urbex/commit/a9eeff8d26fb38fe664a7d2866fb9444e249baaf))
* **utils:** local method to extract match at given index ([77218a1](https://github.com/orison-networks/urbex/commit/77218a127e6d650341ace0531cd36fccda95a97b))


### Fixed

* `window` and `process` objects throwing errors when passed as an argument ([23e088e](https://github.com/orison-networks/urbex/commit/23e088eecbb32473f7d86e1c4becee9483ce9bba))
* component -> string returns incorrect values when an non-object is passed ([8b2b198](https://github.com/orison-networks/urbex/commit/8b2b198a67034331741194c1ace6dbef0fc8f61a))
* defining a new environment instance caused it to be undefined ([d00423a](https://github.com/orison-networks/urbex/commit/d00423ad5fc75f22b664e4baa3436abeeef8ad49))
* disable force merge when clearing header values ([93b029b](https://github.com/orison-networks/urbex/commit/93b029b86f2b9541a3a63c3dc3edc420cb2afeb5))
* **env:** throw a contextful error when attempting to use in browser ([92574be](https://github.com/orison-networks/urbex/commit/92574becaefc123ac1b579e03229b525d8e6f86d))
* incorrect import paths ([320a6d7](https://github.com/orison-networks/urbex/commit/320a6d7bed9e0449f2e142e64ad25eff4723ea2c))
* incorrect internal types for method alias generation ([224d8c5](https://github.com/orison-networks/urbex/commit/224d8c5cf03c0684536ce356880b1f5e00cc9403))
* incorrect method call ([47b2b33](https://github.com/orison-networks/urbex/commit/47b2b339b35e2a8ea2a76b0733a1768ad1c4ad8c))
* params not serializing correctly [#6](https://github.com/orison-networks/urbex/issues/6) ([a5cf0c2](https://github.com/orison-networks/urbex/commit/a5cf0c267bb1cbf8259c912cc63721da4c9004fb))
* support for null type ([efe5d44](https://github.com/orison-networks/urbex/commit/efe5d440f4bdcd1ce67cde597310f6a2b667b823))
* typescript complaining about unassignable types [#3](https://github.com/orison-networks/urbex/issues/3) ([e3b88ac](https://github.com/orison-networks/urbex/commit/e3b88accb94a61003f95e17f946d986cd3d22c98))
* **typescript:** iterable maps only available in ES2015 or higher [#2](https://github.com/orison-networks/urbex/issues/2) ([b31b833](https://github.com/orison-networks/urbex/commit/b31b83367964ad000ceb83384111ab470b644927))
* unable to pass an optional config when isolating the client ([52b239f](https://github.com/orison-networks/urbex/commit/52b239ffb2186708738af0831f650362111000d7))
* unit tests can now be run in both Node and Browser environments ([6075715](https://github.com/orison-networks/urbex/commit/607571507986a0cb0e72a46c30e947aa7af46cda))
* **uriparser:** empty values were being handled incorrectly ([e42e593](https://github.com/orison-networks/urbex/commit/e42e593293be23151ef47768a698a4167e0b73ff))
* url port returning null instead of an empty string ([c046b23](https://github.com/orison-networks/urbex/commit/c046b23b950d5856c4e0d505ef3674f88e8a7c1d))
