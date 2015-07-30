var expect = require('chai').expect,
    btoa = require('btoa'),
    SourceMapConsumer = require('source-map').SourceMapConsumer,

    utils = require('../lib/utils');

describe('Utils', function() {
    var someSourceMap = {
            version: 3,
            file: 'min.js',
            names: ['bar', 'baz', 'n'],
            sources: ['one.js', 'two.js'],
            sourceRoot: 'http://example.com/www/js/',
            mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
        },
        STUB_SOURCE_MAP = new SourceMapConsumer(someSourceMap),
        SOURCE_MAP_STRING = '//# sourceMappingURL=data:application/json;base64,' + btoa(JSON.stringify(someSourceMap));

    describe('getSourceMap()', function() {
        it('should return source map for bunch of lines', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_STRING]);
            sourceMap.should.be.deep.equal(STUB_SOURCE_MAP);
        });

        it('should return source map for string content', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_STRING].join('\n'));
            sourceMap.should.be.deep.equal(STUB_SOURCE_MAP);
        });

        it('should return null if no sourcemap in lines', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2']);
            expect(sourceMap).to.be.equal(null);
        });

        it('should return null if no sourcemap in content', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2'].join('\n'));
            expect(sourceMap).to.be.equal(null);
        });

        it('should return null if sourcemap is not the last line', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_STRING, 'some-line']);
            expect(sourceMap).to.be.equal(null);
        });

        it('should return null if sourcemap is not the last line in content', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_STRING, 'some-line'].join('\n'));
            expect(sourceMap).to.be.equal(null);
        });
    });

    describe('removeBuiltInSourceMap()', function() {
        it('should return source map line', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2', SOURCE_MAP_STRING]);
            lines.should.be.deep.equal(['line1', 'line2']);
        });

        it('should return content without source map line', function() {
            var content = utils.removeBuiltInSourceMap(['line1', 'line2', SOURCE_MAP_STRING].join('\n'));
            content.should.be.deep.equal(['line1', 'line2'].join('\n'));
        });

        it('should return same lines if no source map line', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2']);
            lines.should.be.deep.equal(['line1', 'line2']);
        });

        it('should return same content if no source map line', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2'].join('\n'));
            lines.should.be.deep.equal(['line1', 'line2'].join('\n'));
        });

        it('should return same lines if source map line is not the last one', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2', SOURCE_MAP_STRING, 'some-line']);
            lines.should.be.deep.equal(['line1', 'line2']);
        });

        it('should return same content if source map line is not the last one', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2', SOURCE_MAP_STRING, 'some-line'].join('\n'));
            lines.should.be.deep.equal(['line1', 'line2'].join('\n'));
        });
    });
});
