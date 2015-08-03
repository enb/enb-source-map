var os = require('os'),
    expect = require('chai').expect,
    btoa = require('btoa'),
    SourceMapConsumer = require('source-map').SourceMapConsumer,

    utils = require('../lib/utils');

describe('Utils', function() {
    var SOME_SOURCE_MAP = {
            version: 3,
            file: 'min.js',
            names: ['bar', 'baz', 'n'],
            sources: ['one.js', 'two.js'],
            sourceRoot: 'http://example.com/www/js/',
            mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
        },
        STUB_SOURCE_MAP = new SourceMapConsumer(SOME_SOURCE_MAP),
        SOURCE_MAP_LINE = '//# sourceMappingURL=data:application/json;base64,' + btoa(JSON.stringify(SOME_SOURCE_MAP));

    describe('getSourceMap()', function() {
        it('should return source map for bunch of lines', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_LINE]);
            sourceMap.should.be.deep.equal(STUB_SOURCE_MAP);
        });

        it('should return source map for string content', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_LINE].join(os.EOL));
            sourceMap.should.be.deep.equal(STUB_SOURCE_MAP);
        });

        it('should return null if no sourcemap in lines', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2']);
            expect(sourceMap).to.be.equal(null);
        });

        it('should return null if no sourcemap in content', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2'].join(os.EOL));
            expect(sourceMap).to.be.equal(null);
        });

        it('should return null if sourcemap is not the last line', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_LINE, 'some-line']);
            expect(sourceMap).to.be.equal(null);
        });

        it('should return null if sourcemap is not the last line in content', function() {
            var sourceMap = utils.getSourceMap(['line1', 'line2', SOURCE_MAP_LINE, 'some-line'].join(os.EOL));
            expect(sourceMap).to.be.equal(null);
        });
    });

    describe('removeBuiltInSourceMap()', function() {
        it('should return source map line', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2', SOURCE_MAP_LINE]);
            lines.should.be.deep.equal(['line1', 'line2']);
        });

        it('should return content without source map line', function() {
            var content = utils.removeBuiltInSourceMap(['line1', 'line2', SOURCE_MAP_LINE].join(os.EOL));
            content.should.be.deep.equal(['line1', 'line2'].join(os.EOL));
        });

        it('should return same lines if no source map line', function() {
            var lines = utils.removeBuiltInSourceMap(['line1', 'line2']);
            lines.should.be.deep.equal(['line1', 'line2']);
        });

        it('should return same content if no source map line', function() {
            var content = utils.removeBuiltInSourceMap(['line1', 'line2'].join(os.EOL));
            content.should.be.deep.equal(['line1', 'line2'].join(os.EOL));
        });

        it('should return same lines if source map line is not the last one', function() {
            var expectedLines = ['line1', 'line2', SOURCE_MAP_LINE, 'some-line'];
            var lines = utils.removeBuiltInSourceMap(expectedLines);
            lines.should.be.deep.equal(expectedLines);
        });

        it('should return same content if source map line is not the last one', function() {
            var expectedContent = ['line1', 'line2', SOURCE_MAP_LINE, 'some-line'].join(os.EOL);
            var content = utils.removeBuiltInSourceMap(expectedContent);
            content.should.be.deep.equal(expectedContent);
        });
    });

    describe('joinContentAndSourceMap()', function() {
        it('should join content and source map', function() {
            var result = utils.joinContentAndSourceMap(['line1', 'line2'].join(os.EOL), SOME_SOURCE_MAP);
            result.should.be.equal(['line1', 'line2', SOURCE_MAP_LINE].join(os.EOL));
        });
    });
});
