var path = require('path');
require('chai').should();
var File = require('../lib/file');
var SourceLocator = require('../lib/source-locator');

describe('File', function () {
    var file;
    describe('without source map', function () {
        beforeEach(function () {
            file = new File('1.js', false);
        });

        describe('writeLine()', function () {
            it('should add a new line to the output', function () {
                file.writeLine('line 1');
                file.writeLine('line 2');
                file.render().should.equal('line 1\nline 2\n');
            });
        });

        describe('writeContent()', function () {
            it('should add content to the output', function () {
                file.writeContent('line 1\nline 2');
                file.writeContent('line 3\nline 4');
                file.render().should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });

        describe('writeFileContent()', function () {
            it('should add content to the output', function () {
                file.writeFileContent('2.js', 'line 1\nline 2');
                file.writeFileContent('2.js', 'line 3\nline 4');
                file.render().should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });
    });

    describe('with source map', function () {
        beforeEach(function () {
            file = new File('1.js', true);
        });

        describe('writeLine()', function () {
            it('should add a new line to the output', function () {
                file.writeLine('line 1');
                file.writeLine('line 2');
                hasSourceMap(file.render()).should.equal(true);
                stripSourceMap(file.render()).should.equal('line 1\nline 2\n');
            });
        });

        describe('writeContent()', function () {
            it('should add content to the output', function () {
                file.writeContent('line 1\nline 2');
                file.writeContent('line 3\nline 4');
                hasSourceMap(file.render()).should.equal(true);
                stripSourceMap(file.render()).should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });

        describe('writeFileContent()', function () {
            it('should add content to the output', function () {
                file.writeFileContent('2.js', 'line 1\nline 2');
                file.writeFileContent('2.js', 'line 3\nline 4');
                hasSourceMap(file.render()).should.equal(true);
                stripSourceMap(file.render()).should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });

        describe('render()', function () {
            it('should produce correct source map', function () {
                file.writeContent('// Hello World');
                file.writeContent('// Some unmapped content');
                file.writeFileContent(
                    'func1.js',
                    '// anonymous function here\n' +
                    'var f1 = function() {\n' +
                    '    return 1;\n' +
                    '};\n' +
                    '// end of anonymous function\n'
                );
                file.writeFileContent(
                    'func2.js',
                    '// named function here\n' +
                    '    function f1() {\n' +
                    '        return 1;\n' +
                    '    }\n' +
                    '// end of named function\n'
                );

                var locator = new SourceLocator('1.js', file.render());
                var function1Loc = locator.locate(4, 9);
                function1Loc.source.should.equal(path.resolve(__dirname + '/../func1.js'));
                function1Loc.line.should.equal(2);
                function1Loc.column.should.equal(9);
            });
        });
    });
});

function hasSourceMap(source) {
    var lines = source.split('\n');
    return lines[lines.length - 1].indexOf('//# sourceMappingURL=') === 0;
}

function stripSourceMap(source) {
    var lines = source.split('\n');
    lines.pop();
    return lines.join('\n') + '\n';
}
