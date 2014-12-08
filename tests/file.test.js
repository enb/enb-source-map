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

        describe('write()', function () {
            it('should add content to the output', function () {
                file.write('1');
                file.write('2');
                file.write('3\n');
                file.write('4\n5');
                file.render().should.equal('123\n4\n5');
            });

            it('should move cursor forward', function () {
                file.getCursor().line.should.equal(1);
                file.getCursor().column.should.equal(0);
                file.write('123');
                file.getCursor().line.should.equal(1);
                file.getCursor().column.should.equal(3);
                file.write('456');
                file.getCursor().line.should.equal(1);
                file.getCursor().column.should.equal(6);
                file.write('\n');
                file.getCursor().line.should.equal(2);
                file.getCursor().column.should.equal(0);
                file.write('\n\n');
                file.getCursor().line.should.equal(4);
                file.getCursor().column.should.equal(0);
                file.write('\n123');
                file.getCursor().line.should.equal(5);
                file.getCursor().column.should.equal(3);
            });
        });

        describe('writeFileFragment()', function () {
            it('should add content to the output', function () {
                file.writeFileFragment('2.js', 'line 1\nline 2', 1, 0);
                file.writeFileFragment('2.js', 'line 3\nline 4', 2, 0);
                file.render().should.equal('line 1\nline 2line 3\nline 4');
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

        describe('write()', function () {
            it('should add content to the output', function () {
                file.write('1');
                file.write('2');
                file.write('3\n');
                file.write('4\n5\n');
                hasSourceMap(file.render()).should.equal(true);
                stripSourceMap(file.render()).should.equal('123\n4\n5\n');
            });

            it('should move cursor forward', function () {
                file.getCursor().line.should.equal(1);
                file.getCursor().column.should.equal(0);
                file.write('123');
                file.getCursor().line.should.equal(1);
                file.getCursor().column.should.equal(3);
                file.write('456');
                file.getCursor().line.should.equal(1);
                file.getCursor().column.should.equal(6);
                file.write('\n');
                file.getCursor().line.should.equal(2);
                file.getCursor().column.should.equal(0);
                file.write('\n\n');
                file.getCursor().line.should.equal(4);
                file.getCursor().column.should.equal(0);
                file.write('\n123');
                file.getCursor().line.should.equal(5);
                file.getCursor().column.should.equal(3);
            });
        });

        describe('writeFileFragment()', function () {
            it('should add content to the output', function () {
                file.write('_');
                file.writeFileFragment('2.js', 'line 1\nline 2', 1, 0);
                file.writeFileFragment('3.js', 'line 3\nline 4', 2, 3);
                hasSourceMap(file.render()).should.equal(true);
                stripSourceMap(file.render()).should.equal('_line 1\nline 2line 3\nline 4\n');

                var locator = new SourceLocator('1.js', file.render());
                var loc1 = locator.locate(1, 0);
                loc1.source.should.equal('1.js');
                loc1.line.should.equal(1);
                loc1.column.should.equal(0);

                var loc2 = locator.locate(1, 1);
                loc2.source.should.equal(path.resolve(__dirname + '/../2.js'));
                loc2.line.should.equal(1);
                loc2.column.should.equal(0);

                var loc3 = locator.locate(2, 1);
                loc3.source.should.equal(path.resolve(__dirname + '/../2.js'));
                loc3.line.should.equal(2);
                loc3.column.should.equal(1);

                var loc4 = locator.locate(2, 6);
                loc4.source.should.equal(path.resolve(__dirname + '/../3.js'));
                loc4.line.should.equal(2);
                loc4.column.should.equal(3);

                var loc5 = locator.locate(3, 1);
                loc5.source.should.equal(path.resolve(__dirname + '/../3.js'));
                loc5.line.should.equal(3);
                loc5.column.should.equal(1);
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

                var comment1Loc = locator.locate(1, 3);
                comment1Loc.source.should.equal('1.js');
                comment1Loc.line.should.equal(1);
                comment1Loc.column.should.equal(3);

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
