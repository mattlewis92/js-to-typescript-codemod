# js-to-typescript-codemod
A simple codemod for helping migrate from babel to typescript.

There is a single transform that converts babel style ES6 imports to be typescript compatible e.g. 

```
import moment from 'moment';
```

to 

```
import * as moment from 'moment';
```

It will skip transforming modules not in node_modules or that already have a default export.

A best guess attempt is also made to convert webpack'd modules - the main files are statically analysed for a default export, and any non-js file imports are converted.

Usage
```
jscodeshift -t convert-default-imports.js <file>
```