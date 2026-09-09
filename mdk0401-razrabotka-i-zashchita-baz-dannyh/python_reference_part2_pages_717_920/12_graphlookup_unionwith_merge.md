# Связи и объединение данных: $graphLookup, $unionWith и $merge

#### $graphLookup: Выполняет рекурсивный поиск в коллекции (например, для иерархических данных).

Оператор $graphLookup позволяет выполнять рекурсивные запросы для работы с иерархическими структурами, такими как:

Организационные структуры (подчиненные → руководители)

Деревья категорий (родитель → дети)

Социальные графы (друзья друзей)

Синтаксис

```python
{
  "$graphLookup": {
    "from": "<collection>",          // Коллекция для поиска
    "startWith": "<expression>",     // Начальные значения для рекурсии
    "connectFromField": "<field>",   // Поле, откуда идёт связь (например, parentId)
    "connectToField": "<field>",     // Поле, куда идёт связь (например, _id)
    "as": "<outputArray>",           // Поле для сохранения результатов
    "maxDepth": <number>,            // Макс. глубина рекурсии (опционально)
    "depthField": "<string>",        // Поле для хранения глубины (опционально)
    "restrictSearchWithMatch": {}    // Дополнительная фильтрация (опционально)
  }
}
```

1. Базовый пример: Организационная структура

Данные (коллекция employees)

```python
[
  { "_id": 1, "name": "Иван", "position": "CEO", "reportsTo": null },
  { "_id": 2, "name": "Мария", "position": "CTO", "reportsTo": 1 },
  { "_id": 3, "name": "Алексей", "position": "Team Lead", "reportsTo": 2 },
  { "_id": 4, "name": "Дарья", "position": "Developer", "reportsTo": 3 },
  { "_id": 5, "name": "Олег", "position": "Developer", "reportsTo": 3 }
]
```

Запрос: Найти всю команду CTO (Марии)

```python
db.employees.aggregate([
  {
    $match: { _id: 2 } // Старт с Марии (CTO)
  },
  {
    $graphLookup: {
      from: "employees",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "reportsTo",
      as: "team",
      depthField: "depth" // Добавляем уровень вложенности
    }
  }
])
```

Результат

```python
{
  "_id": 2,
  "name": "Мария",
  "position": "CTO",
  "reportsTo": 1,
  "team": [
    { "_id": 3, "name": "Алексей", "position": "Team Lead", "reportsTo": 2, "depth": 1 },
    { "_id": 4, "name": "Дарья", "position": "Developer", "reportsTo": 3, "depth": 2 },
    { "_id": 5, "name": "Олег", "position": "Developer", "reportsTo": 3, "depth": 2 }
  ]
}
```

Как это работает:

Начинаем с документа _id: 2 (Мария).

Ищем всех, у кого reportsTo = 2 → Алексей (depth: 1).

Для Алексея ищем reportsTo = 3 → Дарья и Олег (depth: 2).

2. Ограничение глубины (maxDepth)

Запрос: Найти только непосредственных подчиненных

```python
{
  $graphLookup: {
    from: "employees",
    startWith: "$_id",
    connectFromField: "_id",
    connectToField: "reportsTo",
    as: "directReports",
    maxDepth: 1 // Только первый уровень
  }
}
```

Результат

```python
"directReports": [
  { "_id": 3, "name": "Алексей", "position": "Team Lead", "reportsTo": 2, "depth": 1 }
]
```

3. Фильтрация в рекурсии (restrictSearchWithMatch)

Задача: Найти только разработчиков в подчинении

```python
{
  $graphLookup: {
    from: "employees",
    startWith: "$_id",
    connectFromField: "_id",
    connectToField: "reportsTo",
    as: "devTeam",
    restrictSearchWithMatch: { "position": "Developer" } // Только разработчики
  }
}
```

Результат

```python
"devTeam": [
  { "_id": 4, "name": "Дарья", "position": "Developer", "reportsTo": 3 },
  { "_id": 5, "name": "Олег", "position": "Developer", "reportsTo": 3 }
]
```

