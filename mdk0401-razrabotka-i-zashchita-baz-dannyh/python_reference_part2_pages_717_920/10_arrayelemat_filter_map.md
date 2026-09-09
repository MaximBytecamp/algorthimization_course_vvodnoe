# Работа с массивами: $arrayElemAt, $filter и $map

#### $arrayElemAt: Возвращает элемент массива по указанному индексу.

Оператор $arrayElemAt возвращает элемент массива по указанному индексу. Это мощный инструмент для работы с массивами в агрегационных пайплайнах и выражениях обновления.

Основные характеристики

Возвращает элемент по индексу (начиная с 0)

Поддерживает отрицательные индексы (-1 - последний элемент)

Возвращает null, если индекс выходит за границы массива

Работает в $project, $addFields, $match и других этапах агрегации

Синтаксис

```python
{ $arrayElemAt: [ <array>, <idx> ] }
```

Подробные примеры использования

Пример 1: Базовое использование

```python
db.students.aggregate([
  {
    $project: {
      name: 1,
      firstScore: { $arrayElemAt: ["$scores", 0] }, // Первый элемент
      lastScore: { $arrayElemAt: ["$scores", -1] }   // Последний элемент
    }
  }
])
```

Входные данные:

```python
{ "_id": 1, "name": "Alice", "scores": [85, 92, 78] }
```

Результат:

```python
{ "_id": 1, "name": "Alice", "firstScore": 85, "lastScore": 78 }
```

Пример 2: Обработка несуществующих индексов

```python
db.test.aggregate([
  {
    $project: {
      value: { $arrayElemAt: [["A", "B", "C"], 5] } // Индекс вне диапазона
    }
  }
])
```

Результат:

```python
{ "_id": 1, "value": null }
```

Пример 3: Комбинация с другими операторами

```python
db.orders.aggregate([
  {
    $project: {
      orderId: 1,
      firstItem: {
        $arrayElemAt: [
          "$items",
          { $subtract: [
            { $size: "$items" }, // Длина массива
            1 // Получаем последний элемент
          ]}
        ]
      }
    }
  }
])
```

Продвинутые сценарии

Сценарий 1: Извлечение данных из вложенных массивов

```python
db.blogposts.aggregate([
  {
    $project: {
      title: 1,
      firstCommentAuthor: {
        $arrayElemAt: [
          "$comments.author", // Обращение к вложенному полю
          0
        ]
      }
    }
  }
])
```

Сценарий 2: Безопасный доступ к элементам

```python
db.products.aggregate([
  {
    $addFields: {
      mainImage: {
        $ifNull: [
          { $arrayElemAt: ["$images", 0] }, // Пытаемся получить первый элемент
          "default.jpg" // Значение по умолчанию
        ]
      }
    }
  }
])
```

Особенности работы

Индексация:

Индекс 0 соответствует первому элементу

Отрицательные индексы отсчитываются с конца (-1 - последний элемент)

Обработка ошибок:

При выходе индекса за границы возвращает null

Если первый аргумент не массив - возвращает null

Производительность:

Не требует полного сканирования массива

Оптимален для доступа к конкретным элементам

Оптимизация использования

Для частого доступа к первым/последним элементам создавайте отдельные поля

Используйте с $ifNull для обработки отсутствующих значений

В сочетании с $slice для получения подмассивов

Альтернативы

$first/$last - для использования в $group

$slice - для получения подмассива

$reduce - для сложной обработки массивов

------------------------------------------------------------------------------------------------

#### $filter: Фильтрует элементы массива на основе условия.

Оператор $filter является частью системы агрегации MongoDB и предназначен для обработки массивов. Он позволяет:

Отбирать элементы массива по заданным критериям

Сохранять исходный порядок элементов

Обрабатывать как простые значения, так и сложные объекты

Синтаксис (полная версия)

```python
{
  $filter: {
    input: <выражение, возвращающее массив>,
    as: <строка>, // имя переменной для элемента (необязательно)
    cond: <выражение>, // условие фильтрации (должно возвращать boolean)
    limit: <число> // максимальное количество элементов (необязательно, MongoDB 5.2+)
  }
}
```

Глубокий разбор параметров

1. Параметр input

Должен возвращать массив

