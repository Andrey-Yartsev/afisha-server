# Afisha Server

## Running

```
node index.js
```

## Настройка параметров парсера

Отладка конкретной записи, конкретной страницы.
Страницы начинаются с единицы. Записи с нуля.

Пример, для отладки 5-й записи 4-й страницы:
```
new AfishaNnovUpdater(models, {
  useOnlyPage: 4,
  useOnlyI: 4
});
```

TODO: сделать проверку useOnlyPage, если она не попадает в скоуп {pages}