Социальные связи: Друзья друзей

Данные (коллекция users)

```python
[
  { "_id": 1, "name": "Анна", "friends": [2, 3] },
  { "_id": 2, "name": "Борис", "friends": [4] },
  { "_id": 3, "name": "Сергей", "friends": [5] },
  { "_id": 4, "name": "Дина", "friends": [] },
  { "_id": 5, "name": "Елена", "friends": [1] } // Циклическая связь!
]
```

Запрос: Найти всех друзей до 2-го уровня

```python
db.users.aggregate([
  {
    $match: { _id: 1 } // Старт с Анны
  },
  {
    $graphLookup: {
      from: "users",
      startWith: "$friends",
      connectFromField: "friends",
      connectToField: "_id",
      as: "socialNetwork",
      maxDepth: 2,
      depthField: "level"
    }
  }
])
```

Результат

```python
{
  "_id": 1,
  "name": "Анна",
  "friends": [2, 3],
  "socialNetwork": [
    { "_id": 2, "name": "Борис", "friends": [4], "level": 1 },
    { "_id": 3, "name": "Сергей", "friends": [5], "level": 1 },
    { "_id": 4, "name": "Дина", "friends": [], "level": 2 },
    { "_id": 5, "name": "Елена", "friends": [1], "level": 2 }
  ]
}
```

Примечание: Елена (_id: 5) не попала бы в результаты при maxDepth: 1.

5. Дерево категорий с сортировкой

Данные (коллекция categories)

```python
[
  { "_id": "Electronics", "parent": null, "order": 1 },
  { "_id": "Laptops", "parent": "Electronics", "order": 2 },
  { "_id": "Gaming", "parent": "Laptops", "order": 1 },
  { "_id": "Ultrabooks", "parent": "Laptops", "order": 3 }
]
```

Запрос: Получить всё дерево с сортировкой по order

```python
db.categories.aggregate([
  {
    $match: { parent: null } // Корневая категория
  },
  {
    $graphLookup: {
      from: "categories",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "parent",
      as: "children",
      depthField: "depth"
    }
  },
  {
    $unwind: "$children"
  },
  {
    $sort: { "children.order": 1 }
  },
  {
    $group: {
      _id: "$_id",
      name: { $first: "$_id" },
      children: { $push: "$children" }
    }
  }
])
```

Результат

```python
{
  "_id": "Electronics",
  "name": "Electronics",
  "children": [
    { "_id": "Gaming", "parent": "Laptops", "order": 1, "depth": 2 },
    { "_id": "Laptops", "parent": "Electronics", "order": 2, "depth": 1 },
    { "_id": "Ultrabooks", "parent": "Laptops", "order": 3, "depth": 2 }
  ]
}
```

6. Обход графа с циклическими связями

Данные (коллекция nodes)

```python
[
  { "_id": "A", "links": ["B"] },
  { "_id": "B", "links": ["C"] },
  { "_id": "C", "links": ["A"] } // Цикл: A → B → C → A
]
```

Запрос: Найти все связанные узлы с ограничением глубины

```python
{
  $graphLookup: {
    from: "nodes",
    startWith: "$_id",
    connectFromField: "links",
    connectToField: "_id",
    as: "connectedNodes",
    maxDepth: 3 // Предотвращаем бесконечный цикл
  }
}
```

Результат для _id: "A"

```python
"connectedNodes": [
  { "_id": "B", "links": ["C"] },
  { "_id": "C", "links": ["A"] }
]
```

Производительность и индексы

Для оптимизации $graphLookup создавайте индексы на поля:

```python
// Для организационной структуры
db.employees.createIndex({ "reportsTo": 1 })
// Для социальных связей
db.users.createIndex({ "friends": 1 })
// Для категорий
db.categories.createIndex({ "parent": 1 })
```

Итоговая таблица параметров