Если возвращает не массив (null, число, строку и т.д.), оператор вернет пустой массив

Может быть:

Прямой ссылкой на поле ("$items")

Выражением, возвращающим массив ($split, $map и др.)

Пример:

input: "$scores" // поле с массивом

input: { $split: ["$tags", ","] } // преобразуем строку в массив

2. Параметр as

Определяет имя переменной для текущего элемента массива

По умолчанию используется "this"

Используется с префиксом $$ в условии (cond)

Пример:

as: "item" // используем $$item в условии

3. Параметр cond

Должен возвращать boolean значение

Может содержать любые логические выражения

Имеет доступ:

К текущему элементу (через переменную из as)

К другим полям документа (через $fieldName)

Пример сложного условия:

```python
cond: {
  $and: [
    { $gte: ["$$item.price", 100] },
    { $lte: ["$$item.price", 500] },
    { $ne: ["$$item.status", "out_of_stock"] }
  ]
}
```

4. Параметр limit (MongoDB 5.2+)

Ограничивает количество элементов в результате

Если подходящих элементов больше - возвращает первые N

Не влияет на порядок элементов

Пример:

limit: 3 // вернет не более 3 элементов

Базовый пример: фильтрация оценок студентов

Входные данные (коллекция students):

```python
[
  {
    "_id": 1,
    "name": "Алексей",
    "scores": [85, 92, 78, 60, 45]
  },
  {
    "_id": 2,
    "name": "Мария",
    "scores": [95, 88, 72, 58, 91]
  }
]
```

Запрос:

```python
db.students.aggregate([
  {
    $project: {
      name: 1,
      goodScores: {
        $filter: {
          input: "$scores",
          as: "score",
          cond: { $gte: ["$$score", 85] }
        }
      }
    }
  }
])
```

Результат:

```python
[
  {
    "_id": 1,
    "name": "Алексей",
    "goodScores": [85, 92]
  },
  {
    "_id": 2,
    "name": "Мария",
    "goodScores": [95, 88, 91]
  }
]
```

2. Фильтрация объектов в массиве (заказы)

Входные данные (коллекция orders):

```python
[
  {
    "_id": 101,
    "customer": "Иван",
    "items": [
      { "name": "Ноутбук", "price": 1200, "inStock": true },
      { "name": "Мышь", "price": 50, "inStock": false },
      { "name": "Клавиатура", "price": 80, "inStock": true }
    ]
  }
]
```

Запрос:

```python
db.orders.aggregate([
  {
    $project: {
      customer: 1,
      availableItems: {
        $filter: {
          input: "$items",
          as: "item",
          cond: { $eq: ["$$item.inStock", true] }
        }
      },
      totalAvailable: {
        $sum: {
          $filter: {
            input: "$items",
            as: "item",
            cond: { $eq: ["$$item.inStock", true] },
            in: "$$item.price"
          }
        }
      }
    }
  }
])
```

Результат:

```python
{
  "_id": 101,
  "customer": "Иван",
  "availableItems": [
    { "name": "Ноутбук", "price": 1200, "inStock": true },
    { "name": "Клавиатура", "price": 80, "inStock": true }
  ],
  "totalAvailable": 1280
}
```

3. Комплексный пример с несколькими условиями

Входные данные (коллекция products):

```python
{
  "_id": 200,
  "name": "Смартфон",
  "reviews": [
    {
      "user": "Ольга",
      "rating": 5,
      "text": "Отличный телефон",
      "verified": true
    },
    {
      "user": "Дмитрий",
      "rating": 3,
      "text": "Средний аппарат",
      "verified": false
    },
    {
      "user": "Анна",
      "rating": 4,
      "text": "Хорошо, но дорого",
      "verified": true
    }
  ]
}
```

Запрос:

```python
db.products.aggregate([
  {
    $project: {
      name: 1,
      topReviews: {
        $filter: {
          input: "$reviews",
          as: "review",
          cond: {
            $and: [
              { $gte: ["$$review.rating", 4] },
              { $eq: ["$$review.verified", true] }
            ]
          },
          limit: 2
        }
      }
    }
  }
])
```

Результат:

```python
{
  "_id": 200,
  "name": "Смартфон",
  "topReviews": [
    {
      "user": "Ольга",
      "rating": 5,
      "text": "Отличный телефон",
      "verified": true
    },
    {
      "user": "Анна",
      "rating": 4,
      "text": "Хорошо, но дорого",
      "verified": true
    }
  ]
}
```

4. Обработка отсутствующих данных

Входные данные:

```python
[
  { "_id": 1, "tags": ["новый", "акция"] },
  { "_id": 2, "tags": null },
  { "_id": 3 }
]
```

Запрос:

```python
db.products.aggregate([
  {
    $project: {
      validTags: {
        $filter: {
          input: { $ifNull: ["$tags", []] },
          cond: { $ne: ["$$this", "акция"] }
        }
      }
    }
  }])
```

Результат:

```python
[
  { "_id": 1, "validTags": ["новый"] },
  { "_id": 2, "validTags": [] },
  { "_id": 3, "validTags": [] }
]
```

Полезные советы

Совмещайте с $map для преобразования отфильтрованных данных:

```python
{
  $map: {
    input: {
      $filter: {
        input: "$items",
        cond: { $gt: ["$$this.price", 100] }
      }
    },
    in: { name: "$$this.name", price: "$$this.price" }
  }
}
```

Используйте $reduce для сложной логики фильтрации:

```python
{
  $reduce: {
    input: "$array",
    initialValue: [],
    in: {
      $cond: [
        { $gt: ["$$this.value", 10] },
        { $concatArrays: ["$$value", ["$$this"]] },
        "$$value"
      ]
    }
  }}
```

Оптимизация:

```python
// Плохо (фильтрация после обработки)
{ $project: { largeArray: 1 } },
{ $filter: ... }

// Хорошо (ранняя фильтрация)
{ $match: { ... } }, // Сначала уменьшаем набор
{ $project: { filtered: { $filter: ... } } }
```

Типичные ошибки

Забыли $$ перед именем переменной:

// Неправильно:

cond: { $gt: ["$item.price", 100] }

// Правильно:

cond: { $gt: ["$$item.price", 100] }

Не обрабатываете null/отсутствующие поля:

// Рискованно:

input: "$tags"

// Безопасно:

input: { $ifNull: ["$tags", []] }

Использование с не-массивами:

// Вернет пустой массив, если "notArray" не массив:

```python
{ $filter: { input: "$notArray", cond: ... } }
```

------------------------------------------------------------------------------------------------

#### $map: Применяет выражение к каждому элементу массива и возвращает новый массив.

Оператор $map применяет заданное выражение к каждому элементу входного массива и возвращает новый массив с результатами. Это мощный инструмент для преобразования данных в массивах без изменения исходных документов.

Синтаксис

```python
{
  $map: {
    input: <массив>,
    as: <имя переменной>, // необязательно
    in: <выражение>
  }
}
```

Пример 1: Простое преобразование массива чисел

Входные данные (students):

```python
{
  "_id": 1,
  "name": "Анна",
  "scores": [85, 92, 78]
}
```

Запрос:

```python
db.students.aggregate([
  {
    $project: {
      name: 1,
      adjustedScores: {
        $map: {
          input: "$scores",
          as: "score",
          in: { $add: ["$$score", 5] } // Добавляем 5 к каждой оценке
        }
      }
    }
  }
])
```

Результат:

```python
{
  "_id": 1,
  "name": "Анна",
  "adjustedScores": [90, 97, 83]
}
```

Пример 2: Преобразование массива объектов

Входные данные (products):

```python
{
  "_id": 101,
  "name": "Ноутбук",
  "variants": [
    { "color": "black", "price": 1200 },
    { "color": "silver", "price": 1250 }
  ]
}
```

Запрос:

```python
db.products.aggregate([
  {
    $project: {
      name: 1,
      discountedVariants: {
        $map: {
          input: "$variants",
          in: {
            color: "$$this.color",
            price: { $multiply: ["$$this.price", 0.9] } // 10% скидка
          }
        }
      }
    }
  }
])
```

Результат:

```python
{
  "_id": 101,
  "name": "Ноутбук",
  "discountedVariants": [
    { "color": "black", "price": 1080 },
    { "color": "silver", "price": 1125 }
  ]
}
```

