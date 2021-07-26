[![TypeScript version][ts-badge]][typescript-38]
[![Node.js version][nodejs-badge]][nodejs]
[![MIT][license-badge]][LICENSE]

# flow-utils

A set of Typescript utilities for working with Flow Spec packages, from the [Flow Interoperability Project](https://flowinterop.org).
For the Flow Interoperability standard, see:

+ https://floip.gitbook.io/flow-specification/
+ http://github.com/floip/flow-specification

This library provides:

+ Typescript model objects for representing and converting from RapidPro flows to the Flow Interoperability standard. (This is a beta initiative under active development and is not guaranteed to work for all RapidPro action types)
+ Additional utilities for working with Flow Spec packages and the Flow Spec API

## Usage

### RapidPro Conversion

To convert a RapidPro Flow to the Flow Interoperability standard

```javascript
import { RapidProToFlowInteropConverter } from '@floip/flow-utils';

const rapidProJson = `{
        "name": "Summary Case Report Test",
        "uuid": "630aed00-f07a-4506-9196-8c77d892cfc9",
        "spec_version": "13.1.0",
        "language": "eng",
        "type": "messaging",
        "nodes": [
          ...
        ]
      }`

const converter = new RapidProToFlowInteropConverter(flowJson)
const result = converter.convert()

if(result.isOk()) {
  console.log(result.value)
}
else {
  console.log("Error: " + result.error)
}
```


[ts-badge]: https://img.shields.io/badge/TypeScript-3.8-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2012.13-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v12.x/docs/api/
[typescript]: https://www.typescriptlang.org/
[typescript-38]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/FLOIP/flow-results-utils-ts/blob/master/LICENSE
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
