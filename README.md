enb-source-map
==============

[![NPM version](https://img.shields.io/npm/v/enb-source-map.svg?style=flat)](https://www.npmjs.org/package/enb-source-map) [![Build Status](https://img.shields.io/travis/enb/enb-source-map/master.svg?style=flat&label=tests)](https://travis-ci.org/enb/enb-source-map)
[![Dependency Status](https://img.shields.io/david/enb/enb-source-map.svg?style=flat)](https://david-dm.org/enb/enb-source-map)

Помошник для работы с картами кода.

Пример
------

```js
var fs = require('fs'),
    File = require('enb-source-map/lib/file'),
    file = new File('output.js', { sourceMap: true });

file
    .write('line')
    .writeLine('-1')
    .writeFileContent('input-1.js', fs.readFileSync('input-1.js', 'utf-8'))
    .writeFileFragment('input-2.js', fs.readFileSync('input-2.js', 'utf-8').split('\n').pop(), 1, 0)
    .writeLine('line 2');

file.getContent();   
// line-1
// input-1-contents
// input-2-fragment
// line 2
file.getSourceMap();
// {
//   version: 3,
//   sources: [ 'input-1.js', 'input-2.js' ],
//   names: [],
//   mappings: ';AAAA;ACAA',
//   file: 'output.js'
// }
```