Пример 3: Комбинация с $filter

Входные данные (orders):

```python
{
  "_id": 1001,
  "items": [
    { "name": "Мышь", "price": 50, "inStock": true },
    { "name": "Клавиатура", "price": 80, "inStock": false },
    { "name": "Монитор", "price": 300, "inStock": true }
  ]
}
```

Запрос:

```python
db.orders.aggregate([
  {
    $project: {
      availableItems: {
        $map: {
          input: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.inStock", true] }
            }
          },
          in: {
            name: "$$this.name",
            priceWithTax: { $multiply: ["$$this.price", 1.2] } // Добавляем 20% налог
          }
        }
      }
    }
  }
])
```

Результат:

```python
{
  "_id": 1001,
  "availableItems": [
    { "name": "Мышь", "priceWithTax": 60 },
    { "name": "Монитор", "priceWithTax": 360 }
  ]
}
```

Продвинутые техники

1. Обработка вложенных структур

Входные данные (departments):

```python
{
  "name": "Разработка",
  "teams": [
    {
      "name": "Frontend",
      "members": [
        { "name": "Алексей", "level": "senior" },
        { "name": "Мария", "level": "junior" }
      ]
    },
    {
      "name": "Backend",
      "members": [
        { "name": "Иван", "level": "middle" }
      ]
    }
  ]
}
```

Запрос:

```python
db.departments.aggregate([
  {
    $project: {
      name: 1,
      teamSummaries: {
        $map: {
          input: "$teams",
          in: {
            teamName: "$$this.name",
            memberCount: { $size: "$$this.members" },
            seniorMembers: {
              $filter: {
                input: "$$this.members",
                cond: { $eq: ["$$this.level", "senior"] }
              }
            }
          }
        }
      }
    }
  }
])
```

Результат:

```python
{
  "name": "Разработка",
  "teamSummaries": [
    {
      "teamName": "Frontend",
      "memberCount": 2,
      "seniorMembers": [{ "name": "Алексей", "level": "senior" }]
    },
    {
      "teamName": "Backend",
      "memberCount": 1,
      "seniorMembers": []
    }
  ]
}
```

2. Использование с $reduce для агрегации

Входные данные (sales):

```python
{
  "month": "Январь",
  "dailySales": [120, 150, 80, 200, 90]
}
```

Запрос:

```python
db.sales.aggregate([
  {
    $project: {
      month: 1,
      dailySales: 1,
      salesAnalysis: {
        $map: {
          input: "$dailySales",
          as: "day",
          in: {
            value: "$$day",
            percentOfAvg: {
              $divide: [
                { $multiply: ["$$day", 100] },
                { $avg: "$dailySales" }
              ]
            }
          }
        }
      }
    }
  }
])
```

Результат:

```python
{
  "month": "Январь",
  "dailySales": [120, 150, 80, 200, 90],
  "salesAnalysis": [
    { "value": 120, "percentOfAvg": 92.3 },
    { "value": 150, "percentOfAvg": 115.4 },
    { "value": 80, "percentOfAvg": 61.5 },
    { "value": 200, "percentOfAvg": 153.8 },
    { "value": 90, "percentOfAvg": 69.2 }
  ]
}
```

Особенности и лучшие практики

Обработка не-массивов:

Если input не массив, вернется ошибка

Используйте $ifNull для обработки null/отсутствующих полей

input: { $ifNull: ["$tags", []] }

Производительность:

Избегайте глубоко вложенных $map

Для больших массивов сначала применяйте $filter

Совместимость:

Доступен начиная с MongoDB 2.6

Некоторые функции (как $reduce) требуют более новых версий

Отладка:

Для сложных преобразований разбивайте на этапы:

```python
{
  $project: {
    step1: { $map: ... },
    step2: { $map: ... }
  }
}
```

Оператор $map незаменим для:

Преобразования элементов массива

Создания новых структур данных на основе существующих

Комплексной обработки вложенных документов

Подготовки данных для визуализации

Для эффективного использования:

Всегда проверяйте тип входных данных

Комбинируйте с $filter для предварительного отбора

Разбивайте сложные преобразования на этапы

Тестируйте на реалистичных объемах данных

------------------------------------------------------------------------------------------------