| Параметр | Пример значения | Обязательный? | Описание |
| --- | --- | --- | --- |
| from | "employees" | Да | Коллекция для поиска |
| startWith | "$_id" | Да | Начальное значение для рекурсии |
| connectFromField | "_id" | Да | Поле в дочерних документах |
| connectToField | "reportsTo" | Да | Поле в родительских документах |
| as | "team" | Да | Поле для результатов |
| maxDepth | 3 | Нет | Ограничение глубины рекурсии |
| depthField | "level" | Нет | Добавляет поле с уровнем вложенности |
| restrictSearchWithMatch | { "status": "active" } | Нет | Фильтрация документов в рекурсии |

Когда использовать $graphLookup?

Организационные иерархии.

Деревья категорий.

Социальные графы.

Анализ зависимостей (например, микросервисы).

------------------------------------------------------------------------------------------------

#### $unionWith: Объединяет документы из другой коллекции с текущим пайплайном.

Оператор $unionWith позволяет комбинировать результаты текущего пайплайна с документами из другой коллекции. Это аналог UNION ALL в SQL.

Синтаксис

```python
{
  "$unionWith": {
    "coll": "<collection>",       // Коллекция для объединения
    "pipeline": [ <pipeline> ]    // Опциональный пайплайн для обработки данных
  }
}
```

Ключевые особенности

Сохраняет дубликаты (в отличие от UNION в SQL).

Не требует общего schema — коллекции могут иметь разные структуры.

Может содержать вложенный пайплайн для фильтрации/преобразования данных перед объединением.

Пример 1: Простое объединение

Коллекция orders_2023:

```python
[
  { "_id": 1, "product": "Ноутбук", "year": 2023 },
  { "_id": 2, "product": "Мышь", "year": 2023 }
]
```

Коллекция orders_2022:

```python
[
  { "_id": 3, "product": "Клавиатура", "year": 2022 },
  { "_id": 4, "product": "Монитор", "year": 2022 }
]
```

Запрос

```python
db.orders_2023.aggregate([
  {
    $unionWith: {
      coll: "orders_2022" // Простое объединение
    }
  }
])
```

Результат

```python
[
  { "_id": 1, "product": "Ноутбук", "year": 2023 },
  { "_id": 2, "product": "Мышь", "year": 2023 },
  { "_id": 3, "product": "Клавиатура", "year": 2022 },
  { "_id": 4, "product": "Монитор", "year": 2022 }
]
```

Пример 2: Объединение с пайплайном

Объединить заказы за 2022 и 2023 годы, но:

Для 2022 года добавить поле discounted: true

Отфильтровать только дорогие заказы (>500$)

Коллекция orders_2023:

```python
[
  { "_id": 1, "product": "Ноутбук", "price": 1000 },
  { "_id": 2, "product": "Мышь", "price": 50 }
]
```

Коллекция orders_2022:

```python
[
  { "_id": 3, "product": "Клавиатура", "price": 600 },
  { "_id": 4, "product": "Монитор", "price": 300 }
]
```

Запрос

```python
db.orders_2023.aggregate([
  // Этап 1: Фильтрация дорогих заказов 2023
  { $match: { price: { $gt: 500 } } },

  // Этап 2: Объединение с обработанными данными 2022 года
  {
    $unionWith: {
      coll: "orders_2022",
      pipeline: [
        { $addFields: { discounted: true } }, // Добавляем поле
        { $match: { price: { $gt: 500 } }    // Фильтрация
      ]
    }
  }
])
```

Результат

```python
[
  { "_id": 1, "product": "Ноутбук", "price": 1000 },
  { "_id": 3, "product": "Клавиатура", "price": 600, "discounted": true }
]
```

Пример 3: Объединение с группировкой

Подсчитать общее количество заказов по продуктам за все годы.

Запрос

```python
db.orders_2023.aggregate([
  // Объединяем коллекции
  {
    $unionWith: {
      coll: "orders_2022"
    }
  },

  // Группируем по продукту
  {
    $group: {
      _id: "$product",
      totalOrders: { $sum: 1 },
      totalRevenue: { $sum: "$price" }
    }
  }
])
```

