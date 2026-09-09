# Поля, regex, геопоиск, текст, $expr и $jsonSchema

#### $exists: Поле существует (или не существует).

#### $type: Тип поля соответствует указанному.

Пример программного кода:

```python
from pymongo import MongoClient
# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})
# Вставка тестовых данных
collection.insert_many([
    {"name": "Alice", "age": 25, "tags": ["python", "mongodb"]},
    {"name": "Bob", "age": 30, "tags": ["java", "mongodb"]},
    {"name": "Charlie", "age": 35, "tags": ["python", "javascript"]},
    {"name": "David", "age": 40, "tags": ["java", "javascript", "mongodb"]},
    {"name": "Eve", "age": 25, "tags": ["python", "java"]},
    {"name": "Frank", "age": None},  # Поле age существует, но равно None
    {"name": "Grace"}  # Поле age отсутствует
])

# 1. Оператор $exists (Поле существует или не существует)
print("Документы, где поле age существует:")
for doc in collection.find({"age": {"$exists": True}}):
    print(doc)
print("Документы, где поле age не существует:")
for doc in collection.find({"age": {"$exists": False}}):
    print(doc)

# 2. Оператор $type (Тип поля соответствует указанному)
print("Документы, где поле age имеет тип int:")
for doc in collection.find({"age": {"$type": "int"}}):
    print(doc)
print("Документы, где поле age имеет тип null (None):")
for doc in collection.find({"age": {"$type": "null"}}):
    print(doc)
client.close()

```

Вывод:

```python
Документы, где поле age существует:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
{'_id': ObjectId('...'), 'name': 'Frank', 'age': None}
Документы, где поле age не существует:
{'_id': ObjectId('...'), 'name': 'Grace'}
Документы, где поле age имеет тип int:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'tags': ['python', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'tags': ['java', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'tags': ['python', 'javascript']}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'tags': ['java', 'javascript', 'mongodb']}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'tags': ['python', 'java']}
Документы, где поле age имеет тип null (None):
{'_id': ObjectId('...'), 'name': 'Frank', 'age': None}
```

------------------------------------------------------------------------------------------------

1.5. Операторы для работы с регулярными выражениями

#### $regex: Поиск по регулярному выражению.

#### $options: Опции для регулярного выражения (например, i для регистронезависимого поиска).

Пример программного кода:

```python
from pymongo import MongoClient
# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})
# Вставка тестовых данных
collection.insert_many([
    {"name": "Alice", "age": 25, "email": "alice@example.com"},
    {"name": "Bob", "age": 30, "email": "bob@example.com"},
    {"name": "Charlie", "age": 35, "email": "charlie@example.com"},
    {"name": "David", "age": 40, "email": "david@example.com"},
    {"name": "Eve", "age": 25, "email": "eve@example.com"},
    {"name": "Frank", "age": 30, "email": "frank@EXAMPLE.com"}  # Пример для регистронезависимого поиска
])
# 1. Оператор $regex (Поиск по регулярному выражению)
print("Документы, где имя начинается с 'A':")
for doc in collection.find({"name": {"$regex": "^A"}}):
    print(doc)
# 2. Оператор $regex с $options (Регистронезависимый поиск)
print("Документы, где email содержит 'example' (регистронезависимо):")
for doc in collection.find({"email": {"$regex": "example", "$options": "i"}}):
    print(doc)
client.close()

```

Вывод:

```python
Документы, где имя начинается с 'A':
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'email': 'alice@example.com'}

Документы, где email содержит 'example' (регистронезависимо):
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'email': 'alice@example.com'}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'email': 'bob@example.com'}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'email': 'charlie@example.com'}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'email': 'david@example.com'}
{'_id': ObjectId('...'), 'name': 'Eve', 'age': 25, 'email': 'eve@example.com'}
{'_id': ObjectId('...'), 'name': 'Frank', 'age': 30, 'email': 'frank@EXAMPLE.com'}
```

------------------------------------------------------------------------------------------------

1.6. Операторы для работы с геоданными

#### $geoWithin: Находится внутри геометрической фигуры.

#### $geoIntersects: Пересекается с геометрической фигурой.

#### $near: Находится рядом с указанной точкой.

#### $nearSphere: Находится рядом с указанной точкой (сферическая геометрия).

Пример программного кода:

```python
from pymongo import MongoClient
from bson.son import SON
# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})
# Создание геопространственного индекса
collection.create_index([("location", "2dsphere")])

# Вставка тестовых данных с геоданными
collection.insert_many([
    {"name": "Alice", "location": {"type": "Point", "coordinates": [2.3522, 48.8566]}},  # Париж
    {"name": "Bob", "location": {"type": "Point", "coordinates": [13.4050, 52.5200]}},   # Берлин
    {"name": "Charlie", "location": {"type": "Point", "coordinates": [0.1278, 51.5074]}}, # Лондон
    {"name": "David", "location": {"type": "Point", "coordinates": [4.9041, 52.3676]}},  # Амстердам
    {"name": "Eve", "location": {"type": "Point", "coordinates": [12.4964, 41.9028]}}    # Рим
])

# 1. Оператор $geoWithin (Находится внутри геометрической фигуры)
# Пример: Найти все точки внутри прямоугольника
print("Документы, находящиеся внутри прямоугольника (Париж, Берлин, Лондон, Амстердам):")
for doc in collection.find({
    "location": {
        "$geoWithin": {
            "$geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [2.3522, 48.8566],  # Париж
                    [13.4050, 52.5200], # Берлин
                    [0.1278, 51.5074],  # Лондон
                    [4.9041, 52.3676],  # Амстердам
                    [2.3522, 48.8566]   # Париж (замыкаем полигон)
                ]]
            }
        }
    }
}):
    print(doc)

# 2. Оператор $geoIntersects (Пересекается с геометрической фигурой)
# Пример: Найти все точки, пересекающиеся с линией
print("Документы, пересекающиеся с линией (Париж - Берлин):")
for doc in collection.find({
    "location": {
        "$geoIntersects": {
            "$geometry": {
                "type": "LineString",
                "coordinates": [
                    [2.3522, 48.8566],  # Париж
                    [13.4050, 52.5200]  # Берлин
                ]
            }
        }
    }
}):
    print(doc)

# 3. Оператор $near (Находится рядом с указанной точкой)
# Пример: Найти точки рядом с Парижем
print("Документы, находящиеся рядом с Парижем:")
for doc in collection.find({
    "location": {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [2.3522, 48.8566]  # Париж
            },
            "$maxDistance": 1000000  # Расстояние в метрах
        }
    }
}):
    print(doc)

# 4. Оператор $nearSphere (Находится рядом с указанной точкой, сферическая геометрия)
# Пример: Найти точки рядом с Парижем (сферическая геометрия)
print("Документы, находящиеся рядом с Парижем (сферическая геометрия):")
for doc in collection.find({
    "location": {
        "$nearSphere": {
            "$geometry": {
                "type": "Point",
                "coordinates": [2.3522, 48.8566]  # Париж
            },
            "$maxDistance": 1000000  # Расстояние в метрах
        }
    }
}):
    print(doc)

# Закрытие соединения
client.close()

```

Вывод:

```python
Документы, находящиеся внутри прямоугольника (Париж, Берлин, Лондон, Амстердам):
{'_id': ObjectId('...'), 'name': 'Alice', 'location': {'type': 'Point', 'coordinates': [2.3522, 48.8566]}}
{'_id': ObjectId('...'), 'name': 'Bob', 'location': {'type': 'Point', 'coordinates': [13.405, 52.52]}}
{'_id': ObjectId('...'), 'name': 'Charlie', 'location': {'type': 'Point', 'coordinates': [0.1278, 51.5074]}}
{'_id': ObjectId('...'), 'name': 'David', 'location': {'type': 'Point', 'coordinates': [4.9041, 52.3676]}}
Документы, пересекающиеся с линией (Париж - Берлин):
{'_id': ObjectId('...'), 'name': 'Alice', 'location': {'type': 'Point', 'coordinates': [2.3522, 48.8566]}}
{'_id': ObjectId('...'), 'name': 'Bob', 'location': {'type': 'Point', 'coordinates': [13.405, 52.52]}}
Документы, находящиеся рядом с Парижем:
{'_id': ObjectId('...'), 'name': 'Alice', 'location': {'type': 'Point', 'coordinates': [2.3522, 48.8566]}}
{'_id': ObjectId('...'), 'name': 'David', 'location': {'type': 'Point', 'coordinates': [4.9041, 52.3676]}}
Документы, находящиеся рядом с Парижем (сферическая геометрия):
{'_id': ObjectId('...'), 'name': 'Alice', 'location': {'type': 'Point', 'coordinates': [2.3522, 48.8566]}}
{'_id': ObjectId('...'), 'name': 'David', 'location': {'type': 'Point', 'coordinates': [4.9041, 52.3676]}}
```

