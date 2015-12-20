История изменений
=================

1.9.0
-----

### File

* Добавлена поддержка chaining для `write`-методов ([#13]).

  **Пример:**

  ```js
  file
      .writeFileContent('2.js', 'line 1')
      .writeLine('line 2')
      .writeContent('line 3')
      .write('line 4\n')
      .writeFileFragment('2.js', 'line 5', 5, 0);
  ```

### Зависимости

* Модуль `atob@1.1.2` обновлен до версии `2.0.0`.
* Модуль `source-map@0.4.4` обновлен до версии `0.5.3`.


1.8.0
-----

### File

* Добавлен метод `getSourceMap`.
* Добавлен метод `getContent`.

### Utils

* Метод `joinContentAndSourceMap` теперь может принимать карту кода не только как экземпляр класса `SourceMapGenerator`, но и как JS-объект.

### Зависимости

* Модуль `source-map@0.1.43` обновлен до версии `0.4.4`.

1.7.2
-----

* Исправлено объединение карт кода в методе `writeFileContent` ([#7]).
* Исправлена обработка путей к исходным файлам ([#7]).

1.7.1
-----

* Исправлено чтение коментария с картами кода (source maps) ([#6]).

1.7.0
-----

В класс `File` добавлена опция `comment`. Возможные значения:

* `inline` — `//# sourceMappingURL=...`
* `block` — `/*# sourceMappingURL=...*/`

**Пример:**

```js
new File('path/to/file', { sourceMap: true, comment: 'inline' });
new File('path/to/file', { sourceMap: true, comment: 'block' });
```

1.6.0
-----

* В модуль `utils` добавлен метод `joinContentAndSourceMap`.
* Исправлены незначительные ошибки.

[#13]: https://github.com/enb-make/enb-source-map/pull/13
[#7]: https://github.com/enb-make/enb-source-map/pull/7
[#6]: https://github.com/enb-make/enb-source-map/pull/6