Результат

```python
[
  { "_id": "Ноутбук", "totalOrders": 1, "totalRevenue": 1000 },
  { "_id": "Мышь", "totalOrders": 1, "totalRevenue": 50 },
  { "_id": "Клавиатура", "totalOrders": 1, "totalRevenue": 600 },
  { "_id": "Монитор", "totalOrders": 1, "totalRevenue": 300 }
]
```

Сравнение с $lookup

| Особенность | $unionWith | $lookup |
| --- | --- | --- |
| Тип операции | Объединение документов | JOIN между коллекциями |
| Дубликаты | Сохраняются | Исключаются |
| Схема данных | Может отличаться | Требует связи между полями |
| Производительность | Быстрее для больших коллекций | Медленнее из-за JOIN |

Практические кейсы

Агрегация данных за разные периоды:

```python
db.sales_2023.aggregate([
  { $unionWith: "sales_2022" },
  { $group: { _id: "$product", total: { $sum: "$amount" } } }
])
```

Создание единого каталога из нескольких коллекций:

```python
db.electronics.aggregate([
  { $unionWith: { coll: "furniture", pipeline: [{ $addFields: { category: "furniture" } }] } }
])
```

Сравнение метрик:

```python
db.current_stats.aggregate([
  { $unionWith: { coll: "previous_stats", pipeline: [{ $addFields: { period: "previous" } }] } },
  { $sort: { period: 1 } }
])
```

Ограничения

Нет удаления дубликатов — для этого используйте $group после объединения.

Порядок документов — не гарантируется, используйте $sort при необходимости.

Производительность — для очень больших коллекций может потребоваться allowDiskUse: true.

Итог

$unionWith идеален для:

Объединения однотипных данных из разных коллекций. Агрегации данных за разные периоды. Создания комбинированных отчетов.

Всегда проверяйте схему данных — поля могут отличаться в объединяемых коллекциях.

Если _id совпадут при объединении ($unionWith). Дубликаты сохраняются (как в UNION ALL в SQL).

Пример:

Документ { "_id": 1, "name": "A" } из coll1 и { "_id": 1, "name": "B" } из coll2 попадут в результат оба.

Пример для объединения логов:

```python
db.logs_app.aggregate([
  { $match: { severity: "ERROR" } },
  { $unionWith: { coll: "logs_db", pipeline: [{ $match: { level: "critical" } }] } }
])
```

------------------------------------------------------------------------------------------------

#### $merge: Записывает результаты пайплайна в указанную коллекцию (с возможностью обновления или замены).

Оператор $merge позволяет записывать результаты пайплайна в указанную коллекцию с гибкими вариантами обработки данных: добавление, замена, обновление или объединение документов.

Синтаксис

```python
{
  "$merge": {
    "into": "<collection>",        // Целевая коллекция
    "on": "<field(s)>",           // Поля для сопоставления (опционально)
    "whenMatched": "<action>",    // Действие при совпадении
    "whenNotMatched": "<action>"  // Действие при отсутствии совпадений
  }
}
```

| Параметр | Допустимые значения | Описание |
| --- | --- | --- |
| into | Имя коллекции ("users") или { db: "db_name", coll: "coll_name" } | Куда записывать результаты. |
| on | Поле или массив полей ("_id", ["user_id", "date"]) | Ключи для сопоставления документов. По умолчанию — все поля. |
| whenMatched | "replace", "merge", "keepExisting", "fail", пайплайн | Что делать, если документ существует. |
| whenNotMatched | "insert", "discard", "fail" | Что делать, если документ не найден. |

1. Базовый пример: Создание/замена отчета

Исходные данные (коллекция orders):

```python
[
  { "_id": 1, "product": "Ноутбук", "price": 1000, "date": "2023-10-01" },
  { "_id": 2, "product": "Мышь", "price": 50, "date": "2023-10-02" },
  { "_id": 3, "product": "Ноутбук", "price": 1200, "date": "2023-10-03" }
]
```

