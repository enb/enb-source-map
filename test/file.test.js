var format = require('util').format,
    sinon = require('sinon'),
    SourceMapConsumer = require('source-map').SourceMapConsumer,
    SourceMapGenerator = require('source-map').SourceMapGenerator,
    File = require('../lib/file'),
    utils = require('../lib/utils');

describe('File', function () {
    var file;
    describe('without source map', function () {
        beforeEach(function () {
            file = new File('1.js', { sourceMap: false });
        });

        describe('writeLine()', function () {
            it('should add a new line to the output', function () {
                file.writeLine('line 1');
                file.writeLine('line 2');
                file.getContent().should.equal('line 1\nline 2\n');
            });
        });

        describe('writeContent()', function () {
            it('should add content to the output', function () {
                file.writeContent('line 1\nline 2');
                file.writeContent('line 3\nline 4');
                file.getContent().should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });

        describe('writeFileContent()', function () {
            it('should add content to the output', function () {
                file.writeFileContent('2.js', 'line 1\nline 2');
                file.writeFileContent('2.js', 'line 3\nline 4');
                file.getContent().should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });

        describe('write()', function () {
            it('should add content to the output', function () {
                file.write('1');
                file.write('2');
                file.write('3\n');
                file.write('4\n5');
                file.getContent().should.equal('123\n4\n5');
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
                file.getContent().should.equal('line 1\nline 2line 3\nline 4');
            });
        });
    });

    describe('with source map', function () {
        beforeEach(function () {
            file = new File('1.js', { sourceMap: true });
        });

        describe('writeLine()', function () {
            it('should add a new line to the output', function () {
                file.writeLine('line 1');
                file.writeLine('line 2');

                file.getContent().should.equal('line 1\nline 2\n');
            });
        });

        describe('writeContent()', function () {
            it('should add content to the output', function () {
                file.writeContent('line 1\nline 2');
                file.writeContent('line 3\nline 4');

                file.getContent().should.equal('line 1\nline 2\nline 3\nline 4\n');
            });
        });

        describe('write()', function () {
            it('should add content to the output', function () {
                file.write('1');
                file.write('2');
                file.write('3\n');
                file.write('4\n5\n');

                file.getContent().should.equal('123\n4\n5\n');
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

                file.getContent().should.equal('_line 1\nline 2line 3\nline 4');
                toReadableString(file.getSourceMap()).should.equal(
                    [
                        '1, 1 -> 1, 0  2.js',
                        '2, 0 -> 2, 0  2.js',
                        '2, 6 -> 2, 3  3.js',
                        '3, 0 -> 3, 0  3.js'
                    ].join('\n')
                );
            });
        });

        describe('writeFileContent()', function () {
            it('should add content to the output', function () {
                file.writeFileContent('2.js', 'line 1\nline 2');
                file.writeFileContent('2.js', 'line 3\nline 4');
                file.getContent().should.equal('line 1\nline 2\nline 3\nline 4\n');
            });

            describe('with existing source map', function () {
                it('should point to source file', function () {
                    var middleFile = new File('middle-file.js', { sourceMap: true });
                    middleFile.writeFileContent('source.js', 'line');
                    var middleContent = middleFile.render();

                    file.writeFileContent('some-file.js', middleContent);

                    var pos = getOriginalSourceMapPosition({ line: 1, column: 0 }, file.getSourceMap());
                    pos.source.should.equal('source.js');
                    pos.line.should.equal(1);
                    pos.column.should.equal(0);
                });

                it('should save relative path to source file', function () {
                    var middleFile = new File('middle-file.js', { sourceMap: true });
                    middleFile.writeFileContent('../other/path/source.js', 'line');
                    var middleContent = middleFile.render();

                    file.writeFileContent('../some/path/some-file.js', middleContent);

                    var pos = getOriginalSourceMapPosition({ line: 1, column: 0 }, file.getSourceMap());
                    pos.source.should.equal('../some/other/path/source.js');
                });

                it('should save absolute path to source file when passed absolute', function () {
                    var middleFile = new File('middle-file.js', { sourceMap: true });
                    middleFile.writeFileContent('../other/path/source.js', 'line');
                    var middleContent = middleFile.render();

                    file.writeFileContent('/some/path/some-file.js', middleContent);

                    var pos = getOriginalSourceMapPosition({ line: 1, column: 0 }, file.getSourceMap());
                    pos.source.should.equal('/some/other/path/source.js');
                });

                it('should keep absolute source path', function () {
                    var middleFile = new File('middle-file.js', { sourceMap: true });
                    middleFile.writeFileContent('/other/path/source.js', 'line');
                    var middleContent = middleFile.render();

                    file.writeFileContent('/some/path/some-file.js', middleContent);

                    var pos = getOriginalSourceMapPosition({ line: 1, column: 0 }, file.getSourceMap());
                    pos.source.should.equal('/other/path/source.js');
                });

                it('should handle sourceRoot option', function () {
                    var file = new File('1.js', { sourceMap: true, sourceRoot: 'http://example.com/app/js/' });

                    file.writeFileContent('../other/path/source.js', 'line');

                    var pos = getOriginalSourceMapPosition({ line: 1, column: 0 }, file.getSourceMap());
                    pos.source.should.equal('http://example.com/app/other/path/source.js');
                });

                it('should correctly handle column numbers', function () {
                    var css = [
                            '.button',
                            '{',
                            '    vertical-align: middle;',
                            '}'
                        ].join('\n'),
                        map = mkMap_(
                            'middle.css', 'source.css',
                            [[1, 0],      [1, 0]],
                            [[3, 4],      [3, 4]],
                            [[3, 27],     [3, 27]],
                            [[4, 1],      [4, 1]]
                        ),
                        middleContent = utils.joinContentAndSourceMap(css, map);

                    file.writeFileContent('some-file.js', middleContent);

                    var expected = toReadableString(utils.getSourceMap(middleContent)),
                        actual = toReadableString(file.getSourceMap());

                    expected.should.equal(actual);
                });

                function mkMap_(generated, source) {
                    var map = new SourceMapGenerator({ file: generated }),
                        mappings = [].slice.call(arguments, 2);

                    mappings.forEach(function (m) {
                        map.addMapping({
                            source: source,
                            original: { line: m[1][0], column: m[1][1] },
                            generated: { line: m[0][0], column: m[0][1] }
                        });
                    });
                    return map;
                }
            });
        });

        describe('render()', function () {
            it('should produce correct source map', function () {
                file.writeContent('// Hello World');
                file.writeContent('// Some unmapped content');
                file.writeFileContent(
                    'func1.js',
                    [
                        '// anonymous function here',
                        'var f1 = function () {',
                        '    return 1;',
                        '};',
                        '// end of anonymous function',
                        ''
                    ].join('\n')
                );
                file.writeFileContent(
                    'func2.js',
                    [
                        '// named function here',
                        '    function f1() {',
                        '        return 1;',
                        '    }',
                        '// end of named function',
                        ''
                    ].join('\n')
                );

                toReadableString(utils.getSourceMap(file.render())).should.equal(
                    [
                        '3, 0 -> 1, 0  func1.js',
                        '4, 0 -> 2, 0  func1.js',
                        '5, 0 -> 3, 0  func1.js',
                        '6, 0 -> 4, 0  func1.js',
                        '7, 0 -> 5, 0  func1.js',
                        '8, 0 -> 6, 0  func1.js',
                        '9, 0 -> 1, 0  func2.js',
                        '10, 0 -> 2, 0  func2.js',
                        '11, 0 -> 3, 0  func2.js',
                        '12, 0 -> 4, 0  func2.js',
                        '13, 0 -> 5, 0  func2.js',
                        '14, 0 -> 6, 0  func2.js'
                    ].join('\n')
                );
            });
        });
    });

    describe('options', function () {
        var sandbox = sinon.sandbox.create();

        beforeEach(function () {
            sandbox.stub(utils);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should handle old-style useSourceMap second parameter (false)', function () {
            var file = new File('1.js', false);

            file.render();

            return utils.joinContentAndSourceMap.should.not.be.called;
        });

        it('should handle old-style useSourceMap second parameter (true)', function () {
            var file = new File('1.js', true);

            file.render();

            return utils.joinContentAndSourceMap.should.be.called;
        });

        it('should use inline comments by default', function () {
            var file = new File('1.js', { sourceMap: true });

            file.render();

            utils.joinContentAndSourceMap.should.be.calledWithMatch(
                sinon.match.string,
                sinon.match.instanceOf(SourceMapGenerator),
                { comment: 'inline' }
            );
        });

        it('should handle comment option', function () {
            var file = new File('1.js', { sourceMap: true, comment: 'block' });

            file.render();

            utils.joinContentAndSourceMap.should.be.calledWithMatch(
                sinon.match.string,
                sinon.match.instanceOf(SourceMapGenerator),
                { comment: 'block' }
            );
        });
    });

    describe('chaining', function () {
        beforeEach(function () {
            file = new File('1.js', { sourceMap: true });
        });

        it('should support chaining', function () {
            file
                .writeFileContent('2.js', 'line 1')
                .writeLine('line 2')
                .writeContent('line 3')
                .write('line 4\n')
                .writeFileFragment('2.js', 'line 5', 5, 0);

            file.getContent().should.equal('line 1\nline 2\nline 3\nline 4\nline 5');
        });
    });
});

function toReadableString(sourceMap) {
    var consumer = sourceMap instanceof SourceMapConsumer
            ? sourceMap
            : new SourceMapConsumer(sourceMap),
        pieces = [];

    consumer.eachMapping(function (mapping) {
        pieces.push(format('%s, %s -> %s, %s  %s',
            mapping.generatedLine,
            mapping.generatedColumn,
            mapping.originalLine,
            mapping.originalColumn,
            mapping.source
        ));
    });
    return pieces.join('\n');
}

function getOriginalSourceMapPosition(position, sourceMap) {
    return (new SourceMapConsumer(sourceMap)).originalPositionFor(position);
}