-----------------------------------------------------------------------------------------------

1.7. Операторы для работы с текстом

#### $text: Поиск по текстовому индексу.

#### $search: Текст для поиска.

#### $language: Язык для текстового поиска.

Пример программного кода:

```python
from pymongo import MongoClient

# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})

# Создание текстового индекса
collection.create_index([("description", "text")])

# Вставка тестовых данных
collection.insert_many([
    {"name": "Alice", "description": "Python developer with experience in MongoDB"},
    {"name": "Bob", "description": "Java developer interested in databases"},
    {"name": "Charlie", "description": "JavaScript developer working with Node.js and MongoDB"},
    {"name": "David", "description": "Full-stack developer with expertise in Python and JavaScript"},
    {"name": "Eve", "description": "Database administrator specializing in MongoDB"}
])

# 1. Текстовый поиск с использованием $text и $search
print("Документы, содержащие слово 'developer':")
for doc in collection.find({
    "$text": {"$search": "developer"}
}):
    print(doc)

# 2. Текстовый поиск с использованием $language (английский язык)
print("Документы, содержащие слово 'database' (английский язык):")
for doc in collection.find({
    "$text": {"$search": "database", "$language": "en"}
}):
    print(doc)

# 3. Текстовый поиск с использованием фразы
print("Документы, содержащие фразу 'Python developer':")
for doc in collection.find({
    "$text": {"$search": "\"Python developer\""}
}):
    print(doc)

# 4. Текстовый поиск с исключением слова
print("Документы, содержащие слово 'developer', но не содержащие слово 'Java':")
for doc in collection.find({
    "$text": {"$search": "developer -Java"}
}):
    print(doc)
client.close()

```

Вывод:

```python
Документы, содержащие слово 'developer':
{'_id': ObjectId('...'), 'name': 'Alice', 'description': 'Python developer with experience in MongoDB'}
{'_id': ObjectId('...'), 'name': 'Bob', 'description': 'Java developer interested in databases'}
{'_id': ObjectId('...'), 'name': 'Charlie', 'description': 'JavaScript developer working with Node.js and MongoDB'}
{'_id': ObjectId('...'), 'name': 'David', 'description': 'Full-stack developer with expertise in Python and JavaScript'}
Документы, содержащие слово 'database' (английский язык):
{'_id': ObjectId('...'), 'name': 'Bob', 'description': 'Java developer interested in databases'}
{'_id': ObjectId('...'), 'name': 'Eve', 'description': 'Database administrator specializing in MongoDB'}
Документы, содержащие фразу 'Python developer':
{'_id': ObjectId('...'), 'name': 'Alice', 'description': 'Python developer with experience in MongoDB'}
Документы, содержащие слово 'developer', но не содержащие слово 'Java':
{'_id': ObjectId('...'), 'name': 'Alice', 'description': 'Python developer with experience in MongoDB'}
{'_id': ObjectId('...'), 'name': 'Charlie', 'description': 'JavaScript developer working with Node.js and MongoDB'}
{'_id': ObjectId('...'), 'name': 'David', 'description': 'Full-stack developer with expertise in Python and JavaScript'}
```

------------------------------------------------------------------------------------------------

1.8. Операторы для работы с выражениями

#### $expr: Позволяет использовать выражения в запросах.

#### $jsonSchema: Валидация документа по JSON Schema.

Пример программного кода:

```python
from pymongo import MongoClient

# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["mycollection"]

# Очистка коллекции перед началом (для чистоты эксперимента)
collection.delete_many({})

# 1. Использование $expr для сравнения полей в запросах
# Вставка тестовых данных
collection.insert_many([
    {"name": "Alice", "age": 25, "salary": 50000},
    {"name": "Bob", "age": 30, "salary": 60000},
    {"name": "Charlie", "age": 35, "salary": 70000},
    {"name": "David", "age": 40, "salary": 80000}
])
# Пример: Найти документы, где salary больше чем age * 1000
print("Документы, где salary > age * 1000:")
for doc in collection.find({
    "$expr": {"$gt": ["$salary", {"$multiply": ["$age", 1000]}]}
}):
    print(doc)

# 2. Использование $jsonSchema для валидации документов
# Создание коллекции с валидацией по JSON Schema
db.create_collection("validated_collection", {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "age"],
            "properties": {
                "name": {
                    "bsonType": "string",
                    "description": "Имя должно быть строкой"
                },
                "age": {
                    "bsonType": "int",
                    "minimum": 0,
                    "description": "Возраст должен быть положительным числом"
                }
            }
        }
    }
})
validated_collection = db["validated_collection"]

# Попытка вставить корректный документ
try:
    validated_collection.insert_one({"name": "Eve", "age": 25})
    print("Документ успешно вставлен.")
except Exception as e:
    print("Ошибка при вставке документа:", e)

# Попытка вставить некорректный документ (отсутствует поле 'age')
try:
    validated_collection.insert_one({"name": "Frank"})
    print("Документ успешно вставлен.")
except Exception as e:
    print("Ошибка при вставке документа:", e)

# Попытка вставить некорректный документ (возраст отрицательный)
try:
    validated_collection.insert_one({"name": "Grace", "age": -5})
    print("Документ успешно вставлен.")
except Exception as e:
    print("Ошибка при вставке документа:", e)
client.close()


```

Вывод:

```python
Документы, где salary > age * 1000:
{'_id': ObjectId('...'), 'name': 'Alice', 'age': 25, 'salary': 50000}
{'_id': ObjectId('...'), 'name': 'Bob', 'age': 30, 'salary': 60000}
{'_id': ObjectId('...'), 'name': 'Charlie', 'age': 35, 'salary': 70000}
{'_id': ObjectId('...'), 'name': 'David', 'age': 40, 'salary': 80000}

Документ успешно вставлен.
Ошибка при вставке документа: ... (ошибка валидации, отсутствует поле 'age')
Ошибка при вставке документа: ... (ошибка валидации, возраст отрицательный)
```

------------------------------------------------------------------------------------------------

Все методы PyMongo

2.1. Методы для работы с коллекциями

CRUD-операции

insert_one(document): Вставляет один документ.

insert_many(documents): Вставляет несколько документов.

find_one(filter): Возвращает первый документ, соответствующий фильтру.

find(filter): Возвращает курсор для всех документов, соответствующих фильтру.

update_one(filter, update): Обновляет один документ.

update_many(filter, update): Обновляет несколько документов.

replace_one(filter, replacement): Заменяет один документ.

delete_one(filter): Удаляет один документ.

delete_many(filter): Удаляет несколько документов.

Агрегации

aggregate(pipeline): Выполняет агрегацию данных.

Индексы

create_index(keys): Создает индекс.

drop_index(index_name): Удаляет индекс.

list_indexes(): Возвращает список индексов.

Прочие методы

count_documents(filter): Возвращает количество документов, соответствующих фильтру.

distinct(field): Возвращает уникальные значения поля.

drop(): Удаляет коллекцию.

rename(new_name): Переименовывает коллекцию.

2.2. Методы для работы с базами данных

list_collection_names(): Возвращает список коллекций.

create_collection(name, options): Создает коллекцию с указанными параметрами.

drop_collection(name): Удаляет коллекцию.

command(command): Выполняет команду базы данных.

2.3. Методы для работы с клиентом (MongoClient)

list_database_names(): Возвращает список баз данных.

drop_database(name): Удаляет базу данных.

get_database(name): Возвращает объект базы данных.

close(): Закрывает соединение с MongoDB.

2.4. Методы для работы с курсорами

Курсоры возвращаются методами find() и aggregate().

next(): Возвращает следующий документ.

limit(n): Ограничивает количество документов.

skip(n): Пропускает указанное количество документов.

sort(key_or_list): Сортирует документы.

count(): Возвращает количество документов в курсоре.

2.5. Методы для работы с GridFS

GridFS используется для хранения больших файлов.

GridFSBucket.upload_from_stream(filename, data): Загружает файл.

GridFSBucket.download_to_stream(file_id, stream): Скачивает файл.

```python
GridFSBucket.delete(file_id): Удаляет файл.

```

2.6. Методы для работы с транзакциями

start_session(): Начинает сессию.

with_transaction(callback): Выполняет транзакцию.