Пайплайн (агрегация + запись в monthly_report):

```python
db.orders.aggregate([
  {
    $group: {
      _id: "$product",
      totalSales: { $sum: "$price" },
      count: { $sum: 1 }
    }
  },
  {
    $merge: {
      into: "monthly_report",
      whenMatched: "replace",  // Полная замена документов
      whenNotMatched: "insert" // Вставка новых
    }
  }
])
```

Результат (коллекция monthly_report):

```python
[
  { "_id": "Ноутбук", "totalSales": 2200, "count": 2 },
  { "_id": "Мышь", "totalSales": 50, "count": 1 }
]
```

2. Обновление с сохранением полей (merge)

Исходные данные:

Коллекция user_stats (до обновления):

```python
[ { "_id": 101, "name": "Анна", "visits": 5 } ]
Коллекция logs (новые данные):
[ { "user_id": 101, "action": "login" }, { "user_id": 101, "action": "view" } ]
```

Пайплайн:

```python
db.logs.aggregate([
  {
    $group: {
      _id: "$user_id",
      newVisits: { $sum: 1 }
    }
  },
  {
    $merge: {
      into: "user_stats",
      on: "_id",
      whenMatched: "merge",     // Объединение полей
      whenNotMatched: "insert"
    }
  }
])
```

Результат (user_stats):

```python
{ "_id": 101, "name": "Анна", "visits": 5, "newVisits": 2 }
```

Поле name сохранено, newVisits добавлено.

3. Кастомное обновление (арифметика в пайплайне)

Исходные данные:

Коллекция users (до обновления):

```python
[ { "_id": 1, "name": "Иван", "balance": 100 } ]
```

Коллекция transactions (новые операции):

```python
[ { "user_id": 1, "amount": 50 }, { "user_id": 1, "amount": -20 } ]
```

Пайплайн:

```python
db.transactions.aggregate([
  {
    $group: {
      _id: "$user_id",
      total: { $sum: "$amount" }
    }
  },
  {
    $merge: {
      into: "users",
      on: "_id",
      whenMatched: [
        {
          $set: {
            balance: { $add: ["$balance", "$$new.total"] } // $$new — данные из агрегации
          }
        }
      ],
      whenNotMatched: "discard"
    }
  }
])
```

Результат (users):

```python
{ "_id": 1, "name": "Иван", "balance": 130 } // 100 + (50 - 20)
```

4. Условие fail при конфликтах

Пайплайн:

```python
{
  $merge: {
    into: "important_report",
    whenMatched: "fail",       // Вернуть ошибку при совпадении
    whenNotMatched: "insert"
  }
}
```

Если документ с таким _id уже есть — операция прервется с ошибкой.

5. Запись в другую базу данных

Пайплайн:

```python
{
  $merge: {
    into: { db: "analytics", coll: "sales_2023" },
    whenMatched: "replace"
  }
}
```

Как работает on?

Поля для сопоставления документов. По умолчанию — все поля.

Пример:

```python
{
  $merge: {
    into: "results",
    on: ["date", "product"], // Совпадение по двум полям
    whenMatched: "merge"
  }
}
```

Сценарии использования

Ежедневные отчеты
Обновление статистики без перезаписи всей коллекции.

Синхронизация данных
Перенос результатов агрегации в основную коллекцию.

Инкрементальные обновления
Например, подсчет суммы транзакций за день.

Ошибки и как их избежать

| Ошибка | Решение |
| --- | --- |
| Duplicate _id | Укажите on или измените whenMatched |
| Write rights required | Проверьте права на запись |
| Memory limit exceeded | Добавьте allowDiskUse: true |

Сравнение с $out

| Особенность | $merge | $out |
| --- | --- | --- |
| Обновление данных | Да | Нет (полная замена коллекции) |
| Гибкость | Высокая | Низкая |
| Поддержка транзакций | Да | Нет |

------------------------------------------------------------------------------------------------
